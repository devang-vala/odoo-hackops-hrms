import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireHR } from "@/lib/auth-middleware";

// GET employee salary components (query param: userId)
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

    return NextResponse.json({
      success: true,
      employeeComponents,
    });
  } catch (error) {
    console.error("Error fetching employee components:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch employee components" },
      { status: 500 }
    );
  }
}

// POST/PUT employee salary components (HR only)
// Expects: { userId, components: [{ salaryComponentTypeId, computationType, percentageValue, fixedAmount, percentageBase }] }
export async function POST(request) {
  try {
    const authResult = await requireHR(request);
    if (authResult.response) return authResult.response;

    const body = await request.json();
    const { userId, components } = body;

    if (!userId || !components || !Array.isArray(components)) {
      return NextResponse.json(
        { success: false, error: "userId and components array are required" },
        { status: 400 }
      );
    }

    // Upsert each component
    const results = [];
    for (const comp of components) {
      const { salaryComponentTypeId, computationType, percentageValue, fixedAmount, percentageBase } = comp;

      if (!salaryComponentTypeId || !computationType) {
        continue;
      }

      const result = await prisma.employeeSalaryComponent.upsert({
        where: {
          userId_salaryComponentTypeId: {
            userId,
            salaryComponentTypeId,
          },
        },
        update: {
          computationType,
          percentageValue: computationType === "PERCENTAGE" ? percentageValue : null,
          fixedAmount: computationType === "FIXED" ? fixedAmount : null,
          percentageBase: computationType === "PERCENTAGE" ? percentageBase : null,
        },
        create: {
          userId,
          salaryComponentTypeId,
          computationType,
          percentageValue: computationType === "PERCENTAGE" ? percentageValue : null,
          fixedAmount: computationType === "FIXED" ? fixedAmount : null,
          percentageBase: computationType === "PERCENTAGE" ? percentageBase : null,
        },
      });

      results.push(result);
    }

    return NextResponse.json({
      success: true,
      components: results,
    });
  } catch (error) {
    console.error("Error saving employee components:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save employee components" },
      { status: 500 }
    );
  }
}
