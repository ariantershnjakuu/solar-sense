import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { auditData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log("Generating advice for audit:", auditData);

    // Calculate estimated consumption
    const heatingKwh = calculateHeating(auditData);
    const dhwKwh = calculateDHW(auditData);
    const appliancesKwh = 150; // Average baseline

    const totalKwh = heatingKwh + dhwKwh + appliancesKwh;
    const score = calculateScore(auditData, totalKwh);

    // Build AI prompt
    const prompt = `You are SolarSense, an energy efficiency advisor for Kosovo households and SMEs.

Profile:
- Location: ${auditData.city}
- Dwelling: ${auditData.dwelling_type}
- Heating: ${auditData.heating_type}
- Thermostat: ${auditData.thermostat_setpoint}°C
- Hot water: ${auditData.water_heater} ${auditData.water_tank_liters ? `(${auditData.water_tank_liters}L)` : ""}
- Curtains: ${auditData.curtains}
- Insulation: ${auditData.insulation_level}
- Estimated monthly consumption: ${totalKwh.toFixed(0)} kWh

Generate 8-10 prioritized energy-saving actions. Focus on:
1. Behavior changes (low cost, high impact)
2. Quick wins (draft sealing, curtain usage)
3. Heating/DHW optimization
4. Safety-first recommendations

Return JSON array with this structure:
[{
  "code": "ACTION_CODE",
  "title": "Action title",
  "why": "Brief explanation of why this helps (1-2 sentences)",
  "how": "Practical implementation steps with specific times/values",
  "savings": {"kwh_low": 10, "kwh_mid": 15, "kwh_high": 20, "eur_mid": 3},
  "difficulty": 2,
  "comfort": 3,
  "safety": "Optional safety note"
}]

Safety rules:
- Boiler temp: 55-65°C only
- Heating setpoint: 20-21°C recommended
- Never suggest unsafe DIY electrical work`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("AI API error:", aiResponse.status, errorText);
      throw new Error(`AI API error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let advice = [];

    try {
      const content = aiData.choices[0].message.content;
      const parsed = JSON.parse(content);
      advice = Array.isArray(parsed) ? parsed : parsed.actions || [];
    } catch (e) {
      console.error("Failed to parse AI response:", e);
      // Fallback to mock data
      advice = getMockAdvice(auditData);
    }

    return new Response(
      JSON.stringify({
        advice,
        score,
        endUse: {
          heating_kwh: heatingKwh,
          dhw_kwh: dhwKwh,
          appliances_kwh: appliancesKwh,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function calculateHeating(audit: any): number {
  let baseKwh = 300; // Base heating for apartment
  
  if (audit.dwelling_type === "house") baseKwh = 450;
  if (audit.dwelling_type === "office") baseKwh = 350;
  
  // Adjust for setpoint
  if (audit.thermostat_setpoint > 21) {
    baseKwh *= 1 + ((audit.thermostat_setpoint - 21) * 0.06);
  }
  
  // Adjust for insulation
  if (audit.insulation_level === "poor") baseKwh *= 1.3;
  if (audit.insulation_level === "good") baseKwh *= 0.8;
  
  return Math.round(baseKwh);
}

function calculateDHW(audit: any): number {
  if (audit.water_heater === "instant") return 80;
  if (audit.water_heater === "solar") return 40;
  
  const tankSize = audit.water_tank_liters || 100;
  return Math.round(tankSize * 0.6); // Rough estimate
}

function calculateScore(audit: any, totalKwh: number): number {
  let score = 100;
  
  if (audit.thermostat_setpoint > 21) score -= (audit.thermostat_setpoint - 21) * 5;
  if (audit.curtains === "none") score -= 5;
  if (audit.insulation_level === "poor") score -= 15;
  if (totalKwh > 500) score -= 10;
  
  return Math.max(40, Math.min(100, Math.round(score)));
}

function getMockAdvice(audit: any): any[] {
  return [
    {
      code: "SETPOINT_20_21",
      title: "Lower thermostat to 20-21°C",
      why: "Each degree reduction saves ~6% on heating costs without major comfort loss.",
      how: `Reduce your thermostat from ${audit.thermostat_setpoint}°C to 21°C. Wear a light sweater indoors during colder months.`,
      savings: { kwh_low: 15, kwh_mid: 20, kwh_high: 25, eur_mid: 4 },
      difficulty: 1,
      comfort: 3,
    },
    {
      code: "CURTAINS_DUSK",
      title: "Close curtains at dusk",
      why: "Heavy curtains reduce heat loss through windows by up to 25%.",
      how: "Close all curtains around sunset (typically 17:00-18:00 in winter) to retain warmth. Open them in morning sunlight.",
      savings: { kwh_low: 8, kwh_mid: 12, kwh_high: 15, eur_mid: 2 },
      difficulty: 1,
      comfort: 5,
    },
    {
      code: "DHW_OFFPEAK",
      title: "Heat water during off-peak hours",
      why: "Shifting hot water heating to 22:00-06:00 reduces costs with time-of-use tariffs.",
      how: "Install a timer on your water heater to run only during 22:00-06:00. Tank insulation keeps water hot throughout the day.",
      savings: { kwh_low: 10, kwh_mid: 18, kwh_high: 25, eur_mid: 3 },
      difficulty: 2,
      comfort: 5,
      safety: "Have a licensed electrician install the timer to avoid electrical hazards.",
    },
  ];
}
