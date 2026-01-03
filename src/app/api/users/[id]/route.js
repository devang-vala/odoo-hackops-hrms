import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { user, response } = await requireAuth(request);

    if (response) {
      return response;
    }

    const { id } = params;

    // Users can only view their own profile, admins can view any
    if (user.id !== id && user.role !== "HR") {
      return NextResponse.json(
        { 
          success:  false,
          error: "Forbidden",
          message: "You can only view your own profile" 
        },
        { status: 403 }
      );
    }

    const targetUser = await prisma.user.findUnique({
      where:  { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        googleId: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        { 
          success: false,
          error:  "User not found",
          message: "User with this ID does not exist" 
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success:  true,
        user: targetUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user error:", error);
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

export async function DELETE(request, { params }) {
  try {
    const { user, response } = await requireAuth(request);

    if (response) {
      return response;
    }

    if (user.role !== "HR") {
      return NextResponse.json(
        { 
          success: false,
          error: "Forbidden",
          message: "Only HR can delete users" 
        },
        { status: 403 }
      );
    }

    const { id } = params;

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json(
        { 
          success: false,
          error: "User not found",
          message:  "User with this ID does not exist" 
        },
        { status: 404 }
      );
    }

    if (targetUser.id === user.id) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid operation",
          message: "You cannot delete your own account" 
        },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      { 
        success: false,
        error:  "Internal server error",
        message: "Something went wrong" 
      },
      { status: 500 }
    );
  }
}