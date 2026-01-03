import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { formatISTDateTime, parseRequestDate } from "@/lib/timezone";

export async function GET(request) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate"); // YYYY-MM-DD format
    const endDate = searchParams.get("endDate");     // YYYY-MM-DD format
    const month = searchParams.get("month");         // YYYY-MM format

    let whereClause = {
      userId: user.id,
    };

    if (startDate && endDate) {
      whereClause.date = {
        gte: parseRequestDate(startDate),
        lte: parseRequestDate(endDate),
      };
    } else if (month) {
      const [year, monthNum] = month.split("-");
      const start = new Date(year, monthNum - 1, 1);
      const end = new Date(year, monthNum, 0);
      
      whereClause.date = {
        gte: start,
        lte: end,
      };
    } else {
      // Default:  current month (IST)
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      whereClause.date = {
        gte: start,
        lte: end,
      };
    }

    const attendances = await prisma.attendance.findMany({
      where: whereClause,
      orderBy: { date: "desc" },
    });

    // Format for frontend (shadcn calendar compatible)
    const formattedAttendances = attendances.map((a) => ({
      id: a.id,
      date: a.date.toISOString().split('T')[0], // YYYY-MM-DD format
      checkIn: a.checkIn ? formatISTDateTime(a.checkIn) : null,
      checkOut: a.checkOut ? formatISTDateTime(a.checkOut) : null,
      status: a.status,
      workHours: a.workHours,
      remarks: a.remarks,
      isManual: a.isManual,
    }));

    // Calculate statistics
    const stats = {
      totalDays: attendances.length,
      present: attendances.filter((a) => a.status === "PRESENT").length,
      absent: attendances.filter((a) => a.status === "ABSENT").length,
      halfDay: attendances.filter((a) => a.status === "HALF_DAY").length,
      leave: attendances.filter((a) => a.status === "LEAVE").length,
      weekend: attendances.filter((a) => a.status === "WEEKEND").length,
      totalWorkHours: attendances.reduce((sum, a) => sum + (a.workHours || 0), 0).toFixed(2),
    };

    return NextResponse.json(
      {
        success: true,
        attendances: formattedAttendances,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get attendance error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to fetch attendance",
      },
      { status: 500 }
    );
  }
}