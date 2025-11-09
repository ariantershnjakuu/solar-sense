import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Sun } from "lucide-react";
import logo from "@/assets/solar-sense-removebg-preview.png";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type Audit = {
  id: string;
  city: string | null;
  address: string | null;
  dwelling_type: string | null;
  roof_type: string | null;
};

const cityFactor = (city?: string | null) => {
  if (!city) return 1;
  const c = city.toLowerCase();
  if (c.includes("pristina") || c.includes("prishtina") || c.includes("prizren") || c.includes("gjakova")) return 1.0;
  return 0.95;
};

const roofAreaByDwelling = (dwelling?: string | null) => {
  if (dwelling === "house") return 60;
  if (dwelling === "office") return 100;
  return 30; // apartment default usable area
};

const tiltFactorByRoof = (roof?: string | null) => {
  if (roof === "sloped") return 1.0;
  return 0.9; // flat arrays need mounting/spacing
};

const SolarPotential = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<Audit | null>(null);
  const [persistedId, setPersistedId] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const run = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase.from("audits").select("*").eq("id", id).single();
        if (error) throw error;
        setAudit(data as any);
      } catch (err: any) {
        toast.error(err.message || "Failed to load audit");
        navigate("/audit");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  const numbers = useMemo(() => {
    if (!audit) return null;
    const area = roofAreaByDwelling(audit.dwelling_type);
    const densityKwPerM2 = 0.17; // ~170 Wp per m² including spacing
    const sysSizeByArea = area * densityKwPerM2 * tiltFactorByRoof(audit.roof_type);
    const system_size_kw = Math.round(Math.max(2, Math.min(sysSizeByArea, 8)) * 10) / 10; // clamp 2–8 kW

    const kwhPerKwYearBase = 1200; // regional average
    const annual_production_kwh = Math.round(system_size_kw * kwhPerKwYearBase * cityFactor(audit.city));

    const costPerKwLow = 900;
    const costPerKwHigh = 1200;
    const cost_low = Math.round(system_size_kw * costPerKwLow);
    const cost_high = Math.round(system_size_kw * costPerKwHigh);

    const pricePerKwh = 0.12;
    const annual_savings_eur = Math.round(annual_production_kwh * pricePerKwh);
    const payback_years = Math.max(2.5, Math.round(((cost_low + cost_high) / 2 / Math.max(annual_savings_eur, 1)) * 10) / 10);

    const co2_tons = Math.round(annual_production_kwh * 0.0006 * 10) / 10;

    return {
      system_size_kw,
      annual_production_kwh,
      cost_low,
      cost_high,
      annual_savings_eur,
      payback_years,
      co2_tons,
    };
  }, [audit]);

  useEffect(() => {
    const persist = async () => {
      if (!id || !audit || !numbers) return;
      try {
        const { error, data } = await supabase
          .from("solar_assessments")
          .insert({
            audit_id: id,
            input: {
              city: audit.city,
              address: audit.address,
              dwelling_type: audit.dwelling_type,
              roof_type: audit.roof_type,
            },
            potential: {
              system_size_kw: numbers.system_size_kw,
              annual_production_kwh: numbers.annual_production_kwh,
            },
            economics: {
              cost_low: numbers.cost_low,
              cost_high: numbers.cost_high,
              annual_savings_eur: numbers.annual_savings_eur,
              payback_years: numbers.payback_years,
            },
            impact: {
              co2_saved_tons_per_year: numbers.co2_tons,
            },
          })
          .select("id")
          .single();
        if (error) throw error;
        setPersistedId(data?.id || null);
      } catch (err: any) {
        // Non-blocking: show but still render
        toast.error(err.message || "Failed to save solar assessment");
      }
    };
    persist();
  }, [id, audit, numbers]);

  if (loading || !audit || !numbers) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="bg-card border-border p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Checking your solar potential…</p>
        </Card>
      </div>
    );
  }

  const handleDownloadPdf = async () => {
    try {
      const node = reportRef.current;
      if (!node) return;
      // Increase scale for sharper PDF
      const canvas = await html2canvas(node, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#0b0e16", // approximate bg-gradient-hero base for consistency
      });
      const imgData = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
      });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      const fileName = `solar-potential-${audit.city || "report"}-${new Date().toISOString().slice(0, 10)}.pdf`;
      pdf.save(fileName);
    } catch (err: any) {
      toast.error(err?.message || "Failed to generate PDF");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between print:hidden">
        <img src={logo} alt="SolarSense" className="h-12" />
        <Button variant="outline" onClick={() => navigate(`/results/${id}`)}>Back to Results</Button>
      </header>

      <div className="container mx-auto px-4 py-8" ref={reportRef}>
        <div className="max-w-5xl mx-auto space-y-8">
          <Card className="bg-gradient-card border-border shadow-glow-primary">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Solar Potential Overview</h2>
              <p className="text-muted-foreground">
                {audit.city || "Your area"} average sunlight and roof assumptions used for this estimate.
              </p>
              {persistedId && (
                <p className="text-xs text-muted-foreground mt-2">Assessment saved (#{persistedId}).</p>
              )}
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">System Size</CardTitle>
                <CardDescription>Estimated</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{numbers.system_size_kw} kW</CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Annual Production</CardTitle>
                <CardDescription>Energy generated</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{numbers.annual_production_kwh} kWh</CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Payback</CardTitle>
                <CardDescription>Estimated years</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{numbers.payback_years} yrs</CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Economics</CardTitle>
              <CardDescription>Installed cost and annual savings</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Cost range</div>
                <div className="text-2xl font-semibold">€{numbers.cost_low}–€{numbers.cost_high}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Annual savings</div>
                <div className="text-2xl font-semibold">~€{numbers.annual_savings_eur}/year</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">CO₂ reduced</div>
                <div className="text-2xl font-semibold">{numbers.co2_tons} tons/year</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 print:hidden">
            <Button className="bg-gradient-primary hover:opacity-90" onClick={handleDownloadPdf}>
              <Sun className="mr-2 h-5 w-5" />
              Download PDF
            </Button>
            <Button variant="outline" onClick={() => navigate("/plan")}>
              Create action plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarPotential;


