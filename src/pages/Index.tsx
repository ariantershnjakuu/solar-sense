import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Shield, Leaf, Camera, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/sparxai-logo.svg";
import { Card, CardContent } from "@/components/ui/card";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: "AI-Powered Analysis",
      description: "Advanced algorithms analyze your home's energy profile and provide personalized recommendations",
    },
    {
      icon: Camera,
      title: "Photo Audit",
      description: "Upload photos of your home's facade and roof for AI-powered insulation and efficiency insights",
    },
    {
      icon: Sun,
      title: "SolarSense",
      description: "Discover your solar potential with detailed ROI calculations and payback estimates",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data stays secure and private. We only store what's needed to help you save energy",
    },
    {
      icon: Leaf,
      title: "Sustainability Focus",
      description: "Track your environmental impact with CO₂ reduction metrics and energy-saving actions",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logo} alt="sparxAI" className="h-12" />
        </div>
        <Button
          variant="outline"
          className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          onClick={() => navigate("/auth")}
        >
          Sign In
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-muted rounded-full text-sm">
            <Zap className="h-4 w-4 text-accent" />
            <span className="text-muted-foreground">AI-Powered Energy Auditor</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Cut Your Energy Bills with{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              AI Intelligence
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get personalized energy-saving recommendations, photo-based audits, and solar
            potential analysis—all powered by advanced AI.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="bg-gradient-primary hover:opacity-90 shadow-glow-primary text-primary-foreground font-semibold px-8 py-6 text-lg"
              onClick={() => navigate("/auth")}
            >
              Start Free Audit
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-6 text-lg"
              onClick={() => navigate("/lead")}
            >
              Get Solar Estimate
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">
              Everything You Need to{" "}
              <span className="text-accent">Save Energy</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Comprehensive energy auditing tools designed for homeowners and SMEs
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="bg-gradient-card border-border hover:border-primary transition-all duration-300 hover:shadow-glow-primary"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-primary border-0 shadow-glow-primary">
            <CardContent className="p-12 text-center space-y-6">
              <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground">
                Ready to Cut Your Energy Costs?
              </h2>
              <p className="text-xl text-primary-foreground/90 max-w-2xl mx-auto">
                Join thousands of users who've reduced their energy consumption and carbon
                footprint with sparxAI.
              </p>
              <Button
                size="lg"
                className="bg-background text-foreground hover:bg-background/90 px-8 py-6 text-lg font-semibold"
                onClick={() => navigate("/auth")}
              >
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="sparxAI" className="h-8" />
            <span className="text-sm text-muted-foreground">
              © 2025 sparxAI. All rights reserved.
            </span>
          </div>
          <div className="text-sm text-muted-foreground">
            Privacy-first energy auditing for a sustainable future
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
