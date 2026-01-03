"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { useFileUpload } from "@/hooks/useFileUpload";
import { cn } from "@/lib/utils";
import Image from "next/image";

export function PublicLogoUpload({ value, onChange, organizationId = "signup" }) {
  const { uploadFilePublic, uploading, uploadProgress } = useFileUpload();
  const [preview, setPreview] = useState(value || null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (! file) return;

    try {
      // Show preview immediately
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);

      // Upload to Cloudinary via public endpoint
      const result = await uploadFilePublic(file, organizationId);

      // Update with Cloudinary URL
      setPreview(result.url);
      onChange?.(result.url);
    } catch (error) {
      // Reset preview on error
      setPreview(value || null);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange?.(null);
  };

  return (
    <div className="space-y-2">
      <Card
        className={cn(
          "relative w-full h-48 border-2 border-dashed flex items-center justify-center transition-colors",
          uploading ?  "pointer-events-none opacity-60" : "hover:border-primary cursor-pointer"
        )}
      >
        {preview ?  (
          <div className="relative w-full h-full p-4">
            <div className="relative w-full h-full">
              <Image
                src={preview}
                alt="Company logo"
                fill
                className="object-contain"
              />
            </div>
            {! uploading && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={handleRemove}
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ) : (
          <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer p-4">
            <input
              type="file"
              className="hidden"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/svg+xml"
              onChange={handleFileSelect}
              disabled={uploading}
            />
            <div className="flex flex-col items-center">
              <div className="mb-3 p-3 rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <p className="text-sm font-medium text-center">Click to upload company logo</p>
              <p className="text-xs text-muted-foreground mt-1 text-center">
                PNG, JPG, SVG up to 5MB
              </p>
            </div>
          </label>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-background/95 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
            <div className="w-48 h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm mt-2 font-medium">Uploading...  {uploadProgress}%</p>
          </div>
        )}
      </Card>
    </div>
  );
}