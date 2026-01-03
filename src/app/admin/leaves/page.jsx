"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, MessageSquare, Clock } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function HRLeavesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [leaves, setLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [statusFilter, setStatusFilter] = useState("PENDING"); // Changed:  No empty string

  // Approval/Reject Dialog
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [actionType, setActionType] = useState("");
  const [hrComments, setHrComments] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (! loading && (! user || user.role !== "HR")) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === "HR") {
      fetchLeaves();
    }
  }, [user, statusFilter]);

  const fetchLeaves = async () => {
    try {
      setLoadingData(true);
      // Changed: Handle "ALL" as special case instead of empty string
      const url = statusFilter === "ALL" ?  "/api/leave/all" : `/api/leave/all?status=${statusFilter}`;
      const response = await api.get(url);
      setLeaves(response.data.leaves);
      setStats(response.data.stats);
    } catch (error) {
      toast.error("Failed to fetch leaves");
      console.error(error);
    } finally {
      setLoadingData(false);
    }
  };

  const openActionDialog = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setHrComments("");
    setActionDialogOpen(true);
  };

  const handleAction = async () => {
    try {
      setSubmitting(true);
      await api.patch(`/api/leave/${selectedLeave.id}/status`, {
        status: actionType,
        hrComments,
      });
      toast.success(`Leave request ${actionType.toLowerCase()} successfully!`);
      setActionDialogOpen(false);
      fetchLeaves();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update leave status");
    } finally {
      setSubmitting(false);
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

  const getLeaveTypeIcon = (type) => {
    const colors = {
      PAID: "bg-blue-100 text-blue-800",
      SICK: "bg-red-100 text-red-800",
      CASUAL: "bg-green-100 text-green-800",
      UNPAID: "bg-gray-100 text-gray-800",
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colors[type] || ""}`}>
        {type}
      </span>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Leave Management</h1>
        <p className="text-muted-foreground">Review and manage employee leave requests</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter("PENDING")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pending}</div>
              <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter("APPROVED")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.approved}</div>
              <p className="text-xs text-muted-foreground mt-1">Approved leaves</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter("REJECTED")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.rejected}</div>
              <p className="text-xs text-muted-foreground mt-1">Rejected requests</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setStatusFilter("ALL")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground mt-1">All time</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Leave Requests Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Leave Requests</CardTitle>
              <CardDescription>
                {statusFilter === "ALL" 
                  ? "Showing all requests" 
                  :  `Showing ${statusFilter.toLowerCase()} requests`}
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : leaves.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No leave requests found</h3>
              <p className="text-muted-foreground">
                {statusFilter === "ALL"
                  ? "No leave requests available."
                  : `No ${statusFilter.toLowerCase()} leave requests at the moment.`}
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Leave Type</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave.id}>
                      <TableCell className="font-medium">
                        <div>
                          <p className="font-semibold">{leave.user.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {leave.user.employeeId || leave.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{getLeaveTypeIcon(leave.leaveType)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(leave.startDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month:  "short",
                            year: "numeric",
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(leave.endDate).toLocaleDateString("en-IN", {
                            day:  "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{leave.totalDays} {leave.totalDays === 1 ? "day" : "days"}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <div className="truncate text-sm" title={leave.reason}>
                          {leave.reason}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {leave.status === "PENDING" && (
                            <>
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => openActionDialog(leave, "APPROVED")}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => openActionDialog(leave, "REJECTED")}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </>
                          )}
                          {leave.status !== "PENDING" && leave.hrComments && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              title={leave.hrComments}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
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

      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-125">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === "APPROVED" ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Approve Leave Request
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-red-600" />
                  Reject Leave Request
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedLeave && (
                <div className="mt-4 space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Employee:</span>
                    <span className="text-sm">{selectedLeave.user.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Leave Type:</span>
                    {getLeaveTypeIcon(selectedLeave.leaveType)}
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm">
                      {new Date(selectedLeave.startDate).toLocaleDateString("en-IN")} to{" "}
                      {new Date(selectedLeave.endDate).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Days:</span>
                    <Badge variant="outline">{selectedLeave.totalDays} days</Badge>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Employee's Reason</Label>
              <div className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-md border">
                {selectedLeave?.reason}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hrComments" className="text-sm font-medium">
                HR Comments {actionType === "REJECTED" && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                id="hrComments"
                placeholder={
                  actionType === "APPROVED"
                    ? "Add your comments (optional)..."
                    : "Please provide a reason for rejection..."
                }
                value={hrComments}
                onChange={(e) => setHrComments(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setActionDialogOpen(false)}
                variant="outline"
                className="flex-1"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAction}
                disabled={submitting || (actionType === "REJECTED" && !hrComments.trim())}
                className={`flex-1 ${
                  actionType === "APPROVED"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {submitting ? (
                  "Processing..."
                ) : (
                  <>
                    {actionType === "APPROVED" ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Confirm Approval
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Confirm Rejection
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}