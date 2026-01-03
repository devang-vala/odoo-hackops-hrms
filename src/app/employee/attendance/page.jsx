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
    <div className="space-y-4 md:space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Attendance</h1>
          <p className="text-sm md:text-base text-muted-foreground">Track your daily attendance and work hours</p>
        </div>

        {/* Check In/Out Section */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Today's Attendance</CardTitle>
            <CardDescription className="text-xs md:text-sm">
              {new Date().toLocaleDateString("en-US", { 
                weekday: "long", 
                day: "numeric",
                month: "long", 
                year: "numeric" 
              })}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayAttendance ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:flex md:items-center md:justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <div className="mt-1">{getStatusBadge(todayAttendance.status)}</div>
                  </div>
                  {todayAttendance.checkIn && (
                    <div>
                      <p className="text-sm text-muted-foreground">Check In</p>
                      <p className="font-medium text-sm md:text-base">{todayAttendance.checkIn}</p>
                    </div>
                  )}
                  {todayAttendance.checkOut && (
                    <div>
                      <p className="text-sm text-muted-foreground">Check Out</p>
                      <p className="font-medium text-sm md:text-base">{todayAttendance.checkOut}</p>
                    </div>
                  )}
                  {todayAttendance.workHours && (
                    <div>
                      <p className="text-sm text-muted-foreground">Work Hours</p>
                      <p className="font-medium text-sm md:text-base">{todayAttendance.workHours} hrs</p>
                    </div>
                  )}
                </div>

                {! todayAttendance.checkOut && (
                  <Button 
                    onClick={handleCheckOut} 
                    disabled={checkingOut}
                    className="w-full h-12 text-base font-medium"
                  >
                    <Clock className="mr-2 h-5 w-5" />
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
                  className="w-full h-12 text-base font-medium"
                >
                  <Clock className="mr-2 h-5 w-5" />
                  {checkingIn ? "Checking In..." : "Check In"}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 order-last md:order-0">
            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  Present Days
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="text-xl md:text-2xl font-bold">{stats.present}</div>
                  <CheckCircle className="h-6 w-6 md:h-8 md:w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  Absent Days
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="text-xl md:text-2xl font-bold">{stats.absent}</div>
                  <XCircle className="h-6 w-6 md:h-8 md:w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  Half Days
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="text-xl md:text-2xl font-bold">{stats.halfDay}</div>
                  <MinusCircle className="h-6 w-6 md:h-8 md:w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardHeader className="pb-2 pt-4">
                <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                  Total Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="text-xl md:text-2xl font-bold">{stats.totalWorkHours}</div>
                  <TrendingUp className="h-6 w-6 md:h-8 md:w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Attendance Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3">
              <div>
                <CardTitle className="text-base md:text-xl">Attendance History</CardTitle>
                <CardDescription className="text-xs md:text-sm mt-1">
                  {selectedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </CardDescription>
              </div>
              <Input
                type="month"
                value={`${selectedMonth.getFullYear()}-${String(selectedMonth.getMonth() + 1).padStart(2, "0")}`}
                onChange={(e) => setSelectedMonth(new Date(e.target.value))}
                className="w-full text-sm"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 md:p-6 md:pt-0">{loadingData ? (
              <div className="space-y-2 p-4 md:p-0">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : attendances.length === 0 ?  (
              <div className="text-center py-12 px-4 text-sm text-muted-foreground bg-slate-50">
                No attendance records found for this month
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full inline-block align-middle">
                  <div className="overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-xs md:text-sm min-w-20">Date</TableHead>
                          <TableHead className="text-xs md:text-sm min-w-25">Check In</TableHead>
                          <TableHead className="text-xs md:text-sm min-w-25">Check Out</TableHead>
                          <TableHead className="text-xs md:text-sm min-w-15">Hours</TableHead>
                          <TableHead className="text-xs md:text-sm min-w-20">Status</TableHead>
                          <TableHead className="text-xs md:text-sm hidden lg:table-cell">Remarks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {attendances.map((attendance) => (
                          <TableRow key={attendance.id}>
                            <TableCell className="font-medium text-xs md:text-sm whitespace-nowrap">
                              {new Date(attendance.date).toLocaleDateString("en-IN", { 
                                day: '2-digit', 
                                month: 'short' 
                              })}
                            </TableCell>
                            <TableCell className="text-xs md:text-sm whitespace-nowrap">{attendance.checkIn || "-"}</TableCell>
                            <TableCell className="text-xs md:text-sm whitespace-nowrap">{attendance.checkOut || "-"}</TableCell>
                            <TableCell className="text-xs md:text-sm whitespace-nowrap">
                              {attendance.workHours ?  `${attendance.workHours}h` : "-"}
                            </TableCell>
                            <TableCell className="text-xs whitespace-nowrap">{getStatusBadge(attendance.status)}</TableCell>
                            <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">
                              {attendance.remarks || "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
  );
}