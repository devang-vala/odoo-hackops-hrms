import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { getISTDateOnly } from "@/lib/timezone";

export async function PATCH(request, context) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    // Check if user is HR
    if (user.role !== "HR") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message: "Only HR can approve/reject leave requests",
        },
        { status: 403 }
      );
    }

    // ✅ Fix:  Await params in Next.js 15+
    const params = await context.params;
    const { id } = params;

    // Validate id
    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request",
          message: "Leave ID is required",
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status, hrComments } = body;

    // Validation
    if (! status || !["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid status",
          message: "Status must be either APPROVED or REJECTED",
        },
        { status: 400 }
      );
    }

    // Find leave request
    const leave = await prisma.leave.findUnique({
      where: { id },
      include:  {
        user: true,
      },
    });

    if (!leave) {
      return NextResponse.json(
        {
          success: false,
          error:  "Leave not found",
          message: "Leave request with this ID does not exist",
        },
        { status: 404 }
      );
    }

    // Check if HR is trying to approve their own leave
    if (leave.userId === user.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message: "You cannot approve/reject your own leave request",
        },
        { status: 403 }
      );
    }

    // Check if already approved/rejected
    if (leave.status !== "PENDING") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid operation",
          message: `Leave request is already ${leave.status.toLowerCase()}`,
        },
        { status: 400 }
      );
    }

    // Check if leave dates have passed
    const today = getISTDateOnly();

    if (leave.endDate < today) {
      return NextResponse.json(
        {
          success: false,
          error:  "Expired",
          message: "Cannot approve/reject leave for past dates",
        },
        { status: 400 }
      );
    }

    let updateData = {
      status,
      hrComments:  hrComments || null,
      approvedBy: user.id,
    };

    if (status === "APPROVED") {
      updateData.approvedAt = new Date();

      // Deduct leave balance
      if (leave.leaveType !== "UNPAID") {
        const balanceField = `${leave.leaveType.toLowerCase()}LeaveBalance`;

        await prisma.user.update({
          where: { id: leave.userId },
          data: {
            [balanceField]: {
              decrement: leave.totalDays,
            },
          },
        });

        // Create attendance records for leave period
        const leaveDate = new Date(leave.startDate);
        const endDate = new Date(leave.endDate);

        while (leaveDate <= endDate) {
          const dayOfWeek = leaveDate.getDay();

          // Only create for weekdays
          if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            await prisma.attendance.upsert({
              where: {
                userId_date: {
                  userId: leave.userId,
                  date: new Date(leaveDate),
                },
              },
              update:  {
                status: "LEAVE",
                remarks: `${leave.leaveType} Leave`,
              },
              create: {
                userId: leave.userId,
                date: new Date(leaveDate),
                status: "LEAVE",
                remarks: `${leave.leaveType} Leave`,
                isManual: true,
                createdBy: user.id,
              },
            });
          }

          leaveDate.setDate(leaveDate.getDate() + 1);
        }
      }
    } else if (status === "REJECTED") {
      updateData.rejectedAt = new Date();
    }

    // Update leave
    const updatedLeave = await prisma.leave.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
          },
        },
        approver: {
          select:  {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `Leave request ${status.toLowerCase()} successfully`,
        leave: {
          ...updatedLeave,
          dateRange: {
            from: updatedLeave.startDate.toISOString().split("T")[0],
            to: updatedLeave.endDate.toISOString().split("T")[0],
          },
          startDate: updatedLeave.startDate.toISOString().split("T")[0],
          endDate: updatedLeave.endDate.toISOString().split("T")[0],
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Approve/reject leave error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Failed to update leave status",
      },
      { status: 500 }
    );
  }
}