import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TopBar } from "@/components/TopBar";

const Index = () => {
  const navigate = useNavigate();

  type Slide = {
    id: string;
    headline: string;
    sub: string;
    bg: string;
    isCta?: boolean;
  };

  const slides: ReadonlyArray<Slide> = [
    {
      id: "intro",
      headline: "Energy intelligence. Made simple.",
      sub: "Meet SolarSense — your AI energy auditor.",
      bg: "bg-gradient-hero",
    },
    {
      id: "audit",
      headline: "From photos to insights.",
      sub: "Upload a few pictures. Get actionable recommendations.",
      bg: "bg-background",
    },
    {
      id: "solar",
      headline: "See your solar ROI in seconds.",
      sub: "Clear payback, savings, and next steps — no guesswork.",
      bg: "bg-gradient-hero",
    },
    {
      id: "privacy",
      headline: "Private by design.",
      sub: "We only store what’s needed to help you save energy.",
      bg: "bg-background",
    },
    {
      id: "cta",
      headline: "Ready when you are.",
      sub: "",
      bg: "bg-gradient-hero",
      isCta: true,
    },
  ] as const;

  return (
    <div className="relative h-screen">
      <TopBar
        className="fixed top-0 inset-x-0 z-50 bg-transparent"
        rightAction={{ label: "Sign In", to: "/auth", variant: "outline" }}
      />

      <main className="h-full overflow-y-auto snap-y snap-mandatory scroll-smooth">
        {slides.map((slide) => (
          <section
            key={slide.id}
            className={`${slide.bg} h-screen snap-start flex items-center`}
          >
            <div className="container mx-auto px-4 w-full">
              <div className="max-w-5xl">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
                  {slide.headline}
                </h1>
                {slide.sub ? (
                  <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-2xl">
                    {slide.sub}
                  </p>
                ) : null}

                {slide.isCta ? (
                  <div className="mt-10 flex flex-wrap gap-4">
                    <Button
                      size="lg"
                      className="bg-gradient-primary text-primary-foreground px-8 py-6 font-semibold hover:opacity-90 shadow-glow-primary"
                      onClick={() => navigate("/auth")}
                    >
                      Start free audit
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 py-6"
                      onClick={() => navigate("/lead")}
                    >
                      Book professional audit visit
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default Index;
