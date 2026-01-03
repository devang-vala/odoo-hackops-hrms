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
import { Plus, Calendar as CalendarIcon, Briefcase, Heart, DollarSign, XCircle, MessageSquare, Eye } from "lucide-react";
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">My Leaves</h1>
            <p className="text-muted-foreground">Manage your leave requests and balance</p>
          </div>
          <Dialog open={applyDialogOpen} onOpenChange={setApplyDialogOpen}>
            <DialogTrigger asChild>
              <Button>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Paid Leave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{balance.paidLeaveBalance} days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Sick Leave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{balance.sickLeaveBalance} days</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  Casual Leave
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{balance.casualLeaveBalance} days</div>
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
            {loadingData ?   (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : leaves.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No leave requests found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getLeaveTypeIcon(leave.leaveType)}
                          {leave.leaveType}
                        </div>
                      </TableCell>
                      <TableCell>{new Date(leave.startDate).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>{new Date(leave.endDate).toLocaleDateString("en-IN")}</TableCell>
                      <TableCell>{leave.totalDays}</TableCell>
                      <TableCell className="max-w-xs truncate">{leave.reason}</TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* View Details Button - Shows if there are HR comments */}
                          {(leave.status === "APPROVED" || leave.status === "REJECTED") && leave.hrComments && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDetailsDialog(leave)}
                              title="View HR comments"
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          )}
                          
                          {/* Cancel Button */}
                          {(leave.status === "PENDING" || leave.status === "APPROVED") &&
                            new Date(leave.startDate) > new Date() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelLeave(leave.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                            )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Leave Details Dialog - Minimalist */}
        <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
          <DialogContent className="sm:max-w-106.25">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Leave Details
              </DialogTitle>
            </DialogHeader>
            {selectedLeave && (
              <div className="space-y-4">
                {/* Leave Info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Status</span>
                    {getStatusBadge(selectedLeave.status)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Leave Type</span>
                    <span className="text-sm font-medium">{selectedLeave.leaveType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration</span>
                    <span className="text-sm font-medium">
                      {new Date(selectedLeave.startDate).toLocaleDateString("en-IN")} - {new Date(selectedLeave.endDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Days</span>
                    <span className="text-sm font-medium">{selectedLeave.totalDays} days</span>
                  </div>
                </div>

                {/* Your Reason */}
                <div>
                  <Label className="text-sm font-semibold">Your Reason</Label>
                  <p className="text-sm text-muted-foreground mt-1 p-3 bg-gray-50 rounded-md border">
                    {selectedLeave.reason}
                  </p>
                </div>

                {/* HR Comments */}
                {selectedLeave.hrComments && (
                  <div>
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      HR Comments
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1 p-3 bg-blue-50 rounded-md border border-blue-200">
                      {selectedLeave.hrComments}
                    </p>
                  </div>
                )}

                {/* Reviewed By */}
                {selectedLeave.approver && (
                  <div className="text-xs text-muted-foreground">
                    Reviewed by {selectedLeave.approver.name} on{" "}
                    {selectedLeave.approvedAt && new Date(selectedLeave.approvedAt).toLocaleDateString("en-IN")}
                    {selectedLeave.rejectedAt && new Date(selectedLeave.rejectedAt).toLocaleDateString("en-IN")}
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