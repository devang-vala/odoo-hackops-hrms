import { DashboardHeader } from "@/components/user/dashboard-header"
import { DashboardSidebar } from "@/components/user/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Plus } from "lucide-react"
import { LeaveRequestDialog } from "@/components/leave-request-dialog"
import { LeaveHistoryTable } from "@/components/leave-history-table"

export default function LeavePage() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">Leave Management</h1>
            <LeaveRequestDialog>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Request Leave
              </Button>
            </LeaveRequestDialog>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Annual Leave</CardTitle>
                <CardDescription>Remaining balance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-semibold">12</span>
                  <span className="text-muted-foreground">/ 20 days</span>
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-sm text-muted-foreground">8 days used this year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sick Leave</CardTitle>
                <CardDescription>Remaining balance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-semibold">8</span>
                  <span className="text-muted-foreground">/ 10 days</span>
                </div>
                <Progress value={80} className="h-2" />
                <p className="text-sm text-muted-foreground">2 days used this year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Personal Leave</CardTitle>
                <CardDescription>Remaining balance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-semibold">3</span>
                  <span className="text-muted-foreground">/ 5 days</span>
                </div>
                <Progress value={60} className="h-2" />
                <p className="text-sm text-muted-foreground">2 days used this year</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Leave Requests</CardTitle>
              <CardDescription>Your leave application history</CardDescription>
            </CardHeader>
            <CardContent>
              <LeaveHistoryTable />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
