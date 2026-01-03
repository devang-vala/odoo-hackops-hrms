"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { FirstLoginPasswordChange } from "@/components/auth/FirstLoginPasswordChange";
import { toast } from "sonner";
import Link from "next/link";

export default function AuthPage() {
  const { login, loading:  authLoading, user, refreshUser } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showFirstLoginModal, setShowFirstLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Redirect if already logged in and not first login
    if (! authLoading && user && !user.isFirstLogin) {
      if (user.role === "HR") {
        router.push("/admin");
      } else {
        router.push("/employee");
      }
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await login(formData.email, formData.password);

      // ✅ Only show password change modal for EMPLOYEES on first login
      if (response.user.isFirstLogin && response.user.role === "EMPLOYEE") {
        setShowFirstLoginModal(true);
      } else if (response.user.isFirstLogin && response.user.role === "HR") {
        // ✅ HR with first login - just update flag and redirect
        toast.success("Login successful!");
        // You can optionally auto-clear the flag for HR
        // or let them continue normally
      } else {
        toast.success("Login successful!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChangeSuccess = async () => {
    setShowFirstLoginModal(false);
    await refreshUser();
    toast.success("Welcome!  Redirecting to dashboard...");
    
    // Redirect based on role
    if (user?.role === "HR") {
      router.push("/admin");
    } else {
      router.push("/employee");
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <LogIn className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@company.com"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
            <div className="mt-4">
  <div className="relative">
    <div className="absolute inset-0 flex items-center">
      <span className="w-full border-t" />
    </div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-background px-2 text-muted-foreground">
        Don't have an account?
      </span>
    </div>
  </div>
  
  <Link href="/auth/signup">
    <Button variant="outline" className="w-full mt-4">
      Sign Up as HR
    </Button>
  </Link>
</div>
          </form>
        </CardContent>
      </Card>

      {/* First Login Password Change Modal - Only for Employees */}
      <FirstLoginPasswordChange
        open={showFirstLoginModal}
        onSuccess={handlePasswordChangeSuccess}
      />
    </div>
  );
}