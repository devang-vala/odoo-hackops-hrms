import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { 
  parseRequestDate, 
  getISTDateOnly,
  calculateBusinessDays 
} from "@/lib/timezone";

export async function POST(request) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const body = await request.json();
    const { leaveType, startDate, endDate, reason } = body;

    // Validation
    if (!leaveType || !startDate || !endDate || !reason) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing fields",
          message: "leaveType, startDate, endDate, and reason are required",
        },
        { status: 400 }
      );
    }

    // Parse dates from calendar format (YYYY-MM-DD)
    const start = parseRequestDate(startDate);
    const end = parseRequestDate(endDate);
    const today = getISTDateOnly();

    // Validate dates
    if (start > end) {
      return NextResponse.json(
        {
          success:  false,
          error: "Invalid dates",
          message: "Start date must be before or equal to end date",
        },
        { status: 400 }
      );
    }

    // Check if applying for past dates
    if (start < today) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid date",
          message: "Cannot apply leave for past dates",
        },
        { status: 400 }
      );
    }

    // Check minimum notice period (at least 1 day advance)
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (start < tomorrow) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient notice",
          message: "Leave must be applied at least 1 day in advance",
        },
        { status: 400 }
      );
    }

    // Calculate total leave days (business days only)
    const totalDays = calculateBusinessDays(start, end);

    if (totalDays === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid dates",
          message: "Leave period contains no working days",
        },
        { status: 400 }
      );
    }

    // Check maximum consecutive leave
    if (totalDays > 15) {
      return NextResponse.json(
        {
          success: false,
          error: "Exceeds maximum",
          message: "Cannot apply for more than 15 consecutive days of leave",
        },
        { status: 400 }
      );
    }

    // Check for overlapping leaves
    const overlappingLeaves = await prisma.leave.findMany({
      where: {
        userId: user.id,
        status: {
          in: ["PENDING", "APPROVED"],
        },
        OR: [
          {
            AND: [
              { startDate:  { lte: end } },
              { endDate:  { gte: start } },
            ],
          },
        ],
      },
    });

    if (overlappingLeaves.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Overlapping leave",
          message: "You already have a leave request for this date range",
          existingLeaves: overlappingLeaves.map((l) => ({
            id: l.id,
            from: l.startDate.toISOString().split('T')[0],
            to: l.endDate.toISOString().split('T')[0],
            status: l.status,
            leaveType: l.leaveType,
          })),
        },
        { status: 400 }
      );
    }

    // Check leave balance
    const employee = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        paidLeaveBalance: true,
        sickLeaveBalance: true,
        casualLeaveBalance: true,
      },
    });

    let balance = 0;
    if (leaveType === "PAID") balance = employee.paidLeaveBalance;
    if (leaveType === "SICK") balance = employee.sickLeaveBalance;
    if (leaveType === "CASUAL") balance = employee.casualLeaveBalance;

    if (leaveType !== "UNPAID" && balance < totalDays) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient balance",
          message: `Insufficient ${leaveType.toLowerCase()} leave balance. Available: ${balance} days, Requested: ${totalDays} days`,
        },
        { status: 400 }
      );
    }

    // Create leave request
    const leave = await prisma.leave.create({
      data: {
        userId: user.id,
        leaveType,
        startDate: start,
        endDate: end,
        totalDays,
        reason,
        status: "PENDING",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Leave request submitted successfully",
        leave: {
          id: leave.id,
          leaveType:  leave.leaveType,
          dateRange: {
            from: leave.startDate.toISOString().split('T')[0],
            to: leave.endDate.toISOString().split('T')[0],
          },
          totalDays: leave.totalDays,
          reason: leave.reason,
          status: leave.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Apply leave error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to apply for leave",
      },
      { status: 500 }
    );
  }
}