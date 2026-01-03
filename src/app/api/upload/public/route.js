import { NextResponse } from "next/server";
import { uploadOrganizationLogo } from "@/lib/cloudinary/service";

export async function POST(request) {
  try {
    const body = await request.json();
    const { file, organizationId } = body;

    // Validation
    if (!file) {
      return NextResponse.json(
        {
          success:  false,
          error: "Missing data",
          message: "File is required",
        },
        { status: 400 }
      );
    }

    // Check file size (base64 string length / 1.37 ≈ original file size)
    const estimatedSize = (file.length * 0.75) / 1024 / 1024; // MB
    if (estimatedSize > 5) {
      return NextResponse.json(
        {
          success: false,
          error: "File too large",
          message: "File size must be less than 5MB",
        },
        { status:  400 }
      );
    }

    // Upload to Cloudinary
    const uploadResult = await uploadOrganizationLogo(file, organizationId || "signup");

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Upload failed",
          message: uploadResult.error,
        },
        { status:  500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "File uploaded successfully",
        data: uploadResult.data,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Public upload error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to upload file",
      },
      { status: 500 }
    );
  }
}