"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Eye, EyeOff, Lock, CheckCircle2, XCircle } from "lucide-react";
import api from "@/lib/axios";
import { toast } from "sonner";

export function FirstLoginPasswordChange({ open, onSuccess }) {
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword:  "",
    confirmPassword: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Password validation rules
  const rules = [
    { label: "At least 8 characters", check: (pwd) => pwd.length >= 8 },
    { label: "One uppercase letter", check: (pwd) => /[A-Z]/.test(pwd) },
    { label: "One lowercase letter", check: (pwd) => /[a-z]/.test(pwd) },
    { label: "One number", check: (pwd) => /[0-9]/.test(pwd) },
    { label: "One special character (@#$%&*! )", check: (pwd) => /[@#$%&*!]/.test(pwd) },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // Check all rules
    const allRulesPassed = rules.every((rule) => rule.check(formData.newPassword));
    if (!allRulesPassed) {
      toast.error("Please meet all password requirements");
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post("/api/auth/change-password", formData);

      if (response.data.success) {
        toast.success("Password changed successfully!");
        onSuccess?.();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-125" hideClose>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Your Password
          </DialogTitle>
          <DialogDescription>
            For security reasons, please change your temporary password before continuing.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <div className="relative">
              <Input
                id="currentPassword"
                type={showPassword.current ?  "text" : "password"}
                value={formData.currentPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, currentPassword: e.target.value }))
                }
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() =>
                  setShowPassword((prev) => ({ ...prev, current: !prev.current }))
                }
              >
                {showPassword.current ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showPassword.new ? "text" :  "password"}
                value={formData.newPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, newPassword: e.target.value }))
                }
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => setShowPassword((prev) => ({ ...prev, new: !prev.new }))}
              >
                {showPassword.new ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showPassword.confirm ? "text" :  "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() =>
                  setShowPassword((prev) => ({ ...prev, confirm: !prev.confirm }))
                }
              >
                {showPassword.confirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">Password Requirements:</p>
            <div className="space-y-1">
              {rules.map((rule, index) => {
                const passed = rule.check(formData.newPassword);
                return (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {passed ? (
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                    ) : (
                      <XCircle className="h-3 w-3 text-gray-400" />
                    )}
                    <span className={passed ? "text-green-700" : "text-muted-foreground"}>
                      {rule.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? "Changing Password..." : "Change Password"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}