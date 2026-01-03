import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { 
  getCurrentIST, 
  parseRequestDate,
  formatISTDateTime 
} from "@/lib/timezone";

// Calculate work hours
function calculateWorkHours(checkIn, checkOut) {
  const diff = checkOut.getTime() - checkIn.getTime();
  return diff / (1000 * 60 * 60); // Convert to hours
}

// Determine status based on work hours
function determineStatus(workHours) {
  if (workHours >= 8) return "PRESENT";
  if (workHours >= 4) return "HALF_DAY";
  return "ABSENT";
}

export async function POST(request) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const body = await request.json();
    const { date } = body;

    const checkOutDate = date ? parseRequestDate(date) : parseRequestDate();

    // Find existing attendance
    const attendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date: checkOutDate,
        },
      },
    });

    if (!attendance) {
      return NextResponse.json(
        {
          success: false,
          error: "No check-in found",
          message: "Please check in first",
        },
        { status: 400 }
      );
    }

    if (attendance.checkOut) {
      return NextResponse.json(
        {
          success: false,
          error:  "Already checked out",
          message: "You have already checked out for this date",
          attendance: {
            ...attendance,
            checkIn: formatISTDateTime(attendance.checkIn),
            checkOut: formatISTDateTime(attendance.checkOut),
            date: attendance.date.toISOString().split('T')[0],
          },
        },
        { status: 400 }
      );
    }

    const checkOutTime = getCurrentIST();

    // Validate check-out is after check-in
    if (checkOutTime <= attendance.checkIn) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid time",
          message: "Check-out time must be after check-in time",
        },
        { status: 400 }
      );
    }

    // Calculate work hours
    const workHours = calculateWorkHours(attendance.checkIn, checkOutTime);
    const status = determineStatus(workHours);

    // Update attendance
    const updatedAttendance = await prisma.attendance.update({
      where: { id: attendance.id },
      data: {
        checkOut:  checkOutTime,
        workHours:  parseFloat(workHours.toFixed(2)),
        status,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Checked out successfully",
        attendance:  {
          ...updatedAttendance,
          checkIn: formatISTDateTime(updatedAttendance.checkIn),
          checkOut: formatISTDateTime(updatedAttendance.checkOut),
          date: updatedAttendance.date.toISOString().split('T')[0],
          workHours: parseFloat(workHours.toFixed(2)),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Check-out error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message:  "Failed to check out",
      },
      { status: 500 }
    );
  }
}