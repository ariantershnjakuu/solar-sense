import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { TopBar } from "@/components/TopBar";

type Orientation =
  | "north" | "northeast" | "east" | "southeast"
  | "south" | "southwest" | "west" | "northwest";

type Ternary = "poor" | "average" | "good";
type Shading = "none" | "light" | "moderate" | "heavy";

const SiteVisit = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [orientation, setOrientation] = useState<Orientation>("south");
  const [roofType, setRoofType] = useState<"flat" | "sloped">("sloped");
  const [roofAngle, setRoofAngle] = useState<number>(25);
  const [shading, setShading] = useState<Shading>("light");
  const [insulation, setInsulation] = useState<Ternary>("average");
  const [windows, setWindows] = useState<Ternary>("average");
  const [avgMonthlyKwh, setAvgMonthlyKwh] = useState<number>(350);
  const [notes, setNotes] = useState("");

  const readinessScore = useMemo(() => {
    const orientationScore = ({
      south: 1, southeast: 0.9, southwest: 0.9,
      east: 0.8, west: 0.8,
      northeast: 0.6, northwest: 0.6,
      north: 0.4,
    } as Record<Orientation, number>)[orientation];

    const shadingScore = ({ none: 1, light: 0.9, moderate: 0.75, heavy: 0.5 } as Record<Shading, number>)[shading];
    const angleScore = Math.max(0.6, 1 - Math.abs(30 - (roofAngle || 0)) / 90); // ideal ~30°
    const structureScore = ((insulation === "good" ? 1 : insulation === "average" ? 0.85 : 0.7)
      + (windows === "good" ? 1 : windows === "average" ? 0.85 : 0.7)) / 2;

    return Math.round((orientationScore * 0.35 + shadingScore * 0.35 + angleScore * 0.15 + structureScore * 0.15) * 100);
  }, [orientation, shading, roofAngle, insulation, windows]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) {
      toast.error("Missing lead id");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("site_visits")
        .insert({
          lead_id: leadId,
          orientation,
          roof_type: roofType,
          roof_angle: roofAngle,
          shading,
          insulation_quality: insulation,
          windows_quality: windows,
          avg_monthly_kwh: avgMonthlyKwh,
          notes: notes || null,
          readiness_score: readinessScore,
        })
        .select("id")
        .single();
      if (error) throw error;
      toast.success("Visit recorded. Generating report…");
      navigate(`/solar-report/${leadId}`, { state: { siteVisitId: data?.id } });
    } catch (err: any) {
      toast.error(err.message || "Failed to save visit");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <TopBar showBack backTo="/lead" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>On-Site Energy Readiness Checklist</CardTitle>
              <CardDescription>15-minute visit to assess solar readiness</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSave}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="orientation">Orientation</Label>
                    <Select value={orientation} onValueChange={(v) => setOrientation(v as Orientation)}>
                      <SelectTrigger id="orientation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="south">South</SelectItem>
                        <SelectItem value="southeast">South-East</SelectItem>
                        <SelectItem value="southwest">South-West</SelectItem>
                        <SelectItem value="east">East</SelectItem>
                        <SelectItem value="west">West</SelectItem>
                        <SelectItem value="northeast">North-East</SelectItem>
                        <SelectItem value="northwest">North-West</SelectItem>
                        <SelectItem value="north">North</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">South-facing roofs perform best in most regions.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="roofType">Roof type</Label>
                    <Select value={roofType} onValueChange={(v) => setRoofType(v as "flat" | "sloped")}>
                      <SelectTrigger id="roofType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flat">Flat</SelectItem>
                        <SelectItem value="sloped">Sloped</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Flat roofs often use tilted racks for optimal angle.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="roofAngle">Roof angle (°)</Label>
                    <Input
                      id="roofAngle"
                      type="number"
                      placeholder="e.g. 25"
                      value={roofAngle}
                      onChange={(e) => setRoofAngle(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">Around 30° is ideal; accuracy within ±5° is fine.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="shading">Shading</Label>
                    <Select value={shading} onValueChange={(v) => setShading(v as Shading)}>
                      <SelectTrigger id="shading">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="light">Light</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="heavy">Heavy</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Trees and nearby buildings reduce output.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avgMonthlyKwh">Avg. electricity use (kWh/month)</Label>
                    <Input
                      id="avgMonthlyKwh"
                      type="number"
                      placeholder="e.g. 350"
                      value={avgMonthlyKwh}
                      onChange={(e) => setAvgMonthlyKwh(Number(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">From recent bills; rough estimate is okay.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="insulation">Insulation quality</Label>
                    <Select value={insulation} onValueChange={(v) => setInsulation(v as Ternary)}>
                      <SelectTrigger id="insulation">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Better insulation lowers required system size.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="windows">Windows quality</Label>
                    <Select value={windows} onValueChange={(v) => setWindows(v as Ternary)}>
                      <SelectTrigger id="windows">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="poor">Poor</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Double/triple glazing improves efficiency.</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm">
                    Solar Readiness Score: <span className="font-semibold">{readinessScore}%</span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Tip: South, low shading, and roof angles ~30° improve results.
                  </p>
                </div>

                <div className="h-4" />
                <div className="sticky bottom-0 left-0 right-0 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70 border-t border-border -mx-6 px-6 py-4 z-10">
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Readiness</span>{" "}
                      <span className="font-semibold">{readinessScore}%</span>
                    </div>
                    <Button type="submit" className="bg-gradient-primary hover:opacity-90" disabled={saving}>
                      {saving ? "Saving..." : "Save visit and generate report"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SiteVisit;


