"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  FileText,
  Loader2,
  Info,
} from "lucide-react";

export default function EmployeePayrollPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payroll, setPayroll] = useState(null);
  const [error, setError] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
    if (user?.role === "HR") {
      router.push("/admin");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchPayroll();
    }
  }, [user, selectedMonth, selectedYear]);

  const fetchPayroll = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get(`/api/payroll/my-payroll?month=${selectedMonth}&year=${selectedYear}`);
      if (response.data.success) {
        setPayroll(response.data.payroll);
      } else {
        setError(response.data.error);
        setPayroll(null);
      }
    } catch (err) {
      console.error("Failed to fetch payroll:", err);
      setError(err.response?.data?.error || "Failed to fetch payroll");
      setPayroll(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getMonthName = (month) => {
    return new Date(2000, month - 1).toLocaleString("default", { month: "long" });
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Payroll</h1>
          <p className="text-muted-foreground">View your salary details and breakdown</p>
        </div>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Payroll</h1>
          <p className="text-muted-foreground">View your salary details and breakdown</p>
        </div>
        <Card>
          <CardContent className="pt-12 pb-12">
            <div className="text-center text-muted-foreground">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">Payroll Not Available</h3>
              <p>{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Payroll</h1>
          <p className="text-muted-foreground">
            View your salary details and breakdown
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <Select value={selectedMonth.toString()} onValueChange={(v) => setSelectedMonth(parseInt(v))}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <SelectItem key={m} value={m.toString()}>
                  {getMonthName(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
            <SelectTrigger className="w-full sm:w-28">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2025, 2026].map((y) => (
                <SelectItem key={y} value={y.toString()}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {payroll && (
        <>
          {/* Summary Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-green-700">Gross Earnings</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-800 truncate">
                      {formatCurrency(payroll.summary.grossEarnings)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200 bg-red-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-red-100">
                    <TrendingDown className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-red-700">Total Deductions</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-800 truncate">
                      {formatCurrency(payroll.summary.totalDeductions)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50/50 sm:col-span-2 lg:col-span-1">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100">
                    <Wallet className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-blue-700">Net Pay</p>
                    <p className="text-xl sm:text-2xl font-bold text-blue-800 truncate">
                      {formatCurrency(payroll.summary.netSalary)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Attendance Impact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Attendance Summary
              </CardTitle>
              <CardDescription>
                Your attendance impact on this month's salary
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                <div className="p-3 sm:p-4 rounded-lg bg-slate-50 text-center">
                  <p className="text-xl sm:text-2xl font-bold">{payroll.attendance.totalWorkingDays}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Working Days</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-green-50 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-green-600">{payroll.attendance.daysPresent}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Days Present</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-blue-50 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">{payroll.attendance.paidLeaveDays}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Paid Leave</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-red-50 text-center">
                  <p className="text-xl sm:text-2xl font-bold text-red-600">{payroll.attendance.unpaidLeaveDays}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Unpaid Leave</p>
                </div>
                <div className="p-3 sm:p-4 rounded-lg bg-purple-50 text-center col-span-2 sm:col-span-3 lg:col-span-1">
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">{payroll.attendance.payableDays}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">Payable Days</p>
                </div>
              </div>
              {payroll.attendance.unpaidLeaveDays > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-2">
                  <Info className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-yellow-800">
                    Your salary has been reduced proportionally for {payroll.attendance.unpaidLeaveDays} unpaid leave day(s).
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Salary Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Earnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700">
                  <TrendingUp className="h-5 w-5" />
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-green-50">
                          <TableHead>Component</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payroll.earnings?.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{item.name}</TableCell>
                            <TableCell className="text-right whitespace-nowrap">
                              {formatCurrency(item.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="bg-green-50 font-bold">
                          <TableCell>Total Earnings</TableCell>
                          <TableCell className="text-right text-green-700 whitespace-nowrap">
                            {formatCurrency(payroll.summary.grossEarnings)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deductions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <TrendingDown className="h-5 w-5" />
                  Deductions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg border overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-red-50">
                          <TableHead>Component</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payroll.deductions?.length > 0 ? (
                          payroll.deductions.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell className="text-right whitespace-nowrap">
                                {formatCurrency(item.amount)}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-muted-foreground py-4">
                              No deductions
                            </TableCell>
                          </TableRow>
                        )}
                        <TableRow className="bg-red-50 font-bold">
                          <TableCell>Total Deductions</TableCell>
                          <TableCell className="text-right text-red-700 whitespace-nowrap">
                            {formatCurrency(payroll.summary.totalDeductions)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Net Pay Summary */}
          <Card className="border-2 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-full bg-blue-100 flex-shrink-0">
                    <DollarSign className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-base sm:text-lg text-muted-foreground">
                      Net Salary for {getMonthName(selectedMonth)} {selectedYear}
                    </p>
                    <p className="text-3xl sm:text-4xl font-bold text-blue-700 truncate">
                      {formatCurrency(payroll.summary.netSalary)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Based on {payroll.attendance.attendancePercentage}% attendance
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-700 px-4 py-2 flex-shrink-0">
                  Calculated
                </Badge>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
