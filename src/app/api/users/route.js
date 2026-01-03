import { NextResponse } from "next/server";
import { requireHR } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { user, response } = await requireHR(request);

    if (response) {
      return response; // Return error response (401 or 403)
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Build where clause
    const where = {};
    
    if (role && (role === "EMPLOYEE" || role === "HR")) {
      where.role = role;
    }
    
    if (search) {
      where.OR = [
        { name: { contains:  search, mode: "insensitive" } },
        { email:  { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        googleId: true,
        employeeId: true,
        phone: true,
        paidLeaveBalance: true,
        sickLeaveBalance: true,
        casualLeaveBalance: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(
      {
        success: true,
        count:  users.length,
        users,
      },
      { status:  200 }
    );
  } catch (error) {
    console.error("Get users error:", error);
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