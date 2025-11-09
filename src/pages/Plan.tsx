import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import logo from "@/assets/solar-sense-removebg-preview.png";
import { ThemeToggle } from "@/components/ThemeToggle";

type Action = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  difficulty: number | null;
  comfort_impact: number | null;
  safety_notes: string | null;
};

const Plan = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<Action[]>([]);
  const [myActions, setMyActions] = useState<Action[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }
        const [{ data: catalog, error: catErr }, { data: plan, error: planErr }] = await Promise.all([
          supabase.from("actions_catalog").select("*").order("difficulty", { ascending: true }),
          supabase.from("user_plan").select("action_id, actions_catalog(*)").eq("user_id", session.user.id),
        ]);
        if (catErr) throw catErr;
        if (planErr) throw planErr;
        setActions((catalog || []) as any);
        setMyActions(((plan || []).map((p: any) => p.actions_catalog).filter(Boolean)) as any);
      } catch (err: any) {
        toast.error(err.message || "Failed to load actions");
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return actions;
    return actions.filter((a) => a.title.toLowerCase().includes(q) || a.code.toLowerCase().includes(q));
  }, [actions, query]);

  const isInPlan = (id: string) => myActions.some((a) => a.id === id);

  const addToPlan = async (actionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      const { error } = await supabase.from("user_plan").insert({ user_id: user.id, action_id: actionId });
      if (error) throw error;
      const action = actions.find((a) => a.id === actionId);
      if (action) setMyActions((prev) => [...prev, action]);
      toast.success("Added to your plan");
    } catch (err: any) {
      toast.error(err.message || "Failed to add");
    }
  };

  const removeFromPlan = async (actionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }
      const { error } = await supabase.from("user_plan").delete().eq("user_id", user.id).eq("action_id", actionId);
      if (error) throw error;
      setMyActions((prev) => prev.filter((a) => a.id !== actionId));
      toast.success("Removed from your plan");
    } catch (err: any) {
      toast.error(err.message || "Failed to remove");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center">
        <Card className="bg-card border-border p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg font-semibold">Loading your action plan…</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <img src={logo} alt="SolarSense" className="h-12" />
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/audit")}>New audit</Button>
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Catalog */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Recommended Actions</CardTitle>
                <CardDescription>Browse and add to your plan</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <Input
                    placeholder="Search actions (e.g., insulation, thermostat)"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="space-y-3">
                  {filtered.map((a) => (
                    <Card key={a.id} className="bg-muted/30 border-border">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{a.title}</h3>
                              {a.difficulty && (
                                <Badge variant="outline">Difficulty {a.difficulty}/5</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {a.description || "Energy-saving action"}
                            </p>
                            {a.safety_notes && (
                              <p className="text-xs text-destructive mt-1">⚠️ {a.safety_notes}</p>
                            )}
                          </div>
                          {isInPlan(a.id) ? (
                            <Button variant="outline" onClick={() => removeFromPlan(a.id)}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Remove
                            </Button>
                          ) : (
                            <Button className="bg-gradient-primary hover:opacity-90" onClick={() => addToPlan(a.id)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Add to plan
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* My Plan */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>My Action Plan</CardTitle>
                <CardDescription>Track chosen actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {myActions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No actions yet. Add from the list.</p>
                ) : (
                  myActions.map((a) => (
                    <div key={a.id} className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{a.title}</p>
                        <p className="text-xs text-muted-foreground">{a.description}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => removeFromPlan(a.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plan;


