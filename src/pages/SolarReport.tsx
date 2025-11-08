import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Sun } from "lucide-react";
import logo from "@/assets/sparxai-logo.svg";

type SiteVisit = {
  id: string;
  readiness_score: number | null;
  avg_monthly_kwh: number | null;
  shading: string | null;
  orientation: string | null;
  roof_angle: number | null;
};

const shadingFactor = (shading: string | null) => {
  if (shading === "none") return 1;
  if (shading === "light") return 0.9;
  if (shading === "moderate") return 0.75;
  if (shading === "heavy") return 0.5;
  return 0.85;
};

const SolarReport = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { siteVisitId?: string } };
  const [loading, setLoading] = useState(true);
  const [siteVisit, setSiteVisit] = useState<SiteVisit | null>(null);
  const [reportId, setReportId] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      if (!leadId) return;
      setLoading(true);
      try {
        let visit: SiteVisit | null = null;
        if (location.state?.siteVisitId) {
          const { data, error } = await supabase
            .from("site_visits")
            .select("*")
            .eq("id", location.state.siteVisitId)
            .single();
          if (error) throw error;
          visit = data as any;
        } else {
          const { data, error } = await supabase
            .from("site_visits")
            .select("*")
            .eq("lead_id", leadId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          if (error) throw error;
          visit = data as any;
        }
        if (!visit) {
          toast.error("No site visit found for this lead.");
          navigate(`/site-visit/${leadId}`);
          return;
        }
        setSiteVisit(visit);

        // Compute quick economics
        const monthlyKwh = visit.avg_monthly_kwh || 350;
        const dailyKwh = monthlyKwh / 30;
        const peakSunHours = 4; // coarse default
        const perfFactor = 1.2; // inverter+temp losses
        const sizeKw = Math.max(1.5, Math.round(((dailyKwh / peakSunHours) * perfFactor) * 10) / 10);
        const shade = shadingFactor(visit.shading);
        const annualProduction = sizeKw * 1200 * shade; // kWh/year
        const pricePerKwh = 0.12; // €
        const annualSavings = annualProduction * pricePerKwh;
        const costPerKwLow = 900;
        const costPerKwHigh = 1200;
        const costLow = sizeKw * costPerKwLow;
        const costHigh = sizeKw * costPerKwHigh;
        const costMid = (costLow + costHigh) / 2;
        const payback = Math.max(2.5, Math.round((costMid / Math.max(annualSavings, 1)) * 10) / 10);
        const co2FactorTonsPerKwh = 0.0006; // 0.6 kg CO2/kWh
        const co2Tons = Math.round(annualProduction * co2FactorTonsPerKwh * 10) / 10;

        const suggestions = [
          { title: "Optimize shading", detail: "Trim nearby trees to increase annual yield.", when: "Before install" },
          { title: "Seal windows/insulation", detail: "Improve envelope to reduce overall demand.", when: "Anytime" },
          { title: "Smart usage shift", detail: "Run appliances during sunny hours for best self-consumption.", when: "After install" },
        ];

        // Persist report
        const { data: created, error: createErr } = await supabase
          .from("solar_reports")
          .insert({
            lead_id: leadId,
            site_visit_id: visit.id,
            system_size_kw: sizeKw,
            cost_low: Math.round(costLow),
            cost_high: Math.round(costHigh),
            payback_years: payback,
            co2_saved_tons_per_year: co2Tons,
            suggestions,
          })
          .select("id")
          .single();
        if (createErr) throw createErr;
        setReportId(created.id);
      } catch (err: any) {
        toast.error(err.message || "Failed to generate report");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [leadId]);

  const numbers = useMemo(() => {
    if (!siteVisit) return null;
    const monthlyKwh = siteVisit.avg_monthly_kwh || 350;
    const dailyKwh = monthlyKwh / 30;
    const peakSunHours = 4;
    const perfFactor = 1.2;
    const sizeKw = Math.max(1.5, Math.round(((dailyKwh / peakSunHours) * perfFactor) * 10) / 10);
    const shade = shadingFactor(siteVisit.shading);
    const annualProduction = sizeKw * 1200 * shade;
    const pricePerKwh = 0.12;
    const annualSavings = annualProduction * pricePerKwh;
    const costPerKwLow = 900;
    const costPerKwHigh = 1200;
    const costLow = sizeKw * costPerKwLow;
    const costHigh = sizeKw * costPerKwHigh;
    const costMid = (costLow + costHigh) / 2;
    const payback = Math.max(2.5, Math.round((costMid / Math.max(annualSavings, 1)) * 10) / 10);
    const co2Tons = Math.round(annualProduction * 0.0006 * 10) / 10;
    return { sizeKw, costLow, costHigh, payback, co2Tons, annualProduction, annualSavings };
  }, [siteVisit]);

  if (loading || !numbers) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="bg-card border-border p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Preparing your solar report…</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <img src={logo} alt="sparxAI" className="h-12" />
        <Button variant="outline" onClick={() => navigate("/")}>Home</Button>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Card className="bg-gradient-card border-border shadow-glow-primary">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-2">Solar Readiness Score</h2>
              <div className="text-7xl font-bold text-accent mb-2">{siteVisit?.readiness_score ?? 0}</div>
              <Progress value={siteVisit?.readiness_score ?? 0} className="h-3 mb-2" />
              <p className="text-muted-foreground">Higher scores indicate better roof/usage conditions for solar</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Estimated System Size</CardTitle>
                <CardDescription>Right-sized for your usage</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{numbers.sizeKw} kW</CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Cost Range</CardTitle>
                <CardDescription>Installed, after VAT</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">€{Math.round(numbers.costLow)}–€{Math.round(numbers.costHigh)}</CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg">Payback Time</CardTitle>
                <CardDescription>At current energy prices</CardDescription>
              </CardHeader>
              <CardContent className="text-3xl font-bold">{numbers.payback} years</CardContent>
            </Card>
          </div>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Impact</CardTitle>
              <CardDescription>Annual estimated benefits</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Energy produced</div>
                <div className="text-2xl font-semibold">{Math.round(numbers.annualProduction)} kWh/year</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Savings</div>
                <div className="text-2xl font-semibold">~€{Math.round(numbers.annualSavings)}/year</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">CO₂ reduced</div>
                <div className="text-2xl font-semibold">{numbers.co2Tons} tons/year</div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button className="bg-gradient-primary hover:opacity-90">
              <Sun className="mr-2 h-5 w-5" />
              Share PDF (coming soon)
            </Button>
            <Button variant="outline" onClick={() => navigate(`/site-visit/${leadId}`)}>
              Update checklist
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolarReport;


