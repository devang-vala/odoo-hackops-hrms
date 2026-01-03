import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-middleware";

// GET calculated payroll for an employee (on-the-fly, NOT stored)
// Query params: userId, month, year
export async function GET(request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.response) return authResult.response;
    const user = authResult.user;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const month = parseInt(searchParams.get("month"));
    const year = parseInt(searchParams.get("year"));

    if (!userId || !month || !year) {
      return NextResponse.json(
        { success: false, error: "userId, month, and year are required" },
        { status: 400 }
      );
    }

    // Only HR or the employee themselves can view
    if (user.role !== "HR" && user.id !== userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    // 1. Get salary info
    const salaryInfo = await prisma.salaryInfo.findUnique({
      where: { userId },
    });

    if (!salaryInfo) {
      return NextResponse.json(
        { success: false, error: "Salary info not configured for this employee" },
        { status: 404 }
      );
    }

    // 2. Get employee salary components
    const employeeComponents = await prisma.employeeSalaryComponent.findMany({
      where: { userId },
      include: {
        salaryComponentType: true,
      },
      orderBy: {
        salaryComponentType: {
          sortOrder: "asc",
        },
      },
    });

    if (employeeComponents.length === 0) {
      return NextResponse.json(
        { success: false, error: "Salary components not configured for this employee" },
        { status: 404 }
      );
    }

    // 3. Get attendance for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 4. Get approved leaves for the month
    const leaves = await prisma.leave.findMany({
      where: {
        userId,
        status: "APPROVED",
        OR: [
          {
            startDate: { gte: startDate, lte: endDate },
          },
          {
            endDate: { gte: startDate, lte: endDate },
          },
        ],
      },
    });

    // 5. Calculate working days and attendance
    const totalWorkingDays = calculateWorkingDays(year, month, salaryInfo.workingDaysPerWeek);
    
    let daysPresent = 0;
    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;

    // Count attendance
    for (const record of attendanceRecords) {
      if (record.status === "PRESENT") {
        daysPresent++;
      } else if (record.status === "HALF_DAY") {
        daysPresent += 0.5;
      }
    }

    // Count leaves
    for (const leave of leaves) {
      const leaveStart = new Date(Math.max(leave.startDate.getTime(), startDate.getTime()));
      const leaveEnd = new Date(Math.min(leave.endDate.getTime(), endDate.getTime()));
      const leaveDays = Math.ceil((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1;

      if (leave.leaveType === "UNPAID") {
        unpaidLeaveDays += leaveDays;
      } else {
        paidLeaveDays += leaveDays;
      }
    }

    const payableDays = daysPresent + paidLeaveDays;
    const monthlyWage = salaryInfo.monthlyWage;
    const perDaySalary = monthlyWage / totalWorkingDays;

    // 6. Calculate salary components
    let basicSalary = 0;
    const earnings = [];
    const deductions = [];

    // First pass: Calculate Basic Salary
    const basicComponent = employeeComponents.find(
      (c) => c.salaryComponentType.name === "Basic Salary"
    );
    if (basicComponent) {
      if (basicComponent.computationType === "PERCENTAGE") {
        basicSalary = (monthlyWage * basicComponent.percentageValue) / 100;
      } else {
        basicSalary = basicComponent.fixedAmount || 0;
      }
    }

    // Second pass: Calculate all components
    let totalEarnings = 0;
    let totalDeductions = 0;

    for (const comp of employeeComponents) {
      const { salaryComponentType, computationType, percentageValue, fixedAmount, percentageBase } = comp;
      let amount = 0;

      if (computationType === "PERCENTAGE") {
        const base = percentageBase === "WAGE" ? monthlyWage : basicSalary;
        amount = (base * percentageValue) / 100;
      } else {
        amount = fixedAmount || 0;
      }

      // Round to 2 decimal places
      amount = Math.round(amount * 100) / 100;

      const componentData = {
        name: salaryComponentType.name,
        category: salaryComponentType.category,
        computationType,
        percentageValue,
        fixedAmount,
        percentageBase,
        amount,
      };

      if (salaryComponentType.category === "EARNING") {
        earnings.push(componentData);
        totalEarnings += amount;
      } else {
        deductions.push(componentData);
        totalDeductions += amount;
      }
    }

    // 7. Apply attendance-based pro-rating
    const attendanceRatio = payableDays / totalWorkingDays;
    const unpaidDeduction = (totalWorkingDays - payableDays) * perDaySalary;

    const proRatedEarnings = Math.round(totalEarnings * attendanceRatio * 100) / 100;
    const proRatedDeductions = Math.round(totalDeductions * attendanceRatio * 100) / 100;
    const netSalary = Math.round((proRatedEarnings - proRatedDeductions) * 100) / 100;

    // 8. Get employee info
    const employee = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, employeeId: true },
    });

    return NextResponse.json({
      success: true,
      payroll: {
        employee,
        month,
        year,
        salaryInfo: {
          monthlyWage,
          yearlyWage: salaryInfo.yearlyWage,
          workingDaysPerWeek: salaryInfo.workingDaysPerWeek,
        },
        attendance: {
          totalWorkingDays,
          daysPresent,
          paidLeaveDays,
          unpaidLeaveDays,
          payableDays,
          attendancePercentage: Math.round((payableDays / totalWorkingDays) * 100),
        },
        earnings,
        deductions,
        summary: {
          grossEarnings: totalEarnings,
          totalDeductions,
          proRatedEarnings,
          proRatedDeductions,
          unpaidDeduction: Math.round(unpaidDeduction * 100) / 100,
          netSalary,
        },
      },
    });
  } catch (error) {
    console.error("Error calculating payroll:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate payroll" },
      { status: 500 }
    );
  }
}

// Helper function to calculate working days in a month
function calculateWorkingDays(year, month, workingDaysPerWeek) {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

    if (workingDaysPerWeek === 5) {
      // Mon-Fri
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    } else if (workingDaysPerWeek === 6) {
      // Mon-Sat
      if (dayOfWeek !== 0) {
        workingDays++;
      }
    } else {
      // All days
      workingDays++;
    }
  }

  return workingDays;
}
