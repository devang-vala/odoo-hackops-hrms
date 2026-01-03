import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { 
  getCurrentIST, 
  getISTDateOnly, 
  parseRequestDate,
  formatISTDateTime,
  isWeekend 
} from "@/lib/timezone";

export async function POST(request) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const body = await request.json();
    const { date, remarks } = body;

    // Get IST date
    const checkInDate = date ? parseRequestDate(date) : getISTDateOnly();
    const today = getISTDateOnly();

    // Check if date is in future
    if (checkInDate > today) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date",
          message: "Cannot check-in for future dates",
        },
        { status:  400 }
      );
    }

    // Check if already checked in
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: checkInDate,
        },
      },
    });

    if (existingAttendance) {
      return NextResponse.json(
        {
          success: false,
          error: "Already checked in",
          message:  "You have already checked in for this date",
          attendance: {
            ...existingAttendance,
            checkIn: existingAttendance.checkIn ?  formatISTDateTime(existingAttendance.checkIn) : null,
            checkOut: existingAttendance.checkOut ? formatISTDateTime(existingAttendance.checkOut) : null,
            date: existingAttendance.date.toISOString().split('T')[0],
          },
        },
        { status: 400 }
      );
    }

    // Check if on approved leave
    const approvedLeave = await prisma.leave.findFirst({
      where: {
        userId: user.id,
        status: "APPROVED",
        startDate: { lte: checkInDate },
        endDate: { gte:  checkInDate },
      },
    });

    if (approvedLeave) {
      return NextResponse.json(
        {
          success: false,
          error: "On leave",
          message: "You are on approved leave for this date",
        },
        { status: 400 }
      );
    }

    // Check if weekend
    const weekend = isWeekend(checkInDate);
    const currentIST = getCurrentIST();

    // Create attendance record
    const attendance = await prisma.attendance.create({
      data: {
        userId:  user.id,
        date: checkInDate,
        checkIn: currentIST,
        status: weekend ? "WEEKEND" : "PRESENT",
        remarks:  remarks || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Checked in successfully",
        attendance:  {
          ...attendance,
          checkIn: formatISTDateTime(attendance.checkIn),
          checkOut: attendance.checkOut ? formatISTDateTime(attendance.checkOut) : null,
          date: attendance.date.toISOString().split('T')[0],
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:  "Failed to check in",
      },
      { status: 500 }
    );
  }
}