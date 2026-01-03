"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserCheck,
  CalendarOff,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    presentToday: 0,
    onLeaveToday: 0,
    pendingTimeOff: 0,
  });
  const [recentLeaveRequests, setRecentLeaveRequests] = useState([]);
  const [absentees, setAbsentees] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get("/api/admin/dashboard");
      if (response.data.success) {
        setStats(response.data.stats);
        setRecentLeaveRequests(response.data.recentLeaveRequests);
        setAbsentees(response.data.absentees);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getLeaveTypeBadge = (type) => {
    const variants = {
      PAID: "default",
      SICK: "destructive",
      CASUAL: "secondary",
      UNPAID: "outline",
    };
    return variants[type] || "default";
  };

  const StatCard = ({ title, value, icon: Icon, description, trend, color }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
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
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your workforce operations
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          description="Active workforce"
          color="bg-blue-500"
        />
        <StatCard
          title="Present Today"
          value={stats.presentToday}
          icon={UserCheck}
          description="Checked in today"
          color="bg-green-500"
        />
        <StatCard
          title="On Leave Today"
          value={stats.onLeaveToday}
          icon={CalendarOff}
          description="Approved leaves"
          color="bg-orange-500"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingTimeOff}
          icon={Clock}
          description="Awaiting approval"
          color="bg-purple-500"
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leave Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Pending Leave Requests</CardTitle>
                <CardDescription>Recent time-off requests awaiting your approval</CardDescription>
              </div>
              <AlertCircle className="h-5 w-5 text-orange-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : recentLeaveRequests.length > 0 ? (
              <div className="space-y-4">
                {recentLeaveRequests.map((leave) => (
                  <div
                    key={leave.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-slate-50/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                        {leave.user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{leave.user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {leave.startDate} to {leave.endDate} ({leave.totalDays} days)
                        </p>
                      </div>
                    </div>
                    <Badge variant={getLeaveTypeBadge(leave.leaveType)}>
                      {leave.leaveType}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mb-2 opacity-20" />
                <p>No pending requests</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Today's Absentees */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Today's Absentees</CardTitle>
                <CardDescription>Employees who haven't checked in today</CardDescription>
              </div>
              <CalendarOff className="h-5 w-5 text-red-500" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : absentees.length > 0 ? (
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Employee</TableHead>
                      <TableHead>Employee ID</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {absentees.slice(0, 5).map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 text-sm font-medium">
                              {employee.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-xs text-muted-foreground">{employee.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {employee.employeeId || "N/A"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <UserCheck className="h-12 w-12 mb-2 opacity-20" />
                <p>All employees present!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}