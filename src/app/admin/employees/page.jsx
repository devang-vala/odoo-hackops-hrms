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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MoreHorizontal,
  Search,
  Shield,
  User,
  Eye,
  UserX,
  UserCheck,
  Users,
  Filter,
  Calendar,
  Clock,
  Briefcase,
  Loader2,
} from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    filterEmployees();
  }, [searchQuery, roleFilter, employees]);

  const fetchEmployees = async () => {
    try {
      const response = await api.get("/api/users");
      setEmployees(response.data.users);
      setFilteredEmployees(response.data.users);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      setMessage({ type: "error", text: "Failed to load employees" });
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (emp) =>
          emp.name?.toLowerCase().includes(query) ||
          emp.email?.toLowerCase().includes(query) ||
          emp.employeeId?.toLowerCase().includes(query)
      );
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter((emp) => emp.role === roleFilter);
    }

    setFilteredEmployees(filtered);
  };

  const updateRole = async (userId, newRole) => {
    try {
      await api.patch(`/api/users/${userId}/role`, { role: newRole });
      setMessage({ type: "success", text: `Role updated to ${newRole}` });
      fetchEmployees();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to update role",
      });
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;

    try {
      await api.delete(`/api/users/${userId}`);
      setMessage({ type: "success", text: "Employee deleted successfully" });
      fetchEmployees();
      setTimeout(() => setMessage({ type: "", text: "" }), 3000);
    } catch (error) {
      setMessage({
        type: "error",
        text: error.response?.data?.message || "Failed to delete employee",
      });
    }
  };

  const viewEmployee = async (employee) => {
    setViewDialogOpen(true);
    setProfileLoading(true);
    setSelectedEmployee(employee); // Set basic info first
    
    try {
      const response = await api.get(`/api/users/${employee.id}/profile`);
      if (response.data.success) {
        setSelectedEmployee(response.data.employee);
      }
    } catch (error) {
      console.error("Failed to fetch employee profile:", error);
      // Keep basic employee info if detailed fetch fails
    } finally {
      setProfileLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    return role === "HR" ? (
      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
        <Shield className="w-3 h-3 mr-1" />
        HR
      </Badge>
    ) : (
      <Badge variant="secondary">
        <User className="w-3 h-3 mr-1" />
        Employee
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
        <p className="text-muted-foreground">
          Manage your organization's workforce
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

      {/* Filters Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="EMPLOYEE">Employees</SelectItem>
                <SelectItem value="HR">HR</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-100">
                <User className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Regular Employees</p>
                <p className="text-2xl font-bold">
                  {employees.filter((e) => e.role === "EMPLOYEE").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-100">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">HR Personnel</p>
                <p className="text-2xl font-bold">
                  {employees.filter((e) => e.role === "HR").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employees Table */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Directory</CardTitle>
          <CardDescription>
            {filteredEmployees.length} employee(s) found
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
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead>Employee</TableHead>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center text-muted-foreground">
                          <Users className="h-12 w-12 mb-2 opacity-20" />
                          <p>No employees found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.id} className="hover:bg-slate-50/50">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                                {employee.name?.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {employee.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {employee.employeeId || "—"}
                          </span>
                        </TableCell>
                        <TableCell>{getRoleBadge(employee.role)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {employee.phone || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(employee.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem onClick={() => viewEmployee(employee)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              {employee.role === "EMPLOYEE" ? (
                                <DropdownMenuItem
                                  onClick={() => updateRole(employee.id, "HR")}
                                >
                                  <Shield className="mr-2 h-4 w-4" />
                                  Promote to HR
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => updateRole(employee.id, "EMPLOYEE")}
                                >
                                  <User className="mr-2 h-4 w-4" />
                                  Demote to Employee
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => deleteUser(employee.id)}
                                className="text-red-600 focus:text-red-600"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Delete Employee
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Employee Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Employee Profile</DialogTitle>
            <DialogDescription>View complete employee details</DialogDescription>
          </DialogHeader>
          
          {profileLoading ? (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-32" />
                  </div>
                ))}
              </div>
              <Skeleton className="h-24 w-full" />
            </div>
          ) : selectedEmployee ? (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="leaves">Leaves</TabsTrigger>
              </TabsList>

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6 mt-4">
                {/* Profile Header */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="bg-primary text-white text-xl">
                      {selectedEmployee.name?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{selectedEmployee.name}</h3>
                    <p className="text-muted-foreground">{selectedEmployee.email}</p>
                    <div className="mt-1">{getRoleBadge(selectedEmployee.role)}</div>
                  </div>
                </div>

                {/* Basic Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Employee ID</p>
                    <p className="font-medium font-mono">
                      {selectedEmployee.employeeId || "Not assigned"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="font-medium">
                      {selectedEmployee.phone || "Not provided"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Joined On</p>
                    <p className="font-medium">
                      {new Date(selectedEmployee.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Last Updated</p>
                    <p className="font-medium">
                      {new Date(selectedEmployee.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                {selectedEmployee.stats && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-green-50 border border-green-100">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-600" />
                        <p className="text-sm text-muted-foreground">This Month Attendance</p>
                      </div>
                      <p className="text-xl font-bold text-green-600 mt-1">
                        {selectedEmployee.stats.currentMonthAttendance} days
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-50 border border-purple-100">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-purple-600" />
                        <p className="text-sm text-muted-foreground">Total Leaves Taken</p>
                      </div>
                      <p className="text-xl font-bold text-purple-600 mt-1">
                        {selectedEmployee.stats.totalLeavesTaken}
                      </p>
                    </div>
                  </div>
                )}

                {/* Leave Balances */}
                <div className="space-y-3">
                  <h4 className="font-medium">Leave Balances</h4>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-blue-50 text-center border border-blue-100">
                      <p className="text-2xl font-bold text-blue-600">
                        {selectedEmployee.paidLeaveBalance ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Paid Leave</p>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 text-center border border-red-100">
                      <p className="text-2xl font-bold text-red-600">
                        {selectedEmployee.sickLeaveBalance ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Sick Leave</p>
                    </div>
                    <div className="p-3 rounded-lg bg-orange-50 text-center border border-orange-100">
                      <p className="text-2xl font-bold text-orange-600">
                        {selectedEmployee.casualLeaveBalance ?? 0}
                      </p>
                      <p className="text-xs text-muted-foreground">Casual Leave</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Attendance Tab */}
              <TabsContent value="attendance" className="mt-4">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Recent Attendance
                  </h4>
                  {selectedEmployee.attendances && selectedEmployee.attendances.length > 0 ? (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead>Date</TableHead>
                            <TableHead>Check In</TableHead>
                            <TableHead>Check Out</TableHead>
                            <TableHead>Hours</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedEmployee.attendances.map((att) => (
                            <TableRow key={att.id}>
                              <TableCell className="font-medium">
                                {new Date(att.date).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {att.checkIn
                                  ? new Date(att.checkIn).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                {att.checkOut
                                  ? new Date(att.checkOut).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : "—"}
                              </TableCell>
                              <TableCell>
                                {att.workHours ? `${att.workHours.toFixed(1)}h` : "—"}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={att.status === "PRESENT" ? "default" : "secondary"}
                                  className={
                                    att.status === "PRESENT"
                                      ? "bg-green-100 text-green-700"
                                      : att.status === "ABSENT"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }
                                >
                                  {att.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      <Clock className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>No attendance records found</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Leaves Tab */}
              <TabsContent value="leaves" className="mt-4">
                <div className="space-y-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Leave Requests
                  </h4>
                  {selectedEmployee.leaves && selectedEmployee.leaves.length > 0 ? (
                    <div className="rounded-lg border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50">
                            <TableHead>Type</TableHead>
                            <TableHead>From</TableHead>
                            <TableHead>To</TableHead>
                            <TableHead>Days</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedEmployee.leaves.map((leave) => (
                            <TableRow key={leave.id}>
                              <TableCell className="font-medium">
                                {leave.leaveType}
                              </TableCell>
                              <TableCell>
                                {new Date(leave.startDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {new Date(leave.endDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell>{leave.totalDays}</TableCell>
                              <TableCell>
                                <Badge
                                  className={
                                    leave.status === "APPROVED"
                                      ? "bg-green-100 text-green-700"
                                      : leave.status === "REJECTED"
                                      ? "bg-red-100 text-red-700"
                                      : leave.status === "PENDING"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-gray-100 text-gray-700"
                                  }
                                >
                                  {leave.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground border rounded-lg">
                      <Calendar className="h-10 w-10 mx-auto mb-2 opacity-20" />
                      <p>No leave requests found</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          ) : null}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
