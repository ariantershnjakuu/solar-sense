import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface InsulationStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const InsulationStep = ({ formData, updateFormData }: InsulationStepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="curtains">Window Curtains / Blinds</Label>
        <Select
          value={formData.curtains}
          onValueChange={(value) => updateFormData({ curtains: value })}
        >
          <SelectTrigger id="curtains">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="light">Light / Sheer</SelectItem>
            <SelectItem value="heavy">Heavy / Thermal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="insulation_level">Overall Insulation Quality (Self-Assessment)</Label>
        <Select
          value={formData.insulation_level}
          onValueChange={(value) => updateFormData({ insulation_level: value })}
        >
          <SelectTrigger id="insulation_level">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="poor">Poor - Single-pane windows, drafts, old building</SelectItem>
            <SelectItem value="average">Average - Double glazing, some insulation</SelectItem>
            <SelectItem value="good">Good - Modern insulation, triple glazing</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">
          We'll refine this assessment with your photo upload in the next step
        </p>
      </div>
    </div>
  );
};

export default InsulationStep;
