import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface OccupancyStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const OccupancyStep = ({ formData, updateFormData }: OccupancyStepProps) => {
  const updateOccupancy = (field: string, value: string) => {
    updateFormData({
      occupancy: { ...formData.occupancy, [field]: value },
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Help us understand your daily routine to optimize heating and hot water schedules
      </p>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="wake">Wake Up Time</Label>
          <Input
            id="wake"
            type="time"
            value={formData.occupancy.wake}
            onChange={(e) => updateOccupancy("wake", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="leave">Leave Home</Label>
          <Input
            id="leave"
            type="time"
            value={formData.occupancy.leave}
            onChange={(e) => updateOccupancy("leave", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="return">Return Home</Label>
          <Input
            id="return"
            type="time"
            value={formData.occupancy.return}
            onChange={(e) => updateOccupancy("return", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sleep">Sleep Time</Label>
          <Input
            id="sleep"
            type="time"
            value={formData.occupancy.sleep}
            onChange={(e) => updateOccupancy("sleep", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default OccupancyStep;
