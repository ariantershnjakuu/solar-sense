import { useState, useCallback, useEffect } from "react";
import { Upload, Camera, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PhotoUploadStepProps {
  formData: any;
  updateFormData: (data: any) => void;
}

const PhotoUploadStep = ({ formData, updateFormData }: PhotoUploadStepProps) => {
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [billPreviews, setBillPreviews] = useState<(string | null)[]>([]);

  useEffect(() => {
    const currentPhotos: File[] = formData?.housePhotos || [];
    const urls = currentPhotos.map((file: File) =>
      file.type.startsWith("image/") ? URL.createObjectURL(file) : ""
    );
    setPhotoPreviews(urls);
    return () => {
      urls.forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
    };
  }, [formData?.housePhotos]);

  useEffect(() => {
    const currentBills: File[] = formData?.electricityBills || [];
    const urls = currentBills.map((file: File) =>
      file.type.startsWith("image/") ? URL.createObjectURL(file) : null
    );
    setBillPreviews(urls);
    return () => {
      urls.forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
    };
  }, [formData?.electricityBills]);

  const validateImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      return false;
    }
    return true;
  };

  const validateBill = (file: File) => {
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";
    if (!isImage && !isPdf) {
      toast.error("Bills must be images or PDF");
      return false;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File must be less than 10MB");
      return false;
    }
    return true;
  };

  const handlePhotoFilesSelect = useCallback((files: FileList | File[]) => {
    const current: File[] = formData?.housePhotos || [];
    const accepted: File[] = [];
    Array.from(files).forEach((file) => {
      if (validateImage(file)) accepted.push(file);
    });
    if (accepted.length === 0) return;
    updateFormData({ housePhotos: [...current, ...accepted] });
  }, [formData?.housePhotos, updateFormData]);

  const handlePhotoDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handlePhotoFilesSelect(files);
  }, [handlePhotoFilesSelect]);

  const handleRemovePhoto = (index: number) => {
    const current: File[] = formData?.housePhotos || [];
    const next = current.filter((_, i) => i !== index);
    const preview = photoPreviews[index];
    if (preview) URL.revokeObjectURL(preview);
    updateFormData({ housePhotos: next });
  };

  const handleBillFilesSelect = useCallback((files: FileList | File[]) => {
    const current: File[] = formData?.electricityBills || [];
    const accepted: File[] = [];
    Array.from(files).forEach((file) => {
      if (validateBill(file)) accepted.push(file);
    });
    if (accepted.length === 0) return;
    updateFormData({ electricityBills: [...current, ...accepted] });
  }, [formData?.electricityBills, updateFormData]);

  const handleBillDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleBillFilesSelect(files);
  }, [handleBillFilesSelect]);

  const handleRemoveBill = (index: number) => {
    const current: File[] = formData?.electricityBills || [];
    const next = current.filter((_, i) => i !== index);
    const preview = billPreviews[index];
    if (preview) URL.revokeObjectURL(preview);
    updateFormData({ electricityBills: next });
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold mb-2">Photo Audit (Optional but Recommended)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload clear photos of your home's exterior facade or roof. Our AI will analyze
          window quality, insulation, sealing, and more to provide targeted recommendations.
        </p>
      </div>

      <div
        onDrop={handlePhotoDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
        onClick={() => document.getElementById("photo-upload")?.click()}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          <div>
            <p className="font-semibold mb-1">Drop house photos here or click to browse</p>
            <p className="text-sm text-muted-foreground">
              Supports JPG, PNG, WEBP up to 10MB each
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" type="button">
              <Camera className="mr-2 h-4 w-4" />
              Choose Files
            </Button>
          </div>
        </div>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) handlePhotoFilesSelect(files);
          }}
        />
      </div>

      {photoPreviews.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {photoPreviews.map((src, idx) => (
            <div key={idx} className="relative">
              {src ? (
                <img
                  src={src}
                  alt={`House photo ${idx + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-border"
                />
              ) : (
                <div className="w-full h-32 rounded-lg border border-border flex items-center justify-center text-sm text-muted-foreground">
                  Preview unavailable
                </div>
              )}
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => handleRemovePhoto(idx)}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
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

      <div className="pt-4">
        <h3 className="font-semibold mb-2">Electricity Bills (Optional)</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Upload recent electricity bills to help estimate your consumption patterns.
          Images or PDFs up to 10MB each.
        </p>

        <div
          onDrop={handleBillDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer"
          onClick={() => document.getElementById("bill-upload")?.click()}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold mb-1">Drop bills here or click to browse</p>
              <p className="text-sm text-muted-foreground">
                Supports JPG, PNG, WEBP, PDF
              </p>
            </div>
            <Button variant="outline" size="sm" type="button">
              Choose Files
            </Button>
          </div>
          <input
            id="bill-upload"
            type="file"
            accept="image/*,application/pdf"
            multiple
            className="hidden"
            onChange={(e) => {
              const files = e.target.files;
              if (files && files.length > 0) handleBillFilesSelect(files);
            }}
          />
        </div>

        {(formData?.electricityBills?.length || 0) > 0 && (
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            {(formData?.electricityBills || []).map((file: File, idx: number) => {
              const isImage = file.type.startsWith("image/");
              const preview = billPreviews[idx];
              return (
                <div
                  key={`${file.name}-${idx}`}
                  className="flex items-center gap-3 p-3 border border-border rounded-lg"
                >
                  {isImage && preview ? (
                    <img
                      src={preview}
                      alt={file.name}
                      className="h-12 w-12 object-cover rounded border border-border"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-muted/50 flex items-center justify-center">
                      <FileText className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 overflow-hidden">
                    <p className="truncate text-sm">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => handleRemoveBill(idx)}
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoUploadStep;
