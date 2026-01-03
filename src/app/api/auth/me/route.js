import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const { user, response } = await requireAuth(request);

    if (response) {
      return response; // Return error response
    }

    return NextResponse.json(
      { 
        success: true,
        user 
      },
      { status:  200 }
    );
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Internal server error",
        message: "Something went wrong" 
      },
      { status: 500 }
    );
  }
}