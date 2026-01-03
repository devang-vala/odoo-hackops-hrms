import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/jwt";

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false,
          error:  "Missing credentials",
          message:  "Email and password are required" 
        },
        { status:  400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email: email.toLowerCase(),
      },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid credentials",
          message: "Invalid email or password" 
        },
        { status: 401 }
      );
    }

    // Check password
    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      return NextResponse.json(
        { 
          success:  false,
          error: "Invalid credentials",
          message: "Invalid email or password" 
        },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken(user);

    // Remove password from response
    const { password: _ , ... userWithoutPassword } = user;

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token:  token,
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Something went wrong during login" 
      },
      { status: 500 }
    );
  }
}