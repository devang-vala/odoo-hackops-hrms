import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

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
          message: "Only HR can access dashboard stats",
        },
        { status: 403 }
      );
    }

    // Get today's date (start and end)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get total employees count
    const totalEmployees = await prisma.user.count();

    // Get today's attendance - present count
    const presentToday = await prisma.attendance.count({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ["PRESENT", "HALF_DAY"],
        },
      },
    });

    // Get employees on leave today
    const onLeaveToday = await prisma.leave.count({
      where: {
        status: "APPROVED",
        startDate: {
          lte: today,
        },
        endDate: {
          gte: today,
        },
      },
    });

    // Get pending time off requests
    const pendingTimeOff = await prisma.leave.count({
      where: {
        status: "PENDING",
      },
    });

    // Get recent leave requests (last 5)
    const recentLeaveRequests = await prisma.leave.findMany({
      where: {
        status: "PENDING",
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
      orderBy: {
        createdAt: "desc",
      },
      take: 5,
    });

    // Get today's absentees (employees who haven't checked in)
    const employeesWithAttendance = await prisma.attendance.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
      select: {
        userId: true,
      },
    });

    const presentUserIds = employeesWithAttendance.map((a) => a.userId);

    // Get users on approved leave today
    const usersOnLeave = await prisma.leave.findMany({
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

    const onLeaveUserIds = usersOnLeave.map((l) => l.userId);

    // Get absentees (not present and not on approved leave)
    const absentees = await prisma.user.findMany({
      where: {
        id: {
          notIn: [...presentUserIds, ...onLeaveUserIds],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
      },
      take: 10,
    });

    // Format leave requests for frontend
    const formattedLeaveRequests = recentLeaveRequests.map((leave) => ({
      id: leave.id,
      leaveType: leave.leaveType,
      startDate: leave.startDate.toISOString().split("T")[0],
      endDate: leave.endDate.toISOString().split("T")[0],
      totalDays: leave.totalDays,
      reason: leave.reason,
      status: leave.status,
      user: leave.user,
      createdAt: leave.createdAt,
    }));

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalEmployees,
          presentToday,
          onLeaveToday,
          pendingTimeOff,
        },
        recentLeaveRequests: formattedLeaveRequests,
        absentees,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to fetch dashboard stats",
      },
      { status: 500 }
    );
  }
}
