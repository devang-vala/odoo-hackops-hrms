"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clock, Calendar as CalendarIcon, TrendingUp, CheckCircle, XCircle, MinusCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EmployeeAttendancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [attendances, setAttendances] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [loadingData, setLoadingData] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [todayAttendance, setTodayAttendance] = useState(null);

  useEffect(() => {
    if (! loading && !user) {
      router.push("/auth");
    }
    if (user?.role === "HR") {
      router.push("/admin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchAttendance();
      fetchTodayAttendance();
    }
  }, [user, selectedMonth]);

  const fetchAttendance = async () => {
    try {
      setLoadingData(true);
      const year = selectedMonth.getFullYear();
      const month = String(selectedMonth.getMonth() + 1).padStart(2, "0");
      
      const response = await api.get(`/api/attendance/my-attendance? month=${year}-${month}`);
      setAttendances(response.data.attendances);
      setStats(response.data.stats);
    } catch (error) {
      toast.error("Failed to fetch attendance");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const fetchTodayAttendance = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const response = await api.get(`/api/attendance/my-attendance?startDate=${today}&endDate=${today}`);
      setTodayAttendance(response.data.attendances[0] || null);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckIn = async () => {
    try {
      setCheckingIn(true);
      await api.post("/api/attendance/check-in", { remarks });
      toast.success("Checked in successfully!");
      setRemarks("");
      fetchAttendance();
      fetchTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || "Check-in failed");
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setCheckingOut(true);
      await api.post("/api/attendance/check-out");
      toast.success("Checked out successfully!");
      fetchAttendance();
      fetchTodayAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || "Check-out failed");
    } finally {
      setCheckingOut(false);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      PRESENT: "default",
      ABSENT: "destructive",
      HALF_DAY: "secondary",
      LEAVE: "outline",
      WEEKEND: "secondary",
    };

    return (
      <Badge variant={variants[status] || "default"}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  if (loading || ! user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">My Attendance</h1>
          <p className="text-muted-foreground">Track your daily attendance and work hours</p>
        </div>

        {/* Check In/Out Section */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString("en-IN", { 
                weekday: "long", 
                year: "numeric", 
                month: "long", 
                day: "numeric" 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAttendance ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(todayAttendance.status)}</div>
                  </div>
                  {todayAttendance.checkIn && (
                    <div>
                      <p className="text-sm text-muted-foreground">Check In</p>
                      <p className="font-medium">{todayAttendance.checkIn}</p>
                    </div>
                  )}
                  {todayAttendance.checkOut && (
                    <div>
                      <p className="text-sm text-muted-foreground">Check Out</p>
                      <p className="font-medium">{todayAttendance.checkOut}</p>
                    </div>
                  )}
                  {todayAttendance.workHours && (
                    <div>
                      <p className="text-sm text-muted-foreground">Work Hours</p>
                      <p className="font-medium">{todayAttendance.workHours} hrs</p>
                    </div>
                  )}
                </div>

                {! todayAttendance.checkOut && (
                  <Button 
                    onClick={handleCheckOut} 
                    disabled={checkingOut}
                    className="w-full"
                  >
                    {checkingOut ? "Checking Out..." : "Check Out"}
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks (Optional)</Label>
                  <Input
                    id="remarks"
                    placeholder="e.g., On time, Working from home"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                </div>
                <Button 
                  onClick={handleCheckIn} 
                  disabled={checkingIn}
                  className="w-full"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  {checkingIn ? "Checking In..." : "Check In"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Present Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.present}</div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Absent Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.absent}</div>
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Half Days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.halfDay}</div>
                  <MinusCircle className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Hours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{stats.totalWorkHours}</div>
                  <TrendingUp className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Attendance History</CardTitle>
                <CardDescription>
                  {selectedMonth.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
                </CardDescription>
              </div>
              <Input
                type="month"
                value={`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}`}
                onChange={(e) => setSelectedMonth(new Date(e.target.value))}
                className="w-48"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : attendances.length === 0 ?  (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found for this month
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Work Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendances.map((attendance) => (
                    <TableRow key={attendance.id}>
                      <TableCell className="font-medium">
                        {new Date(attendance.date).toLocaleDateString("en-IN")}
                      </TableCell>
                      <TableCell>{attendance.checkIn || "-"}</TableCell>
                      <TableCell>{attendance.checkOut || "-"}</TableCell>
                      <TableCell>
                        {attendance.workHours ?  `${attendance.workHours} hrs` : "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(attendance.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {attendance.remarks || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}