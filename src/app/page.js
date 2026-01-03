"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (! loading) {
      if (! user) {
        // Not logged in → Go to auth
        router.push("/auth");
      } else if (user. role === "HR") {
        // HR user → Go to admin dashboard
        router.push("/admin");
      } else {
        // Employee → Go to employee dashboard
        router. push("/employee");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}
