import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing fields",
          message: "All password fields are required",
        },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          error: "Password mismatch",
          message:  "New password and confirm password do not match",
        },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Weak password",
          message: "New password must be at least 8 characters long",
        },
        { status: 400 }
      );
    }

    // Password strength validation
    const hasUpperCase = /[A-Z]/.test(newPassword);
    const hasLowerCase = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[@#$%&*!]/.test(newPassword);

    if (!hasUpperCase || !hasLowerCase || ! hasNumber || !hasSpecial) {
      return NextResponse.json(
        {
          success:  false,
          error: "Weak password",
          message: "Password must contain uppercase, lowercase, number, and special character",
        },
        { status: 400 }
      );
    }

    // Get user with password
    const fullUser = await prisma.user.findUnique({
      where:  { id: user.id },
    });

    if (!fullUser || !fullUser.password) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          message: "User does not exist",
        },
        { status:  404 }
      );
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, fullUser.password);

    if (!isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid password",
          message: "Current password is incorrect",
        },
        { status: 400 }
      );
    }

    // Check if new password is same as current
    const isSameAsOld = await bcrypt.compare(newPassword, fullUser.password);
    if (isSameAsOld) {
      return NextResponse.json(
        {
          success: false,
          error:  "Same password",
          message: "New password cannot be the same as current password",
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear first login flag
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password:  hashedPassword,
        isFirstLogin: false,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password changed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json(
      {
        success:  false,
        error: "Internal server error",
        message: "Failed to change password",
      },
      { status: 500 }
    );
  }
}