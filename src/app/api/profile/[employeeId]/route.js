import { NextResponse } from "next/server"
import { getUserProfile, updateOwnProfile } from "@/lib/services/profileService"
import { validateData, updateOwnProfileSchema } from "@/lib/validations/profileValidation"
import { authenticate } from "@/lib/auth-middleware"

/**
 * GET /api/profile/me
 * Get logged-in user's profile
 */
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params
    const employeeId = resolvedParams.employeeId.trim()

    // Only allow "me" - users can only view their own profile
    if (employeeId !== "me") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    const authResult = await authenticate(request)
    if (authResult.error) {
      return NextResponse.json(authResult.error, { status: authResult.status })
    }

    const profile = await getUserProfile(authResult.user.id)
    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to fetch profile",
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/profile/me
 * Update logged-in user's own profile
 */
export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await params
    const employeeId = resolvedParams.employeeId.trim()

    // Only allow "me" - users can only update their own profile
    if (employeeId !== "me") {
      return NextResponse.json(
        { success: false, message: "Access denied" },
        { status: 403 }
      )
    }

    const authResult = await authenticate(request)
    if (authResult.error) {
      return NextResponse.json(authResult.error, { status: authResult.status })
    }

    const userId = authResult.user.id
    const body = await request.json()

    // Check for forbidden fields for self-update
    const forbiddenFields = ["email", "role", "employeeId", "paidLeaveBalance", "sickLeaveBalance", "casualLeaveBalance"]
    const attemptedForbiddenFields = forbiddenFields.filter((field) => body.hasOwnProperty(field))

    if (attemptedForbiddenFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `Cannot update fields: ${attemptedForbiddenFields.join(", ")}`,
        },
        { status: 403 }
      )
    }

    // Validate input data
    const validation = validateData(body, updateOwnProfileSchema)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Validation failed",
          errors: validation.errors,
        },
        { status: 400 }
      )
    }

    const updatedProfile = await updateOwnProfile(userId, validation.data)
    return NextResponse.json({
      success: true,
      data: updatedProfile,
      message: "Profile updated successfully",
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json(
      {
        success: false,
        message: error.message || "Failed to update profile",
      },
      { status: 500 }
    )
  }
}
