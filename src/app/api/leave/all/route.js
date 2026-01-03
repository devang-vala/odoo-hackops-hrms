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
          message: "Only HR can view all leave requests",
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const status = searchParams.get("status");
    const leaveType = searchParams.get("leaveType");

    let whereClause = {};

    if (userId) {
      whereClause.userId = userId;
    }

    if (status) {
      whereClause.status = status;
    }

    if (leaveType) {
      whereClause.leaveType = leaveType;
    }

    const leaves = await prisma.leave.findMany({
      where: whereClause,
      include: {
        user:  {
          select: {
            id: true,
            name:  true,
            email: true,
            employeeId: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    });

    // Format for frontend (shadcn calendar compatible)
    const formattedLeaves = leaves.map((leave) => ({
      id: leave.id,
      leaveType: leave.leaveType,
      dateRange: {
        from: leave.startDate.toISOString().split("T")[0],
        to: leave.endDate.toISOString().split("T")[0],
      },
      startDate: leave.startDate.toISOString().split("T")[0],
      endDate: leave.endDate.toISOString().split("T")[0],
      totalDays: leave.totalDays,
      reason: leave.reason,
      status: leave.status,
      hrComments: leave.hrComments,
      user: leave.user,
      approver: leave.approver,
      approvedAt: leave.approvedAt,
      rejectedAt: leave.rejectedAt,
      cancelledAt: leave.cancelledAt,
      createdAt: leave.createdAt,
    }));

    // Get statistics
    const stats = {
      total: leaves.length,
      pending: leaves.filter((l) => l.status === "PENDING").length,
      approved: leaves.filter((l) => l.status === "APPROVED").length,
      rejected: leaves.filter((l) => l.status === "REJECTED").length,
      cancelled: leaves.filter((l) => l.status === "CANCELLED").length,
    };

    return NextResponse.json(
      {
        success: true,
        leaves: formattedLeaves,
        stats,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get all leaves error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to fetch leaves",
      },
      { status: 500 }
    );
  }
}