import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import logo from "@/assets/solar-sense-removebg-preview.png";
import { ThemeToggle } from "@/components/ThemeToggle";

type BillRange = "<30" | "30-60" | "60-100" | "100-150" | ">150";

const BILL_RANGE_TO_SAVINGS_EUR: Record<BillRange, number> = {
  "<30": 150,
  "30-60": 250,
  "60-100": 400,
  "100-150": 550,
  ">150": 750,
} as const;

const SolarLead = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [billRange, setBillRange] = useState<BillRange>("60-100");

  const estimateEur = useMemo(() => {
    return BILL_RANGE_TO_SAVINGS_EUR[billRange];
  }, [billRange]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("leads")
        .insert({
          name,
          phone,
          email: email || null,
          city: city || null,
          address: address || null,
          bill_range: billRange,
          rough_estimate_eur: estimateEur,
        })
        .select("id")
        .single();

      if (error) throw error;
      toast.success("Thanks! We’ll reach out to schedule your professional audit.");

      if (data?.id) {
        navigate(`/site-visit/${data.id}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to submit lead");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <img src={logo} alt="SolarSense" className="h-12" />
        <ThemeToggle />
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-2xl">Request a Professional Energy Audit</CardTitle>
              <CardDescription>A local advisor will visit to assess your home.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (optional)</Label>
                    <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bill_range">Rough monthly electricity bill</Label>
                  <Select value={billRange} onValueChange={(v) => setBillRange(v as BillRange)}>
                    <SelectTrigger id="bill_range">
                      <SelectValue placeholder="Select a range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="<30">Less than €30</SelectItem>
                      <SelectItem value="30-60">€30 – €60</SelectItem>
                      <SelectItem value="60-100">€60 – €100</SelectItem>
                      <SelectItem value="100-150">€100 – €150</SelectItem>
                      <SelectItem value=">150">More than €150</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    Based on your area and a typical home size, the right upgrades could save you
                    <span className="font-semibold text-accent"> ~€{estimateEur}/year</span>.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Want a professional home energy audit? A local advisor can do a quick on‑site visit.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-primary hover:opacity-90"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Request my on‑site audit"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SolarLead;


