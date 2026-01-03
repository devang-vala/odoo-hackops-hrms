import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET all salary component types (fixed, system-defined)
export async function GET() {
  try {
    const componentTypes = await prisma.salaryComponentType.findMany({
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({
      success: true,
      componentTypes,
    });
  } catch (error) {
    console.error("Error fetching component types:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch component types" },
      { status: 500 }
    );
  }
}
