import { NextResponse } from "next/server";
import { verifyToken } from "./jwt";
import { prisma } from "./prisma";

export async function authenticate(request) {
  try {
    const authHeader = request.headers.get("authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return {
        error: {
          success: false,
          error: "Unauthorized",
          message: "No token provided.  Please include 'Authorization: Bearer <token>' header",
        },
        status: 401,
      };
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return {
        error: {
          success: false,
          error: "Unauthorized",
          message: "Invalid or expired token",
        },
        status: 401,
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        googleId: true,
        employeeId: true,
        phone:  true,
        paidLeaveBalance: true,
        sickLeaveBalance: true,
        casualLeaveBalance: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return {
        error: {
          success: false,
          error: "Unauthorized",
          message: "User not found",
        },
        status: 401,
      };
    }

    return { user };
  } catch (error) {
    console.error("Authentication error:", error);
    return {
      error: {
        success: false,
        error: "Internal server error",
        message:  "Authentication failed",
      },
      status: 500,
    };
  }
}

export async function requireAuth(request) {
  const result = await authenticate(request);
  
  if (result.error) {
    return {
      response: NextResponse.json(result.error, { status: result.status }),
    };
  }

  return { user: result.user };
}

export async function requireHR(request) {
  const result = await authenticate(request);
  
  if (result.error) {
    return {
      response: NextResponse.json(result.error, { status: result.status }),
    };
  }

  if (result.user.role !== "HR") {
    return {
      response: NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message: "HR access required",
        },
        { status: 403 }
      ),
    };
  }

  return { user: result.user };
}