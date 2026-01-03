import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import {
  uploadOrganizationLogo,
  uploadProfilePicture,
  uploadDocument,
} from "@/lib/cloudinary/service";

export async function POST(request) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const body = await request.json();
    const { file, type, organizationId, documentType } = body;

    // Validation
    if (!file || !type) {
      return NextResponse.json(
        {
          success:  false,
          error: "Missing data",
          message: "File and type are required",
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
        { status: 400 }
      );
    }

    let uploadResult;

    switch (type) {
      case "organization-logo":
        // Only HR can upload organization logo
        if (user.role !== "HR") {
          return NextResponse.json(
            {
              success: false,
              error: "Forbidden",
              message: "Only HR can upload organization logos",
            },
            { status: 403 }
          );
        }
        uploadResult = await uploadOrganizationLogo(file, organizationId || "default");
        break;

      case "profile-picture":
        uploadResult = await uploadProfilePicture(file, user.id);
        break;

      case "document":
        uploadResult = await uploadDocument(file, user.id, documentType || "general");
        break;

      default:
        return NextResponse.json(
          {
            success: false,
            error:  "Invalid type",
            message:  "Upload type must be organization-logo, profile-picture, or document",
          },
          { status: 400 }
        );
    }

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          error:  "Upload failed",
          message: uploadResult.error,
        },
        { status: 500 }
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
    console.error("Upload error:", error);
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