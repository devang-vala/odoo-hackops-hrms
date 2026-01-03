import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { parseRequestDate, getCurrentIST } from "@/lib/timezone";

export async function POST(request) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    // Check if user is HR
    if (user.role !== "HR") {
      return NextResponse.json(
        {
          success:  false,
          error: "Forbidden",
          message: "Only HR can create manual attendance entries",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, date, status, checkIn, checkOut, remarks, workHours } = body;

    // Validation
    if (!userId || !date || !status) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing fields",
          message: "userId, date, and status are required",
        },
        { status:  400 }
      );
    }

    const attendanceDate = parseRequestDate(date);

    // Check if user exists
    const employee = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!employee) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
          message: "Employee with this ID does not exist",
        },
        { status: 404 }
      );
    }

    // Check for existing attendance
    const existing = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId,
          date: attendanceDate,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Attendance exists",
          message: "Attendance record already exists for this date",
        },
        { status: 400 }
      );
    }

    // Create manual attendance
    const attendance = await prisma.attendance.create({
      data: {
        userId,
        date: attendanceDate,
        status,
        checkIn:  checkIn ?  new Date(checkIn) : null,
        checkOut: checkOut ? new Date(checkOut) : null,
        workHours:  workHours || null,
        remarks,
        isManual: true,
        createdBy: user.id,
      },
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
    });

    return NextResponse.json(
      {
        success: true,
        message: "Manual attendance created successfully",
        attendance:  {
          ... attendance,
          date: attendance.date.toISOString().split("T")[0],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Manual attendance error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to create manual attendance",
      },
      { status: 500 }
    );
  }
}