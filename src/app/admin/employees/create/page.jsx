"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoUpload } from "@/components/upload/LogoUpload";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { ArrowLeft, Copy, CheckCircle2, UserPlus } from "lucide-react";
import Link from "next/link";

export default function CreateEmployeePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [copied, setCopied] = useState({ email: false, password: false, employeeId: false });

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    companyLogo: null,
    joiningYear: new Date().getFullYear(),
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || ! formData.companyName) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      const response = await api.post("/api/admin/employee/create", formData);

      if (response.data.success) {
        setCredentials(response.data.credentials);
        setShowCredentials(true);
        toast.success("Employee created successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create employee");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopied((prev) => ({ ...prev, [field]: true }));
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => {
      setCopied((prev) => ({ ...prev, [field]:  false }));
    }, 2000);
  };

  const handleClose = () => {
    setShowCredentials(false);
    router.push("/admin/employees");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Create New Employee</h1>
          <p className="text-muted-foreground">
            Add a new employee to the system
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Company Logo */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Company Logo</CardTitle>
              <CardDescription>Upload your company logo (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <LogoUpload
                value={formData.companyLogo}
                onChange={(url) => setFormData((prev) => ({ ...prev, companyLogo: url }))}
                organizationId={formData.companyName || "default"}
              />
            </CardContent>
          </Card>

          {/* Company Information */}
          <Card>
            <CardHeader>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Enter company details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="companyName"
                  name="companyName"
                  placeholder="e.g., Odoo India"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="joiningYear">
                  Joining Year <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="joiningYear"
                  name="joiningYear"
                  type="number"
                  min="2000"
                  max="2100"
                  value={formData.joiningYear}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Information</CardTitle>
              <CardDescription>Enter employee details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="e.g., John Doe"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john.doe@company.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+91 1234567890"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex gap-4">
          <Button type="submit" disabled={submitting} size="lg" className="w-full lg:w-auto">
            {submitting ? (
              "Creating..."
            ) : (
              <>
                <UserPlus className="mr-2 h-5 w-5" />
                Create Employee
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/employees")}
            disabled={submitting}
            size="lg"
          >
            Cancel
          </Button>
        </div>
      </form>

      {/* Credentials Dialog */}
      <Dialog open={showCredentials} onOpenChange={setShowCredentials}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="h-6 w-6" />
              Employee Created Successfully! 
            </DialogTitle>
            <DialogDescription>
              Save these credentials and share them with the employee
            </DialogDescription>
          </DialogHeader>

          {credentials && (
            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm font-medium text-yellow-800">⚠️ Important</p>
                <p className="text-xs text-yellow-700 mt-1">
                  This password will only be shown once. Please save it securely.
                </p>
              </div>

              <div className="space-y-3">
                {/* Employee ID */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Employee ID</Label>
                  <div className="flex items-center gap-2">
                    <Input value={credentials.employeeId} readOnly className="font-mono" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(credentials.employeeId, "employeeId")}
                    >
                      {copied.employeeId ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Input value={credentials.email} readOnly />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(credentials.email, "email")}
                    >
                      {copied.email ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Temporary Password */}
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Temporary Password</Label>
                  <div className="flex items-center gap-2">
                    <Input value={credentials.tempPassword} readOnly className="font-mono" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleCopy(credentials.tempPassword, "password")}
                    >
                      {copied.password ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800">📝 Next Steps</p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Share these credentials with the employee</li>
                  <li>Employee must change password on first login</li>
                  <li>Employee ID is auto-generated and cannot be changed</li>
                </ul>
              </div>

              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}