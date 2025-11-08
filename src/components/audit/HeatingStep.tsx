import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface HeatingStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const HeatingStep = ({ formData, updateFormData }: HeatingStepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="heating_type">Heating Type</Label>
        <Select
          value={formData.heating_type}
          onValueChange={(value) => updateFormData({ heating_type: value })}
        >
          <SelectTrigger id="heating_type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="electric">Electric</SelectItem>
            <SelectItem value="wood">Wood</SelectItem>
            <SelectItem value="pellet">Pellet</SelectItem>
            <SelectItem value="gas">Gas</SelectItem>
            <SelectItem value="district">District Heating</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="thermostat_setpoint">Thermostat Setpoint (°C)</Label>
        <Input
          id="thermostat_setpoint"
          type="number"
          min="15"
          max="25"
          value={formData.thermostat_setpoint}
          onChange={(e) => updateFormData({ thermostat_setpoint: parseFloat(e.target.value) })}
        />
        <p className="text-sm text-muted-foreground">
          Recommended: 20-21°C for comfort and efficiency
        </p>
      </div>
    </div>
  );
};

export default HeatingStep;
