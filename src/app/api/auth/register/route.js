import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Helper function to determine if user should be HR
function isHREmail(email) {
  const normalizedEmail = email.toLowerCase();
  return normalizedEmail.endsWith(".hackops.admin@gmail.com");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, name, password, employeeId } = body;

    if (!email || !name || !password) {
      return NextResponse.json(
        { 
          success: false,
          error: "Missing required fields",
          message:  "Email, name, and password are required" 
        },
        { status: 400 }
      );
    }

    // Employee ID validation (if provided)
    if (employeeId) {
      const existingEmployee = await prisma.user.findUnique({
        where: { employeeId },
      });

      if (existingEmployee) {
        return NextResponse.json(
          { 
            success:  false,
            error: "Employee ID already exists",
            message: "This employee ID is already registered" 
          },
          { status: 409 }
        );
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid email format",
          message: "Please provide a valid email address" 
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false,
          error: "Weak password",
          message: "Password must be at least 6 characters long" 
        },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email:  email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false,
          error: "User already exists",
          message: "A user with this email already exists" 
        },
        { status:  409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Determine role based on email
    const userRole = isHREmail(email) ? "HR" : "EMPLOYEE";

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name:  name.trim(),
        password: hashedPassword,
        role: userRole,
        employeeId: employeeId || null,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        message: `User created successfully as ${userRole}`,
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Something went wrong during registration" 
      },
      { status: 500 }
    );
  }
}