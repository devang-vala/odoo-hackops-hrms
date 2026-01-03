import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

// GET - Fetch current user profile
export async function GET(request) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    // Fetch full user data
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        phone: true,
        paidLeaveBalance: true,
        sickLeaveBalance: true,
        casualLeaveBalance:  true,
        createdAt:  true,
        updatedAt: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: "Profile not found",
          message: "User profile does not exist",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        data: profile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to fetch profile",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update current user profile
export async function PATCH(request) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const body = await request.json();
    const { name, phone } = body;

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid input",
          message: "Name is required",
        },
        { status: 400 }
      );
    }

    // Phone validation (optional field)
    if (phone && !/^\+? [0-9]{10,15}$/.test(phone. replace(/\s/g, ""))) {
      return NextResponse.json(
        {
          success:  false,
          error: "Invalid phone",
          message: "Please provide a valid phone number",
        },
        { status: 400 }
      );
    }

    // Update profile
    const updatedProfile = await prisma.user.update({
      where: { id: user.id },
      data: {
        name:  name.trim(),
        phone: phone ? phone.trim() : null,
      },
      select:  {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        phone: true,
        paidLeaveBalance: true,
        sickLeaveBalance: true,
        casualLeaveBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse. json(
      {
        success: true,
        message: "Profile updated successfully",
        data: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      {
        success:  false,
        error: "Internal server error",
        message: "Failed to update profile",
      },
      { status: 500 }
    );
  }
}