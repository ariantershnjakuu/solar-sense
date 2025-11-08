import { useState, useCallback } from "react";
import { Upload, Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PhotoUploadStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const PhotoUploadStep = ({ formData, updateFormData }: PhotoUploadStepProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    updateFormData({ photoFile: file });
  }, [updateFormData]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }, [handleFileSelect]);

  const handleRemove = () => {
    setPreview(null);
    updateFormData({ photoFile: null });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Photo Audit (Optional but Recommended)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload a clear photo of your home's exterior facade or roof. Our AI will analyze
          window quality, insulation, sealing, and more to provide targeted recommendations.
        </p>
      </div>

      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => document.getElementById("photo-upload")?.click()}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold mb-1">Drop your photo here or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, WEBP up to 10MB
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" type="button">
                <Camera className="mr-2 h-4 w-4" />
                Choose File
              </Button>
            </div>
          </div>
          <input
            id="photo-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
          />
        </div>
      ) : (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg border border-border"
          />
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleRemove}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="bg-muted/50 rounded-lg p-4 text-sm">
        <p className="font-semibold mb-2">Tips for best results:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>Take photo in daylight for clear visibility</li>
          <li>Capture the full facade or roof area</li>
          <li>Avoid including people or license plates</li>
          <li>Stand at least 10-15 meters away</li>
        </ul>
      </div>
    </div>
  );
};

export default PhotoUploadStep;
