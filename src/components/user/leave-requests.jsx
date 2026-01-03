import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Plus } from "lucide-react"

const leaveRequests = [
  {
    type: "Vacation",
    dates: "Jan 25 - Jan 29",
    days: 5,
    status: "approved",
  },
  {
    type: "Sick Leave",
    dates: "Jan 10",
    days: 1,
    status: "approved",
  },
  {
    type: "Personal",
    dates: "Feb 5 - Feb 6",
    days: 2,
    status: "pending",
  },
]

const statusColors = {
  approved: "bg-chart-3/10 text-chart-3 border-chart-3/20",
  pending: "bg-chart-4/10 text-chart-4 border-chart-4/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
}

export function LeaveRequests() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle>Leave Requests</CardTitle>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          Request Leave
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaveRequests.map((leave, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{leave.type}</p>
                  <p className="text-xs text-muted-foreground">{leave.dates}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{leave.days}d</span>
                <Badge variant="outline" className={statusColors[leave.status]}>
                  {leave.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
