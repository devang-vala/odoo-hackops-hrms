import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/jwt";
import axios from "axios";

// Helper function to check if email should be admin
function isAdminEmail(email) {
  const normalizedEmail = email.toLowerCase();
  return normalizedEmail.endsWith(".hackops.admin@gmail.com");
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state") || "/";
    const error = searchParams.get("error");

    // Get app URL with fallback
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const redirectUri = `${appUrl}/api/auth/callback/google`;

    // Handle OAuth errors
    if (error) {
      console.error("Google OAuth error:", error);
      return NextResponse.redirect(`${appUrl}/auth? error=oauth_${error}`);
    }

    if (!code) {
      return NextResponse.redirect(`${appUrl}/auth?error=no_code`);
    }

    // Validate env vars
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      return NextResponse.redirect(`${appUrl}/auth?error=config_error`);
    }

    console.log("Exchanging code for token...");

    // Exchange code for tokens
    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret:  process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const { access_token } = tokenResponse.data;

    console.log("Getting user info from Google...");

    // Get user info from Google
    const userInfoResponse = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization:  `Bearer ${access_token}`,
        },
      }
    );

    const googleUser = userInfoResponse.data;

    console.log("Google user:", googleUser.email);

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
    });

    if (!user) {
      console.log("Creating new user...");
      // Determine role based on email
      const userRole = isAdminEmail(googleUser.email) ? "HR" : "EMPLOYEE";

      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          googleId: googleUser.id,
          role: userRole,
        },
      });
    } else {
      console.log("User exists, updating Google ID if needed...");
      // Update Google ID if not set
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.id },
        });
      }
    }

    console.log("Generating JWT token...");

    // Generate JWT token
    const token = generateToken(user);

    // Redirect to frontend with token
    const redirectUrl = user.role === "HR" ?  "/admin" : state;
    const response = NextResponse.redirect(
      `${appUrl}/auth/callback?token=${token}&redirect=${redirectUrl}`
    );

    return response;
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    console.error("Error details:", error.response?.data || error.message);
    
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${appUrl}/auth?error=oauth_failed`);
  }
}