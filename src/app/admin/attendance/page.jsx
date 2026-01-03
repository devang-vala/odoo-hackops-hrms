"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Search, Filter, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function HRAttendancePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // Filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Manual entry state
  const [manualDialogOpen, setManualDialogOpen] = useState(false);
  const [manualUserId, setManualUserId] = useState("");
  const [manualDate, setManualDate] = useState("");
  const [manualStatus, setManualStatus] = useState("PRESENT");
  const [manualRemarks, setManualRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== "HR")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "HR") {
      fetchEmployees();
      fetchAttendances();
    }
  }, [user]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/api/users?role=EMPLOYEE");
      setEmployees(response.data.users);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast.error("Failed to fetch employees");
    }
  };

  const fetchAttendances = async () => {
    try {
      setLoadingData(true);
      let url = "/api/attendance/all? ";
      
      // Build query params
      const params = new URLSearchParams();
      if (selectedEmployee && selectedEmployee !== "ALL") {
        params.append("userId", selectedEmployee);
      }
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (statusFilter && statusFilter !== "ALL") {
        params.append("status", statusFilter);
      }

      const response = await api.get(`${url}${params.toString()}`);
      setAttendances(response.data.attendances);
    } catch (error) {
      toast.error("Failed to fetch attendance");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleManualEntry = async () => {
    if (!manualUserId || !manualDate || !  manualStatus) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/api/attendance/manual", {
        userId: manualUserId,
        date:  manualDate,
        status:  manualStatus,
        remarks:  manualRemarks,
      });
      toast.success("Manual attendance created successfully!");
      setManualDialogOpen(false);
      setManualUserId("");
      setManualDate("");
      setManualStatus("PRESENT");
      setManualRemarks("");
      fetchAttendances();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create attendance");
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSelectedEmployee("ALL");
    setStartDate("");
    setEndDate("");
    setStatusFilter("ALL");
  };

  const getStatusBadge = (status) => {
    const variants = {
      PRESENT: "default",
      ABSENT: "destructive",
      HALF_DAY: "secondary",
      LEAVE: "outline",
      WEEKEND: "secondary",
      HOLIDAY: "outline",
    };

    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>;
  };

  if (loading || ! user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attendance Management</h1>
          <p className="text-muted-foreground">View and manage employee attendance</p>
        </div>
        <Dialog open={manualDialogOpen} onOpenChange={setManualDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Manual Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Manual Attendance Entry</DialogTitle>
              <DialogDescription>Create attendance record manually</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Employee *</Label>
                <Select value={manualUserId} onValueChange={setManualUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((emp) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} {emp.employeeId && `(${emp.employeeId})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Date *</Label>
                <Input type="date" value={manualDate} onChange={(e) => setManualDate(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Status *</Label>
                <Select value={manualStatus} onValueChange={setManualStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRESENT">Present</SelectItem>
                    <SelectItem value="ABSENT">Absent</SelectItem>
                    <SelectItem value="HALF_DAY">Half Day</SelectItem>
                    <SelectItem value="LEAVE">Leave</SelectItem>
                    <SelectItem value="WEEKEND">Weekend</SelectItem>
                    <SelectItem value="HOLIDAY">Holiday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Remarks (Optional)</Label>
                <Input
                  placeholder="e.g., Late arrival, Medical emergency"
                  value={manualRemarks}
                  onChange={(e) => setManualRemarks(e.target.value)}
                />
              </div>

              <Button onClick={handleManualEntry} disabled={submitting} className="w-full">
                {submitting ? "Creating..." : "Create Attendance"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                <SelectTrigger>
                  <SelectValue placeholder="All employees" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All employees</SelectItem>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="PRESENT">Present</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="HALF_DAY">Half Day</SelectItem>
                  <SelectItem value="LEAVE">Leave</SelectItem>
                  <SelectItem value="WEEKEND">Weekend</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={fetchAttendances} className="mt-4">
            <Search className="mr-2 h-4 w-4" />
            Apply Filters
          </Button>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Attendance Records ({attendances.length})</CardTitle>
          <CardDescription>
            {selectedEmployee !== "ALL" && employees.find(e => e.id === selectedEmployee) && (
              <span>Showing records for {employees.find(e => e.id === selectedEmployee).name}</span>
            )}
            {startDate && endDate && (
              <span className="ml-2">from {startDate} to {endDate}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : attendances.length === 0 ?   (
            <div className="text-center py-8 text-muted-foreground">
              No attendance records found. Try adjusting your filters.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
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
                      <TableCell className="font-medium">{attendance.user.name}</TableCell>
                      <TableCell>{attendance.user.employeeId || "-"}</TableCell>
                      <TableCell>{new Date(attendance.date).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell className="text-sm">{attendance.checkIn || "-"}</TableCell>
                      <TableCell className="text-sm">{attendance.checkOut || "-"}</TableCell>
                      <TableCell>{attendance.workHours ? `${attendance.workHours} hrs` : "-"}</TableCell>
                      <TableCell>{getStatusBadge(attendance.status)}</TableCell>
                      <TableCell className="max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground truncate">
                            {attendance.remarks || "-"}
                          </span>
                          {attendance.isManual && (
                            <Badge variant="outline" className="text-xs">Manual</Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
