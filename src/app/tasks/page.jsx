import { DashboardHeader } from "@/components/user/dashboard-header"
import { DashboardSidebar } from "@/components/user/dashboard-sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Plus, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { TasksTable } from "@/components/user/tasks-table"

export default function TasksPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-semibold tracking-tight text-balance">Tasks & Projects</h1>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">24</div>
                <p className="text-xs text-muted-foreground mt-1">assigned to you</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Clock className="w-4 h-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">8</div>
                <p className="text-xs text-muted-foreground mt-1">actively working</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">12</div>
                <p className="text-xs text-muted-foreground mt-1">this month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Overdue</CardTitle>
                <AlertCircle className="w-4 h-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold">4</div>
                <p className="text-xs text-muted-foreground mt-1">need attention</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
                <CardDescription>Current project status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">E-Commerce Platform Redesign</h4>
                        <p className="text-sm text-muted-foreground">Frontend Development</p>
                      </div>
                      <Badge>In Progress</Badge>
                    </div>
                    <Progress value={65} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">65% complete</span>
                      <span className="text-muted-foreground">Due: Dec 31, 2024</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">Mobile App Development</h4>
                        <p className="text-sm text-muted-foreground">React Native</p>
                      </div>
                      <Badge variant="secondary">Planning</Badge>
                    </div>
                    <Progress value={25} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">25% complete</span>
                      <span className="text-muted-foreground">Due: Jan 15, 2025</span>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">API Integration Project</h4>
                        <p className="text-sm text-muted-foreground">Backend Services</p>
                      </div>
                      <Badge className="bg-primary">Active</Badge>
                    </div>
                    <Progress value={80} className="h-2" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">80% complete</span>
                      <span className="text-muted-foreground">Due: Dec 20, 2024</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Next 7 days</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-destructive mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">API Documentation</p>
                      <p className="text-xs text-muted-foreground">Due today</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-chart-4 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Code Review Session</p>
                      <p className="text-xs text-muted-foreground">Due in 2 days</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Sprint Planning</p>
                      <p className="text-xs text-muted-foreground">Due in 4 days</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 rounded-full bg-chart-3 mt-2" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Testing Phase</p>
                      <p className="text-xs text-muted-foreground">Due in 6 days</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All Tasks</CardTitle>
              <CardDescription>Complete list of assigned tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <TasksTable />
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
