import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireHR } from "@/lib/auth-middleware";

// GET salary info for an employee (query param: userId)
export async function GET(request) {
  try {
    const authResult = await requireAuth(request);
    if (authResult.response) return authResult.response;
    const user = authResult.user;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ success: false, error: "userId is required" }, { status: 400 });
    }

    // Only HR or the employee themselves can view
    if (user.role !== "HR" && user.id !== userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    const salaryInfo = await prisma.salaryInfo.findUnique({
      where: { userId },
    });

    return NextResponse.json({
      success: true,
      salaryInfo,
    });
  } catch (error) {
    console.error("Error fetching salary info:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch salary info" },
      { status: 500 }
    );
  }
}

// POST/PUT salary info for an employee (HR only)
export async function POST(request) {
  try {
    const authResult = await requireHR(request);
    if (authResult.response) return authResult.response;

    const body = await request.json();
    const { userId, monthlyWage, workingDaysPerWeek, breakTimeHours } = body;

    if (!userId || !monthlyWage) {
      return NextResponse.json(
        { success: false, error: "userId and monthlyWage are required" },
        { status: 400 }
      );
    }

    const yearlyWage = monthlyWage * 12;

    const salaryInfo = await prisma.salaryInfo.upsert({
      where: { userId },
      update: {
        monthlyWage,
        yearlyWage,
        workingDaysPerWeek: workingDaysPerWeek || 5,
        breakTimeHours: breakTimeHours || 1,
      },
      create: {
        userId,
        monthlyWage,
        yearlyWage,
        workingDaysPerWeek: workingDaysPerWeek || 5,
        breakTimeHours: breakTimeHours || 1,
      },
    });

    return NextResponse.json({
      success: true,
      salaryInfo,
    });
  } catch (error) {
    console.error("Error saving salary info:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save salary info" },
      { status: 500 }
    );
  }
}
