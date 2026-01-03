import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    let whereClause = {
      userId: user.id,
    };

    if (status) {
      whereClause.status = status;
    }

    const leaves = await prisma.leave.findMany({
      where: whereClause,
      include: {
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format for frontend (shadcn calendar compatible)
    const formattedLeaves = leaves.map((leave) => ({
      id: leave.id,
      leaveType: leave.leaveType,
      dateRange: {
        from: leave.startDate.toISOString().split('T')[0],
        to: leave.endDate.toISOString().split('T')[0],
      },
      startDate: leave.startDate.toISOString().split('T')[0],
      endDate: leave.endDate.toISOString().split('T')[0],
      totalDays: leave.totalDays,
      reason: leave.reason,
      status: leave.status,
      hrComments: leave.hrComments,
      approvedBy: leave.approver,
      approvedAt: leave.approvedAt,
      rejectedAt: leave.rejectedAt,
      cancelledAt: leave.cancelledAt,
      createdAt: leave.createdAt,
    }));

    // Get leave balance
    const employee = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        paidLeaveBalance:  true,
        sickLeaveBalance: true,
        casualLeaveBalance: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        leaves: formattedLeaves,
        balance: employee,
      },
      { status:  200 }
    );
  } catch (error) {
    console.error("Get leaves error:", error);
    return NextResponse.json(
      {
        success: false,
        error:  "Internal server error",
        message: "Failed to fetch leaves",
      },
      { status: 500 }
    );
  }
}