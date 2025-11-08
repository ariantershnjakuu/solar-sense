import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BasicInfoStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const BasicInfoStep = ({ formData, updateFormData }: BasicInfoStepProps) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="city">City</Label>
        <Input
          id="city"
          placeholder="e.g., Pristina"
          value={formData.city}
          onChange={(e) => updateFormData({ city: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address (Optional)</Label>
        <Input
          id="address"
          placeholder="Street address for solar analysis"
          value={formData.address}
          onChange={(e) => updateFormData({ address: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dwelling_type">Dwelling Type</Label>
        <Select
          value={formData.dwelling_type}
          onValueChange={(value) => updateFormData({ dwelling_type: value })}
        >
          <SelectTrigger id="dwelling_type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="apartment">Apartment</SelectItem>
            <SelectItem value="house">House</SelectItem>
            <SelectItem value="office">Office / SME</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="roof_type">Roof Type</Label>
        <Select
          value={formData.roof_type}
          onValueChange={(value) => updateFormData({ roof_type: value })}
        >
          <SelectTrigger id="roof_type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flat">Flat</SelectItem>
            <SelectItem value="sloped">Sloped</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default BasicInfoStep;
