import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, companyName, companyLogo, role } = body;

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing fields",
          message: "Name, email, and password are required",
        },
        { status:  400 }
      );
    }

    // For HR registration, validate email domain
    if (role === "HR" && !email.toLowerCase().trim().endsWith(".hackops.admin@gmail.com")) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "You are not authorized to create an HR account",
        },
        { status: 403 }
      );
    }

    // For HR registration, company name is required
    if (role === "HR" && !companyName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing company name",
          message: "Company name is required for HR registration",
        },
        { status:  400 }
      );
    }

    // Password strength validation
    if (password.length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: "Weak password",
          message: "Password must be at least 8 characters",
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email:  email.toLowerCase().trim() },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Email exists",
          message: "User with this email already exists",
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine role based on email domain
    let userRole = role || "EMPLOYEE";
    if (email.toLowerCase().trim().endsWith(".hackops.admin@gmail.com")) {
      userRole = "HR";
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        name:  name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: userRole,
        phone: phone?.trim() || null,
        companyName: companyName?.trim() || null,
        companyLogo: companyLogo || null,
        isFirstLogin: false, // Self-registered users don't need password change
      },
      select: {
        id: true,
        name: true,
        email: true,
        role:  true,
        companyName: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user,
      },
      { status:  201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to create account",
      },
      { status: 500 }
    );
  }
}