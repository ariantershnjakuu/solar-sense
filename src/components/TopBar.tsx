import { useNavigate } from "react-router-dom";
import logo from "@/assets/solar-sense-removebg-preview.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";

type TopBarProps = {
  className?: string;
  showBack?: boolean;
  backTo?: string;
  rightAction?: {
    label: string;
    to: string;
    variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  };
};

export const TopBar = ({
  className,
  showBack,
  backTo,
  rightAction,
}: TopBarProps) => {
  const navigate = useNavigate();

  return (
    <header className={cn("container mx-auto px-4 py-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {showBack ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => (backTo ? navigate(backTo) : navigate(-1))}
            >
              Back
            </Button>
          ) : null}
          <img src={logo} alt="SolarSense" className="h-10" />
        </div>
        <div className="flex items-center gap-2">
          {rightAction ? (
            <Button
              variant={rightAction.variant ?? "outline"}
              onClick={() => navigate(rightAction.to)}
            >
              {rightAction.label}
            </Button>
          ) : null}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};


