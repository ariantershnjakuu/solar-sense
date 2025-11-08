import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WaterStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const WaterStep = ({ formData, updateFormData }: WaterStepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="water_heater">Water Heater Type</Label>
        <Select
          value={formData.water_heater}
          onValueChange={(value) => updateFormData({ water_heater: value })}
        >
          <SelectTrigger id="water_heater">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="electric_tank">Electric Tank</SelectItem>
            <SelectItem value="instant">Instant / On-Demand</SelectItem>
            <SelectItem value="solar">Solar Water Heater</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.water_heater === "electric_tank" && (
        <div className="space-y-2">
          <Label htmlFor="water_tank_liters">Tank Size (Liters)</Label>
          <Input
            id="water_tank_liters"
            type="number"
            min="30"
            max="300"
            step="10"
            value={formData.water_tank_liters}
            onChange={(e) => updateFormData({ water_tank_liters: parseInt(e.target.value) })}
          />
          <p className="text-sm text-muted-foreground">
            Typical sizes: 80-120L for apartments, 150-200L for houses
          </p>
        </div>
      )}
    </div>
  );
};

export default WaterStep;
