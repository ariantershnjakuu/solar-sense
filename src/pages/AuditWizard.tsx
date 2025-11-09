import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { TopBar } from "@/components/TopBar";
import BasicInfoStep from "@/components/audit/BasicInfoStep";
import HeatingStep from "@/components/audit/HeatingStep";
import WaterStep from "@/components/audit/WaterStep";
import InsulationStep from "@/components/audit/InsulationStep";
import OccupancyStep from "@/components/audit/OccupancyStep";
import PhotoUploadStep from "@/components/audit/PhotoUploadStep";

const STEPS = [
  { id: "basic", title: "Basic Info", component: BasicInfoStep },
  { id: "heating", title: "Heating", component: HeatingStep },
  { id: "water", title: "Hot Water", component: WaterStep },
  { id: "insulation", title: "Insulation", component: InsulationStep },
  { id: "occupancy", title: "Occupancy", component: OccupancyStep },
  { id: "photo", title: "Photo Audit", component: PhotoUploadStep },
];

const AuditWizard = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [auditId, setAuditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    city: "",
    address: "",
    dwelling_type: "apartment" as const,
    roof_type: "flat" as const,
    heating_type: "electric" as const,
    water_heater: "electric_tank" as const,
    water_tank_liters: 100,
    thermostat_setpoint: 21,
    curtains: "light" as const,
    insulation_level: "average" as const,
    occupancy: { wake: "07:00", leave: "08:00", return: "18:00", sleep: "23:00" },
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const updateFormData = (data: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Create or update audit
      const {
        city,
        address,
        dwelling_type,
        roof_type,
        heating_type,
        water_heater,
        water_tank_liters,
        thermostat_setpoint,
        curtains,
        insulation_level,
        occupancy,
      } = formData;

      // Only send columns that exist in the audits table (avoid 400 from unknown keys like photoFile)
      const insertPayload = {
        user_id: user.id,
        city: city || null,
        address: address || null,
        dwelling_type,
        roof_type,
        heating_type,
        water_heater,
        water_tank_liters: typeof water_tank_liters === "number" ? water_tank_liters : null,
        thermostat_setpoint: typeof thermostat_setpoint === "number" ? thermostat_setpoint : null,
        curtains,
        insulation_level,
        occupancy: occupancy || null,
        weather: { tmin: -2, tmax: 6 },
        tariff: { offpeak: "22:00-06:00" },
      };

      const { data: audit, error: auditError } = await supabase
        .from("audits")
        .insert(insertPayload)
        .select()
        .single();

      if (auditError) throw auditError;

      toast.success("Audit submitted! Generating your personalized report...");
      navigate(`/results/${audit.id}`);
    } catch (error: any) {
      // Surface more details if available
      const message = error?.message || "Failed to submit audit";
      const details = error?.details || error?.hint;
      console.error("Audit insert failed:", error);
      toast.error(details ? `${message}: ${details}` : message);
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;
  const CurrentStepComponent = STEPS[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-hero">
      <TopBar showBack backTo="/" />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <CardTitle className="text-2xl">Energy Audit</CardTitle>
                <span className="text-sm text-muted-foreground">
                  Step {currentStep + 1} of {STEPS.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <CardDescription className="mt-4">
                {STEPS[currentStep].title}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <CurrentStepComponent formData={formData} updateFormData={updateFormData} />

              <div className="h-4" />
              <div className="sticky bottom-0 left-0 right-0 bg-card/90 backdrop-blur supports-[backdrop-filter]:bg-card/70 border-t border-border pt-4 -mx-6 px-6 z-10">
                <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleBack}
                  disabled={currentStep === 0 || loading}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={loading}
                  className="bg-gradient-primary hover:opacity-90"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : currentStep === STEPS.length - 1 ? (
                    "Generate Report"
                  ) : (
                    <>
                      Next
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AuditWizard;
