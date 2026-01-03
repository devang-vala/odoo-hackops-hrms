"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasProcessed = useRef(false); // Prevent double processing

  useEffect(() => {
    // Only process once
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const token = searchParams.get("token");
    const redirect = searchParams.get("redirect") || "/";

    console.log("Callback page - Token:", token ?  "Received" : "Missing");
    console.log("Callback page - Redirect:", redirect);

    if (token) {
      // Store token in localStorage
      localStorage.setItem("token", token);
      
      console.log("Token stored, redirecting to:", redirect);
      
      // Use replace instead of href to avoid history issues
      window.location.replace(redirect);
    } else {
      console.error("No token received");
      router.replace("/auth?error=no_token");
    }
  }, []); // Empty deps - only run once

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            <p className="text-center text-muted-foreground">
              Completing sign in...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}