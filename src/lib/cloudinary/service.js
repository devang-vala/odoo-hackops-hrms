import cloudinary from "./config";

export async function uploadToCloudinary(fileDataUrl, options = {}) {
  try {
    const {
      folder = "hrms",
      resourceType = "auto",
      publicId = null,
      transformation = null,
      allowedFormats = null,
    } = options;

    const uploadOptions = {
      folder,
      resource_type: resourceType,
      ...(publicId && { public_id: publicId }),
      ...(transformation && { transformation }),
      ...(allowedFormats && { allowed_formats: allowedFormats }),
    };

    const result = await cloudinary.uploader.upload(fileDataUrl, uploadOptions);

    return {
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        resourceType: result.resource_type,
        createdAt: result.created_at,
      },
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload file",
    };
  }
}

export async function deleteFromCloudinary(publicId, resourceType = "image") {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });

    return {
      success: result.result === "ok",
      data: result,
    };
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    return {
      success: false,
      error: error.message || "Failed to delete file",
    };
  }
}

// ✅ WORKING VERSION - Simple, no complex transformations
export async function uploadOrganizationLogo(fileDataUrl, organizationId) {
  try {
    const result = await cloudinary.uploader.upload(fileDataUrl, {
      folder: `hrms/organizations/${organizationId}/logo`,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "svg"],
      transformation: {
        width: 500,
        height: 500,
        crop: "limit",
      },
    });

    return {
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
    };
  } catch (error) {
    console.error("Logo upload error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload logo",
    };
  }
}

export async function uploadProfilePicture(fileDataUrl, userId) {
  try {
    const result = await cloudinary.uploader.upload(fileDataUrl, {
      folder: `hrms/employees/${userId}/profile`,
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: {
        width:  400,
        height: 400,
        crop: "fill",
        gravity: "face",
      },
    });

    return {
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      },
    };
  } catch (error) {
    console.error("Profile picture upload error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload profile picture",
    };
  }
}

export async function uploadDocument(fileDataUrl, userId, documentType = "general") {
  try {
    const result = await cloudinary.uploader.upload(fileDataUrl, {
      folder: `hrms/employees/${userId}/documents/${documentType}`,
      resource_type: "raw",
      allowed_formats:  ["pdf", "doc", "docx", "txt"],
    });

    return {
      success:  true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        format:  result.format,
        bytes: result.bytes,
      },
    };
  } catch (error) {
    console.error("Document upload error:", error);
    return {
      success: false,
      error: error.message || "Failed to upload document",
    };
  }
}

export function getOptimizedImageUrl(publicId, transformations = {}) {
  const {
    width = 400,
    height = 400,
    crop = "fill",
  } = transformations;

  return cloudinary.url(publicId, {
    transformation: {
      width,
      height,
      crop,
    },
  });
}

export function extractPublicIdFromUrl(url) {
  try {
    if (!url) return null;
    const matches = url.match(/\/v\d+\/(.+)\.\w+$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    const parts = url.split("/upload/");
    if (parts[1]) {
      const publicIdWithExt = parts[1].split("/").slice(1).join("/");
      return publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf("."));
    }
    return null;
  } catch (error) {
    console.error("Error extracting public ID:", error);
    return null;
  }
}