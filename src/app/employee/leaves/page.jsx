"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Calendar as CalendarIcon, Briefcase, Heart, DollarSign, XCircle, MessageSquare, Eye, CheckCircle2, AlertCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function EmployeeLeavesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [leaveType, setLeaveType] = useState("PAID");
  const [dateRange, setDateRange] = useState(undefined);
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!loading && !  user) {
      router.push("/auth");
    }
    if (user?.role === "HR") {
      router.push("/admin");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      fetchLeaves();
    }
  }, [user]);

  const fetchLeaves = async () => {
    try {
      setLoadingData(true);
      const response = await api.get("/api/leave/my-leaves");
      setLeaves(response.data.leaves);
      setBalance(response.data.balance);
    } catch (error) {
      toast.error("Failed to fetch leaves");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleApplyLeave = async () => {
    if (!dateRange?.from || !dateRange?.to) {
      toast.error("Please select date range");
      return;
    }

    if (!  reason.trim()) {
      toast.error("Please provide a reason");
      return;
    }

    try {
      setSubmitting(true);
      await api.post("/api/leave/apply", {
        leaveType,
        startDate: dateRange.from.toISOString().split("T")[0],
        endDate: dateRange.to.toISOString().split("T")[0],
        reason,
      });
      toast.success("Leave request submitted successfully!");
      setApplyDialogOpen(false);
      setDateRange(undefined);
      setReason("");
      setLeaveType("PAID");
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply leave");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelLeave = async (leaveId) => {
    if (!confirm("Are you sure you want to cancel this leave request?")) return;

    try {
      await api.patch(`/api/leave/${leaveId}/cancel`);
      toast.success("Leave request cancelled successfully!");
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel leave");
    }
  };

  const openDetailsDialog = (leave) => {
    setSelectedLeave(leave);
    setDetailsDialogOpen(true);
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

  const getLeaveTypeIcon = (type) => {
    const icons = {
      PAID: <Briefcase className="h-4 w-4" />,
      SICK: <Heart className="h-4 w-4" />,
      CASUAL: <CalendarIcon className="h-4 w-4" />,
      UNPAID: <DollarSign className="h-4 w-4" />,
    };
    return icons[type] || null;
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
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Leaves</h1>
            <p className="text-muted-foreground">Manage your leave requests and balance</p>
          </div>
          <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Apply Leave
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Apply for Leave</DialogTitle>
                <DialogDescription>Submit a new leave request</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Leave Type</Label>
                  <Select value={leaveType} onValueChange={setLeaveType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PAID">Paid Leave</SelectItem>
                      <SelectItem value="SICK">Sick Leave</SelectItem>
                      <SelectItem value="CASUAL">Casual Leave</SelectItem>
                      <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Select Date Range</Label>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="rounded-lg border"
                    disabled={(date) => date < new Date()}
                  />
                  {dateRange?.from && dateRange?.to && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {dateRange.from.toLocaleDateString()} - {dateRange.to.toLocaleDateString()}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please provide a reason for your leave..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4}
                  />
                </div>

                <Button onClick={handleApplyLeave} disabled={submitting} className="w-full">
                  {submitting ? "Submitting..." : "Submit Leave Request"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Leave Balance */}
        {balance && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-blue-100 shrink-0">
                    <Briefcase className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-blue-700">Paid Leave</p>
                    <p className="text-2xl font-bold text-blue-800">{balance.paidLeaveBalance} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-100 shrink-0">
                    <Heart className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-green-700">Sick Leave</p>
                    <p className="text-2xl font-bold text-green-800">{balance.sickLeaveBalance} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50/50 sm:col-span-2 lg:col-span-1">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-100 shrink-0">
                    <CalendarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-purple-700">Casual Leave</p>
                    <p className="text-2xl font-bold text-purple-800">{balance.casualLeaveBalance} days</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leave Requests Table */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Requests</CardTitle>
            <CardDescription>View and manage your leave requests</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingData ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : leaves.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <h3 className="text-lg font-medium mb-2">No Leave Requests</h3>
                <p className="text-sm">You haven't applied for any leaves yet</p>
              </div>
            ) : (
              <div className="rounded-lg border overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead>Leave Type</TableHead>
                        <TableHead>Start Date</TableHead>
                        <TableHead>End Date</TableHead>
                        <TableHead className="text-center">Days</TableHead>
                        <TableHead className="hidden md:table-cell">Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaves.map((leave) => (
                        <TableRow key={leave.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getLeaveTypeIcon(leave.leaveType)}
                              <span className="font-medium">{leave.leaveType}</span>
                            </div>
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(leave.startDate).toLocaleDateString("en-IN")}
                          </TableCell>
                          <TableCell className="whitespace-nowrap">
                            {new Date(leave.endDate).toLocaleDateString("en-IN")}
                          </TableCell>
                          <TableCell className="text-center font-semibold">{leave.totalDays}</TableCell>
                          <TableCell className="hidden md:table-cell max-w-xs truncate">{leave.reason}</TableCell>
                          <TableCell>{getStatusBadge(leave.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {/* View Details Button - Shows if there are HR comments */}
                              {(leave.status === "APPROVED" || leave.status === "REJECTED") && leave.hrComments && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openDetailsDialog(leave)}
                                  title="View HR comments"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="ml-1 hidden sm:inline">View</span>
                                </Button>
                              )}
                              
                              {/* Cancel Button */}
                              {(leave.status === "PENDING" || leave.status === "APPROVED") &&
                                new Date(leave.startDate) > new Date() && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCancelLeave(leave.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <XCircle className="h-4 w-4" />
                                    <span className="ml-1 hidden sm:inline">Cancel</span>
                                  </Button>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave Details Dialog */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedLeave?.status === "APPROVED" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {selectedLeave?.status === "REJECTED" && <AlertCircle className="h-5 w-5 text-red-600" />}
                Leave Details
              </DialogTitle>
            </DialogHeader>
            {selectedLeave && (
              <div className="space-y-4">
                {/* Status Banner */}
                <div className={`rounded-lg p-4 ${
                  selectedLeave.status === "APPROVED" 
                    ? "bg-green-50 border border-green-200" 
                    : "bg-red-50 border border-red-200"
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Status</span>
                    {getStatusBadge(selectedLeave.status)}
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-muted-foreground block mb-1">Leave Type</span>
                      <span className="font-medium flex items-center gap-1">
                        {getLeaveTypeIcon(selectedLeave.leaveType)}
                        {selectedLeave.leaveType}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Duration</span>
                      <span className="font-medium">{selectedLeave.totalDays} days</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground block mb-1">Period</span>
                      <span className="font-medium">
                        {new Date(selectedLeave.startDate).toLocaleDateString("en-IN")} - {new Date(selectedLeave.endDate).toLocaleDateString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Your Reason */}
                <div>
                  <Label className="text-sm font-semibold mb-2 block">Your Reason</Label>
                  <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg border">
                    {selectedLeave.reason}
                  </div>
                </div>

                {/* HR Comments */}
                {selectedLeave.hrComments && (
                  <div>
                    <Label className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      HR Comments
                    </Label>
                    <div className={`text-sm p-3 rounded-lg border ${
                      selectedLeave.status === "APPROVED"
                        ? "bg-green-50 border-green-200 text-green-900"
                        : "bg-red-50 border-red-200 text-red-900"
                    }`}>
                      {selectedLeave.hrComments}
                    </div>
                  </div>
                )}

                {/* Reviewed By */}
                {selectedLeave.approver && (
                  <div className="text-xs text-muted-foreground pt-2 border-t flex items-center gap-2">
                    <div className="flex-1">
                      Reviewed by <span className="font-medium">{selectedLeave.approver.name}</span> on{" "}
                      {selectedLeave.approvedAt && new Date(selectedLeave.approvedAt).toLocaleDateString("en-IN")}
                      {selectedLeave.rejectedAt && new Date(selectedLeave.rejectedAt).toLocaleDateString("en-IN")}
                    </div>
                  </div>
                )}

                <Button onClick={() => setDetailsDialogOpen(false)} className="w-full">
                  Close
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
    </div>
  );
}