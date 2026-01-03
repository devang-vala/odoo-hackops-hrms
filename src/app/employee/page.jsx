"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import {
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  MinusCircle,
  TrendingUp,
  CalendarDays,
  DollarSign,
  Briefcase,
  Heart,
  AlertCircle,
} from "lucide-react";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [todayAttendance, setTodayAttendance] = useState(null);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [leaveBalance, setLeaveBalance] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch today's attendance
      const today = new Date().toISOString().split("T")[0];
      const attendanceRes = await api.get(`/api/attendance/my-attendance? startDate=${today}&endDate=${today}`);
      setTodayAttendance(attendanceRes.data.attendances[0] || null);

      // Fetch this month's stats
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const statsRes = await api.get(`/api/attendance/my-attendance? month=${year}-${month}`);
      setAttendanceStats(statsRes. data.stats);

      // Fetch leave balance and recent leaves
      const leavesRes = await api.get("/api/leave/my-leaves");
      setLeaveBalance(leavesRes.data.balance);
      setRecentLeaves(leavesRes.data.leaves. slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      await api.post("/api/attendance/check-in", {});
      fetchDashboardData();
    } catch (error) {
      console.error(error);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      await api.post("/api/attendance/check-out", {});
      fetchDashboardData();
    } catch (error) {
      console.error(error);
    } finally {
      setCheckingOut(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: "secondary",
      APPROVED: "default",
      REJECTED: "destructive",
      CANCELLED: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  const StatCard = ({ title, value, icon: Icon, description, color }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <>
            <div className="text-3xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?. name?. split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">Here's what's happening with your work today</p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <Clock className="w-4 h-4 mr-2" />
          {currentTime}
        </Badge>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Check In/Out Card */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-24 w-full" />
            ) : todayAttendance ? (
              <>
                <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-2xl font-semibold text-green-600 mt-1">Checked In</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      at {todayAttendance.checkIn}
                    </p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                {! todayAttendance.checkOut && (
                  <Button
                    onClick={handleCheckOut}
                    disabled={checkingOut}
                    className="w-full"
                    size="lg"
                  >
                    {checkingOut ? "Checking Out..." : "Check Out"}
                  </Button>
                )}
                {todayAttendance.checkOut && (
                  <div className="text-center py-2 text-muted-foreground">
                    Checked out at {todayAttendance.checkOut}
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-2xl font-semibold text-muted-foreground mt-1">
                      Not Checked In
                    </p>
                  </div>
                  <Clock className="w-12 h-12 text-muted-foreground" />
                </div>
                <Button onClick={handleCheckIn} disabled={checkingIn} className="w-full" size="lg">
                  <Clock className="mr-2 h-4 w-4" />
                  {checkingIn ? "Checking In..." : "Check In"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        {/* Leave Balance */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Balance</CardTitle>
            <CardDescription>Available leave days</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5 text-blue-500" />
                    <span className="font-medium">Paid Leave</span>
                  </div>
                  <span className="text-lg font-semibold">{leaveBalance?. paidLeaveBalance} days</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-red-500" />
                    <span className="font-medium">Sick Leave</span>
                  </div>
                  <span className="text-lg font-semibold">{leaveBalance?.sickLeaveBalance} days</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <span className="font-medium">Casual Leave</span>
                  </div>
                  <span className="text-lg font-semibold">
                    {leaveBalance?. casualLeaveBalance} days
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Present Days"
          value={attendanceStats?.present || 0}
          icon={CheckCircle}
          description="This month"
          color="bg-green-500"
        />
        <StatCard
          title="Absent Days"
          value={attendanceStats?.absent || 0}
          icon={XCircle}
          description="This month"
          color="bg-red-500"
        />
        <StatCard
          title="Half Days"
          value={attendanceStats?.halfDay || 0}
          icon={MinusCircle}
          description="This month"
          color="bg-orange-500"
        />
        <StatCard
          title="Total Hours"
          value={attendanceStats?.totalWorkHours || 0}
          icon={TrendingUp}
          description="This month"
          color="bg-blue-500"
        />
      </div>

      {/* Recent Leave Requests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Leave Requests</CardTitle>
              <CardDescription>Your latest leave applications</CardDescription>
            </div>
            <Link href="/employee/leaves">
              <Button variant="outline" size="sm">
                View All
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ?  (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : recentLeaves.length > 0 ? (
            <div className="space-y-3">
              {recentLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{leave.leaveType} Leave</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(leave.startDate).toLocaleDateString("en-IN")} -{" "}
                        {new Date(leave.endDate).toLocaleDateString("en-IN")} ({leave.totalDays}{" "}
                        days)
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(leave. status)}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
              <p>No leave requests yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/employee/attendance">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-100">
                  <Clock className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">View Attendance</p>
                  <p className="text-sm text-muted-foreground">Check your attendance records</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/employee/leaves">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-100">
                  <CalendarDays className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Apply Leave</p>
                  <p className="text-sm text-muted-foreground">Request time off</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/employee/payroll">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-purple-100">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold">View Payroll</p>
                  <p className="text-sm text-muted-foreground">Check your salary details</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}