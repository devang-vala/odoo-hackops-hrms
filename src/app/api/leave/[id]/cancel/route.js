import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getISTDateOnly } from "@/lib/timezone";

export async function PATCH(request, { params }) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    const { id } = params;

    // Find leave request
    const leave = await prisma.leave.findUnique({
      where: { id },
    });

    if (!leave) {
      return NextResponse.json(
        {
          success: false,
          error: "Leave not found",
          message: "Leave request with this ID does not exist",
        },
        { status:  404 }
      );
    }

    // Check ownership
    if (leave.userId !== user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message: "You can only cancel your own leave requests",
        },
        { status: 403 }
      );
    }

    // Check if already cancelled
    if (leave.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          error: "Already cancelled",
          message: "Leave request is already cancelled",
        },
        { status: 400 }
      );
    }

    // Can only cancel pending or approved leaves before start date
    const today = getISTDateOnly();

    if (leave.startDate <= today) {
      return NextResponse.json(
        {
          success: false,
          error:  "Cannot cancel",
          message: "Cannot cancel leave after it has started",
        },
        { status: 400 }
      );
    }

    // If approved, refund leave balance
    if (leave.status === "APPROVED" && leave.leaveType !== "UNPAID") {
      const balanceField = `${leave.leaveType.toLowerCase()}LeaveBalance`;

      await prisma.user.update({
        where: { id: leave.userId },
        data: {
          [balanceField]: {
            increment:  leave.totalDays,
          },
        },
      });

      // Delete attendance records
      await prisma.attendance.deleteMany({
        where: {
          userId: leave.userId,
          date: {
            gte: leave.startDate,
            lte: leave.endDate,
          },
          status: "LEAVE",
        },
      });
    }

    // Cancel leave
    const cancelledLeave = await prisma.leave.update({
      where: { id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        success:  true,
        message: "Leave request cancelled successfully",
        leave:  {
          ...cancelledLeave,
          dateRange: {
            from: cancelledLeave.startDate.toISOString().split("T")[0],
            to: cancelledLeave.endDate.toISOString().split("T")[0],
          },
          startDate: cancelledLeave.startDate.toISOString().split("T")[0],
          endDate: cancelledLeave.endDate.toISOString().split("T")[0],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Cancel leave error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to cancel leave",
      },
      { status:  500 }
    );
  }
}