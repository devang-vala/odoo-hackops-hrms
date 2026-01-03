import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-middleware";

// GET current user's payroll (employee view)
// Query params: month, year
export async function GET(request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.response) return authResult.response;
    const user = authResult.user;

    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get("month")) || new Date().getMonth() + 1;
    const year = parseInt(searchParams.get("year")) || new Date().getFullYear();

    // Redirect to calculate endpoint with user's own ID
    const calculateUrl = new URL(request.url);
    calculateUrl.pathname = "/api/payroll/calculate";
    calculateUrl.searchParams.set("userId", user.id);
    calculateUrl.searchParams.set("month", month.toString());
    calculateUrl.searchParams.set("year", year.toString());

    // Fetch from calculate endpoint logic directly
    const userId = user.id;

    // 1. Get salary info
    const salaryInfo = await prisma.salaryInfo.findUnique({
      where: { userId },
    });

    if (!salaryInfo) {
      return NextResponse.json({
        success: false,
        error: "Salary info not configured. Please contact HR.",
      }, { status: 404 });
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
      return NextResponse.json({
        success: false,
        error: "Salary components not configured. Please contact HR.",
      }, { status: 404 });
    }

    // 3. Get attendance for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // 4. Get approved leaves
    const leaves = await prisma.leave.findMany({
      where: {
        userId,
        status: "APPROVED",
        OR: [
          { startDate: { gte: startDate, lte: endDate } },
          { endDate: { gte: startDate, lte: endDate } },
        ],
      },
    });

    // 5. Calculate working days and attendance
    const totalWorkingDays = calculateWorkingDays(year, month, salaryInfo.workingDaysPerWeek);
    
    let daysPresent = 0;
    let paidLeaveDays = 0;
    let unpaidLeaveDays = 0;

    for (const record of attendanceRecords) {
      if (record.status === "PRESENT") daysPresent++;
      else if (record.status === "HALF_DAY") daysPresent += 0.5;
    }

    for (const leave of leaves) {
      const leaveStart = new Date(Math.max(leave.startDate.getTime(), startDate.getTime()));
      const leaveEnd = new Date(Math.min(leave.endDate.getTime(), endDate.getTime()));
      const leaveDays = Math.ceil((leaveEnd - leaveStart) / (1000 * 60 * 60 * 24)) + 1;

      if (leave.leaveType === "UNPAID") unpaidLeaveDays += leaveDays;
      else paidLeaveDays += leaveDays;
    }

    const payableDays = daysPresent + paidLeaveDays;
    const monthlyWage = salaryInfo.monthlyWage;

    // 6. Calculate components
    let basicSalary = 0;
    const basicComponent = employeeComponents.find(c => c.salaryComponentType.name === "Basic Salary");
    if (basicComponent) {
      basicSalary = basicComponent.computationType === "PERCENTAGE"
        ? (monthlyWage * basicComponent.percentageValue) / 100
        : basicComponent.fixedAmount || 0;
    }

    const earnings = [];
    const deductions = [];
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

      amount = Math.round(amount * 100) / 100;

      const componentData = {
        name: salaryComponentType.name,
        category: salaryComponentType.category,
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

    // 7. Pro-rate based on attendance
    const attendanceRatio = payableDays / totalWorkingDays;
    const proRatedEarnings = Math.round(totalEarnings * attendanceRatio * 100) / 100;
    const proRatedDeductions = Math.round(totalDeductions * attendanceRatio * 100) / 100;
    const netSalary = Math.round((proRatedEarnings - proRatedDeductions) * 100) / 100;

    return NextResponse.json({
      success: true,
      payroll: {
        month,
        year,
        monthlyWage,
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
          netSalary,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching my payroll:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch payroll" },
      { status: 500 }
    );
  }
}

function calculateWorkingDays(year, month, workingDaysPerWeek) {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workingDays = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();

    if (workingDaysPerWeek === 5) {
      if (dayOfWeek !== 0 && dayOfWeek !== 6) workingDays++;
    } else if (workingDaysPerWeek === 6) {
      if (dayOfWeek !== 0) workingDays++;
    } else {
      workingDays++;
    }
  }

  return workingDays;
}
