import { NextResponse } from "next/server";
import { requireHR } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export async function GET(request, { params }) {
  try {
    const { user, response } = await requireHR(request);

    if (response) {
      return response;
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" },
        { status: 400 }
      );
    }

    // Fetch employee with detailed info
    const employee = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        employeeId: true,
        phone: true,
        paidLeaveBalance: true,
        sickLeaveBalance: true,
        casualLeaveBalance: true,
        createdAt: true,
        updatedAt: true,

        // Recent attendance (last 10 records)
        attendances: {
          take: 10,
          orderBy: { date: "desc" },
          select: {
            id: true,
            date: true,
            checkIn: true,
            checkOut: true,
            status: true,
            workHours: true,
            remarks: true,
          },
        },

        // Recent leave requests (last 10 records)
        leaves: {
          take: 10,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            leaveType: true,
            startDate: true,
            endDate: true,
            totalDays: true,
            reason: true,
            status: true,
            approvedAt: true,
            rejectedAt: true,
            createdAt: true,
            approver: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 }
      );
    }

    // Calculate additional stats
    const totalLeavesTaken = await prisma.leave.count({
      where: {
        userId: id,
        status: "APPROVED",
      },
    });

    const currentMonthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const currentMonthEnd = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1);

    const currentMonthAttendance = await prisma.attendance.count({
      where: {
        userId: id,
        date: {
          gte: currentMonthStart,
          lt: currentMonthEnd,
        },
        status: "PRESENT",
      },
    });

    const responseData = {
      ...employee,
      stats: {
        totalLeavesTaken,
        currentMonthAttendance,
        totalLeaveBalance:
          employee.paidLeaveBalance +
          employee.sickLeaveBalance +
          employee.casualLeaveBalance,
      },
    };

    return NextResponse.json(
      {
        success: true,
        employee: responseData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get employee profile error:", error);
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
