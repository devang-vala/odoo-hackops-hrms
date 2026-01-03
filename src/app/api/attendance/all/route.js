import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { formatISTDateTime, parseRequestDate } from "@/lib/timezone";

export async function GET(request) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    // Check if user is HR
    if (user.role !== "HR") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message: "Only HR can view all attendance records",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const date = searchParams.get("date");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");

    let whereClause = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (date) {
      whereClause.date = parseRequestDate(date);
    } else if (startDate && endDate) {
      whereClause.date = {
        gte:  parseRequestDate(startDate),
        lte: parseRequestDate(endDate),
      };
    }

    if (status) {
      whereClause.status = status;
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
          },
        },
      },
      orderBy: [{ date: "desc" }, { user: { name: "asc" } }],
    });

    // Format for frontend
    const formattedAttendances = attendances.map((a) => ({
      id: a.id,
      date: a.date.toISOString().split("T")[0],
      checkIn: a.checkIn ? formatISTDateTime(a.checkIn) : null,
      checkOut: a.checkOut ? formatISTDateTime(a.checkOut) : null,
      status: a.status,
      workHours: a.workHours,
      remarks: a.remarks,
      isManual: a.isManual,
      user: a.user,
    }));

    return NextResponse.json(
      {
        success: true,
        count: attendances.length,
        attendances: formattedAttendances,
      },
      { status:  200 }
    );
  } catch (error) {
    console.error("Get all attendance error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to fetch attendance",
      },
      { status:  500 }
    );
  }
}