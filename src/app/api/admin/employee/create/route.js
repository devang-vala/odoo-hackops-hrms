import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { prisma } from "@/lib/prisma";
import { generateEmployeeId, generatePassword } from "@/lib/utils/employeeIdGenerator";
import { sendEmployeeCredentials } from "@/lib/email";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { user, response } = await requireAuth(request);
    if (response) return response;

    // Only HR can create employees
    if (user.role !== "HR") {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message: "Only HR can create employees",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, phone, companyName, companyLogo, joiningYear } = body;

    // Validation
    if (!name || !email || !companyName) {
      return NextResponse.json(
        {
          success:  false,
          error: "Missing fields",
          message: "Name, email, and company name are required",
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email",
          message: "Please provide a valid email address",
        },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "Email exists",
          message: "An employee with this email already exists",
        },
        { status: 400 }
      );
    }

    // Generate employee ID
    const { employeeId, serialNumber, joiningYear: year } = await generateEmployeeId(
      name,
      companyName,
      joiningYear
    );

    // Generate temporary password
    const tempPassword = generatePassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create employee
    const newEmployee = await prisma.user.create({
      data: {
        name:  name.trim(),
        email: email.toLowerCase().trim(),
        phone: phone?.trim() || null,
        password: hashedPassword,
        role: "EMPLOYEE",
        employeeId,
        companyName:  companyName.trim(),
        companyLogo:  companyLogo || null,
        joiningYear: year,
        serialNumber,
        isFirstLogin: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        employeeId: true,
        phone: true,
        companyName: true,
        companyLogo: true,
        joiningYear: true,
        serialNumber: true,
        role: true,
        createdAt: true,
      },
    });

    // ✅ Send credentials email
    const emailResult = await sendEmployeeCredentials({
      name:  newEmployee.name,
      email: newEmployee.email,
      employeeId: newEmployee.employeeId,
      tempPassword,
      companyName: newEmployee.companyName,
    });

    if (! emailResult.success) {
      console.error("Failed to send credentials email:", emailResult.error);
      // Don't fail the request, just log the error
    }

    return NextResponse.json(
      {
        success: true,
        message: "Employee created successfully",
        employee: newEmployee,
        emailSent: emailResult.success, // ✅ Tell frontend if email was sent
        credentials: {
          employeeId: newEmployee.employeeId,
          email: newEmployee.email,
          tempPassword, // Still return for HR to see in UI
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create employee error:", error);
    return NextResponse.json(
      {
        success: false,
        error:  "Internal server error",
        message: error.message || "Failed to create employee",
      },
      { status: 500 }
    );
  }
}