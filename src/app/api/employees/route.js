import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

// GET all employees - accessible by any authenticated user
export async function GET(request) {
  try {
    const { user, error, status } = await authenticate(request);

    if (error) {
      return NextResponse.json(error, { status });
    }

    // Fetch all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        companyLogo: true, // Include user's image/logo
      },
      orderBy: {
        name: "asc",
      },
    });

    // Get today's date for attendance lookup
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Fetch today's attendance for all users
    const attendances = await prisma.attendance.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        userId: true,
        checkIn: true,
        checkOut: true,
        status: true,
      },
    });

    // Fetch approved leaves that cover today
    const leaves = await prisma.leave.findMany({
      where: {
        status: "APPROVED",
        startDate: {
          lte: today,
        },
        endDate: {
          gte: today,
        },
      },
      select: {
        userId: true,
      },
    });

    // Create a set of user IDs who are on leave today
    const usersOnLeave = new Set(leaves.map(l => l.userId));

    // Create a map of attendance by userId
    const attendanceMap = {};
    attendances.forEach(att => {
      attendanceMap[att.userId] = att;
    });

    // Combine data
    const employees = users.map(user => {
      const attendance = attendanceMap[user.id];
      const isOnLeave = usersOnLeave.has(user.id);

      let status = "ABSENT";
      if (isOnLeave) {
        status = "ON_LEAVE";
      } else if (attendance?.checkIn) {
        status = "PRESENT";
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        status,
        checkIn: attendance?.checkIn || null,
      };
    });

    return NextResponse.json({
      success: true,
      count: employees.length,
      employees,
    });

  } catch (error) {
    console.error("Get all employees error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Something went wrong",
      },
      { status: 500 }
    );
  }
}
