import { useState } from "react";
import axios from "axios"; // ✅ Use base axios for public uploads
import { toast } from "sonner";

export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  /**
   * Upload file - public version (no auth required)
   */
  const uploadFilePublic = async (file, organizationId = "signup") => {
    try {
      setUploading(true);
      setUploadProgress(0);

      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/svg+xml"];

      if (!validTypes.includes(file.type)) {
        throw new Error(`Invalid file type. Allowed:  JPG, PNG, WEBP, SVG`);
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("File size must be less than 5MB");
      }

      // Convert to base64
      setUploadProgress(30);
      const base64 = await fileToBase64(file);

      // Upload to public endpoint
      setUploadProgress(60);
      const response = await axios.post("/api/upload/public", {
        file: base64,
        organizationId,
      });

      setUploadProgress(100);

      if (response.data.success) {
        toast.success("Logo uploaded successfully!");
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload file");
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return {
    uploadFilePublic,
    uploading,
    uploadProgress,
  };
}