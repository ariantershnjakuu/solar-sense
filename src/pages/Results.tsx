import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Loader2, Zap, Flame, Droplet, Home, ArrowRight, Sun } from "lucide-react";
import logo from "@/assets/sparxai-logo.svg";

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [audit, setAudit] = useState<any>(null);
  const [advice, setAdvice] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchAudit();
    }
  }, [id]);

  const fetchAudit = async () => {
    try {
      const { data, error } = await supabase
        .from("audits")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      setAudit(data);

      // If advice not yet generated, call AI
      if (!data.advice) {
        await generateAdvice(data);
      } else {
        setAdvice(Array.isArray(data.advice) ? data.advice : []);
        setLoading(false);
      }
    } catch (error: any) {
      toast.error(error.message);
      navigate("/audit");
    }
  };

  const generateAdvice = async (auditData: any) => {
    try {
      const response = await supabase.functions.invoke("generate-advice", {
        body: { auditData },
      });

      if (response.error) throw response.error;

      const { advice: generatedAdvice, score, endUse } = response.data;

      // Update audit with generated data
      const { error: updateError } = await supabase
        .from("audits")
        .update({
          advice: generatedAdvice,
          score,
          end_use: endUse,
        })
        .eq("id", id);

      if (updateError) throw updateError;

      setAdvice(generatedAdvice);
      setAudit((prev: any) => ({ ...prev, score, end_use: endUse, advice: generatedAdvice }));
    } catch (error: any) {
      toast.error("Failed to generate advice: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty <= 2) return "bg-green-500";
    if (difficulty <= 3) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-orange-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="bg-card border-border p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Analyzing your energy profile...</p>
          <p className="text-muted-foreground mt-2">Our AI is generating personalized recommendations</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container mx-auto px-4 py-6">
        <img src={logo} alt="sparxAI" className="h-12" />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Score Card */}
          <Card className="bg-gradient-card border-border shadow-glow-primary">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Your sparxScore</h2>
              <div className={`text-7xl font-bold ${getScoreColor(audit?.score || 0)} mb-4`}>
                {audit?.score || 0}
              </div>
              <Progress value={audit?.score || 0} className="h-3 mb-4" />
              <p className="text-muted-foreground">
                {audit?.score >= 80
                  ? "Excellent! Your energy efficiency is above average."
                  : audit?.score >= 60
                  ? "Good progress, but there's room for improvement."
                  : "Significant savings potential identified!"}
              </p>
            </CardContent>
          </Card>

          {/* End Use Breakdown */}
          {audit?.end_use && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Energy Consumption Breakdown</CardTitle>
                <CardDescription>Estimated monthly usage by category</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span>Space Heating</span>
                      <span className="font-semibold">{audit.end_use.heating_kwh || 0} kWh</span>
                    </div>
                    <Progress value={60} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Droplet className="h-5 w-5 text-blue-500" />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span>Hot Water</span>
                      <span className="font-semibold">{audit.end_use.dhw_kwh || 0} kWh</span>
                    </div>
                    <Progress value={25} />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Zap className="h-5 w-5 text-accent" />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span>Appliances & Other</span>
                      <span className="font-semibold">{audit.end_use.appliances_kwh || 0} kWh</span>
                    </div>
                    <Progress value={15} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendations */}
          <div>
            <h2 className="text-3xl font-bold mb-4">Personalized Recommendations</h2>
            <p className="text-muted-foreground mb-6">
              Prioritized actions to reduce your energy consumption and costs
            </p>

            <div className="space-y-4">
              {advice.map((action: any, index: number) => (
                <Card key={index} className="bg-card border-border hover:border-primary transition-colors">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold">{action.title}</h3>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={getDifficultyColor(action.difficulty)}>
                          Difficulty: {action.difficulty}/5
                        </Badge>
                        {action.safety && (
                          <Badge variant="destructive">Safety Note</Badge>
                        )}
                      </div>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">{action.why}</p>
                    
                    <div className="bg-muted/50 rounded-lg p-3 mb-3">
                      <p className="text-sm font-semibold mb-1">How to implement:</p>
                      <p className="text-sm">{action.how}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-4 text-sm">
                        <span className="text-accent font-semibold">
                          Save: {action.savings?.kwh_mid || 0} kWh/month
                        </span>
                        <span className="text-accent font-semibold">
                          ~€{action.savings?.eur_mid || 0}/month
                        </span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => navigate("/plan")}>
                        Add to Plan
                      </Button>
                    </div>

                    {action.safety && (
                      <div className="mt-3 p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                        <p className="text-sm text-destructive font-semibold">⚠️ {action.safety}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              size="lg"
              className="flex-1 bg-gradient-primary hover:opacity-90"
              onClick={() => navigate(`/solar/${id}`)}
            >
              <Sun className="mr-2 h-5 w-5" />
              Check Solar Potential
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1"
              onClick={() => navigate("/plan")}
            >
              Create Action Plan
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;
