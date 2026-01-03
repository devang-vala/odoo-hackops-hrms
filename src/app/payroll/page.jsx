"use client"

import { DashboardHeader } from "@/components/user/dashboard-header"
import { DashboardSidebar } from "@/components/user/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Calendar, TrendingUp, CheckCircle, XCircle } from "lucide-react"
import { AttendanceCalendar } from "@/components/user/attendance-calendar"
import { AttendanceTable } from "@/components/user/attendance-table"

export default function AttendancePage() {
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">Attendance Tracking</h1>
            <Badge variant="outline" className="text-lg px-4 py-2">
              <Clock className="w-4 h-4 mr-2" />
              {currentTime}
            </Badge>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Check In/Out</CardTitle>
                <CardDescription>Mark your attendance for today</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Today's Status</p>
                    <p className="text-2xl font-semibold text-primary mt-1">Checked In</p>
                    <p className="text-sm text-muted-foreground mt-1">at 9:15 AM</p>
                  </div>
                  <CheckCircle className="w-12 h-12 text-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button size="lg" disabled>
                    Check In
                  </Button>
                  <Button size="lg" variant="outline">
                    Check Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>This Month Summary</CardTitle>
                <CardDescription>December 2024</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-primary" />
                      <p className="text-sm font-medium">Present Days</p>
                    </div>
                    <p className="text-3xl font-semibold">18</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <XCircle className="w-4 h-4 text-destructive" />
                      <p className="text-sm font-medium">Absent Days</p>
                    </div>
                    <p className="text-3xl font-semibold">2</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-chart-3" />
                      <p className="text-sm font-medium">Leave Days</p>
                    </div>
                    <p className="text-3xl font-semibold">3</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-chart-4" />
                      <p className="text-sm font-medium">Attendance Rate</p>
                    </div>
                    <p className="text-3xl font-semibold">90%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <AttendanceCalendar />

          <AttendanceTable />
        </main>
      </div>
    </div>
  )
}
