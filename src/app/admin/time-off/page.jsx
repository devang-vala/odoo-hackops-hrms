"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Calendar,
  Clock,
  Check,
  X,
  Eye,
  Filter,
  CalendarDays,
  CalendarCheck,
  CalendarX,
  AlertCircle,
} from "lucide-react";

export default function TimeOffPage() {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("pending");
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  // Dialog states
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState("");
  const [hrComments, setHrComments] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchLeaves();
  }, []);

  useEffect(() => {
    filterLeaves();
  }, [searchQuery, typeFilter, activeTab, leaves]);

  const fetchLeaves = async () => {
    try {
      const response = await api.get("/api/leave/all");
      if (response.data.success) {
        setLeaves(response.data.leaves);
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch leaves:", error);
      setMessage({ type: "error", text: "Failed to load time-off requests" });
    } finally {
      setLoading(false);
    }
  };

  const filterLeaves = () => {
    let filtered = leaves;

    // Tab filter (status)
    if (activeTab !== "all") {
      filtered = filtered.filter(
        (leave) => leave.status === activeTab.toUpperCase()
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (leave) =>
          leave.user?.name?.toLowerCase().includes(query) ||
          leave.user?.email?.toLowerCase().includes(query) ||
          leave.user?.employeeId?.toLowerCase().includes(query)
      );
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((leave) => leave.leaveType === typeFilter);
    }

    setFilteredLeaves(filtered);
  };

  const handleAction = (leave, action) => {
    setSelectedLeave(leave);
    setActionType(action);
    setHrComments("");
    setActionDialogOpen(true);
  };

  const submitAction = async () => {
    if (!selectedLeave) return;

    setProcessing(true);
    try {
      await api.patch(`/api/leave/${selectedLeave.id}/status`, {
        status: actionType === "approve" ? "APPROVED" : "REJECTED",
        hrComments: hrComments || undefined,
      });

      setMessage({
        type: "success",
        text: `Leave request ${actionType === "approve" ? "approved" : "rejected"} successfully`,
      });

      setActionDialogOpen(false);
      fetchLeaves();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || `Failed to ${actionType} request`,
      });
    } finally {
      setProcessing(false);
    }
  };

  const viewLeave = (leave) => {
    setSelectedLeave(leave);
    setViewDialogOpen(true);
  };

  const getStatusBadge = (status) => {
    const variants = {
      PENDING: { className: "bg-yellow-100 text-yellow-700", label: "Pending" },
      APPROVED: { className: "bg-green-100 text-green-700", label: "Approved" },
      REJECTED: { className: "bg-red-100 text-red-700", label: "Rejected" },
      CANCELLED: { className: "bg-gray-100 text-gray-700", label: "Cancelled" },
    };
    const variant = variants[status] || variants.PENDING;
    return (
      <Badge className={`${variant.className} hover:${variant.className}`}>
        {variant.label}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const variants = {
      PAID: { className: "bg-blue-100 text-blue-700", label: "Paid Leave" },
      SICK: { className: "bg-red-100 text-red-700", label: "Sick Leave" },
      CASUAL: { className: "bg-orange-100 text-orange-700", label: "Casual Leave" },
      UNPAID: { className: "bg-gray-100 text-gray-700", label: "Unpaid Leave" },
    };
    const variant = variants[type] || variants.PAID;
    return (
      <Badge variant="outline" className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Time Off</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Review and manage employee leave requests
        </p>
      </div>

      {/* Alert Message */}
      {message.text && (
        <Alert
          className={
            message.type === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-green-200 bg-green-50 text-green-800"
          }
        >
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card
          className={`cursor-pointer transition-all ${
            activeTab === "all" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setActiveTab("all")}
        >
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-blue-100">
                <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Requests</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${
            activeTab === "pending" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setActiveTab("pending")}
        >
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-yellow-100">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Pending</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${
            activeTab === "approved" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setActiveTab("approved")}
        >
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-green-100">
                <CalendarCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Approved</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${
            activeTab === "rejected" ? "ring-2 ring-primary" : ""
          }`}
          onClick={() => setActiveTab("rejected")}
        >
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 rounded-lg bg-red-100">
                <CalendarX className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Rejected</p>
                <p className="text-xl sm:text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by employee name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="PAID">Paid Leave</SelectItem>
                <SelectItem value="SICK">Sick Leave</SelectItem>
                <SelectItem value="CASUAL">Casual Leave</SelectItem>
                <SelectItem value="UNPAID">Unpaid Leave</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Leaves Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Requests</CardTitle>
          <CardDescription>
            {filteredLeaves.length} request(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Employee</TableHead>
                    <TableHead className="hidden sm:table-cell">Leave Type</TableHead>
                    <TableHead className="hidden md:table-cell">Duration</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center text-muted-foreground">
                          <Calendar className="h-12 w-12 mb-2 opacity-20" />
                          <p>No leave requests found</p>
                          <p className="text-sm">
                            {searchQuery || typeFilter !== "all"
                              ? "Try adjusting your filters"
                              : "No requests in this category"}
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLeaves.map((leave) => (
                      <TableRow
                        key={leave.id}
                        className="hover:bg-slate-50/50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
                                {leave.user?.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate">{leave.user?.name}</p>
                              <p className="text-xs text-muted-foreground truncate">
                                {leave.user?.employeeId || leave.user?.email}
                              </p>
                              <div className="sm:hidden mt-1">{getTypeBadge(leave.leaveType)}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{getTypeBadge(leave.leaveType)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm">
                            <p className="font-medium">{leave.startDate}</p>
                            <p className="text-muted-foreground">
                              to {leave.endDate}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{leave.totalDays}</span>
                          <span className="text-muted-foreground text-sm ml-1">
                            day{leave.totalDays > 1 ? "s" : ""}
                          </span>
                        </TableCell>
                        <TableCell>{getStatusBadge(leave.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => viewLeave(leave)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {leave.status === "PENDING" && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                  onClick={() => handleAction(leave, "approve")}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleAction(leave, "reject")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Leave Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              View complete details of this request
            </DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-6">
              {/* Employee Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary text-white">
                    {selectedLeave.user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold">{selectedLeave.user?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {selectedLeave.user?.email}
                  </p>
                  {selectedLeave.user?.employeeId && (
                    <p className="text-xs text-muted-foreground font-mono">
                      ID: {selectedLeave.user.employeeId}
                    </p>
                  )}
                </div>
              </div>

              {/* Leave Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Leave Type</p>
                  {getTypeBadge(selectedLeave.leaveType)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedLeave.status)}
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Start Date</p>
                  <p className="font-medium">{selectedLeave.startDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">End Date</p>
                  <p className="font-medium">{selectedLeave.endDate}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Days</p>
                  <p className="font-medium">{selectedLeave.totalDays} day(s)</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Requested On</p>
                  <p className="font-medium">
                    {new Date(selectedLeave.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Reason</p>
                <p className="p-3 rounded-lg bg-slate-50 text-sm">
                  {selectedLeave.reason}
                </p>
              </div>

              {/* HR Comments (if any) */}
              {selectedLeave.hrComments && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">HR Comments</p>
                  <p className="p-3 rounded-lg bg-slate-50 text-sm">
                    {selectedLeave.hrComments}
                  </p>
                </div>
              )}

              {/* Approver (if approved) */}
              {selectedLeave.approver && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    {selectedLeave.status === "APPROVED"
                      ? "Approved By"
                      : "Reviewed By"}
                  </p>
                  <p className="font-medium">{selectedLeave.approver.name}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
            {selectedLeave?.status === "PENDING" && (
              <>
                <Button
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleAction(selectedLeave, "reject");
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleAction(selectedLeave, "approve");
                  }}
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve" : "Reject"} Leave Request
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve"
                ? "Are you sure you want to approve this leave request?"
                : "Are you sure you want to reject this leave request?"}
            </DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-slate-50">
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {selectedLeave.user?.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedLeave.user?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedLeave.leaveType} • {selectedLeave.totalDays} day(s)
                    </p>
                  </div>
                </div>
                <p className="text-sm">
                  {selectedLeave.startDate} to {selectedLeave.endDate}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="hrComments">
                  Comments {actionType === "reject" ? "(recommended)" : "(optional)"}
                </Label>
                <Input
                  id="hrComments"
                  placeholder="Add a comment for the employee..."
                  value={hrComments}
                  onChange={(e) => setHrComments(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialogOpen(false)}
              disabled={processing}
            >
              Cancel
            </Button>
            <Button
              onClick={submitAction}
              disabled={processing}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {processing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Processing...
                </span>
              ) : actionType === "approve" ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Approve
                </>
              ) : (
                <>
                  <X className="h-4 w-4 mr-2" />
                  Reject
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
