import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(request) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (! token || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: "Missing fields",
          message: "Token and password are required" 
        },
        { status: 400 }
      );
    }

    // Password validation
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          error:  "Weak password",
          message: "Password must be at least 6 characters long" 
        },
        { status: 400 }
      );
    }

    // Hash the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find valid reset token
    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        token: hashedToken,
        used: false,
        expires: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetRecord) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid token",
          message: "Invalid or expired reset token" 
        },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user password
    await prisma.user.update({
      where: { id:  resetRecord.userId },
      data: { password: hashedPassword },
    });

    // Mark reset token as used
    await prisma.passwordReset.update({
      where: { id: resetRecord.id },
      data: { used: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Something went wrong" 
      },
      { status:  500 }
    );
  }
}