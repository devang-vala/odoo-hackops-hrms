import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export async function PATCH(request, { params }) {
  try {
    const { user, response } = await requireAdmin(request);

    if (response) {
      return response;
    }

    const { id } = params;
    const body = await request.json();
    const { role } = body;

    if (!role || (role !== "USER" && role !== "ADMIN")) {
      return NextResponse.json(
        { 
          success: false,
          error: "Invalid role",
          message: "Role must be either USER or ADMIN" 
        },
        { status: 400 }
      );
    }

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

    if (targetUser.id === user.id && role === "USER") {
      return NextResponse.json(
        { 
          success: false,
          error:  "Invalid operation",
          message:  "You cannot demote yourself from admin" 
        },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User role updated successfully",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update role error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Something went wrong" 
      },
      { status: 500 }
    );
  }
}