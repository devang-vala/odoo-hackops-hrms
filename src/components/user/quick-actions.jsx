import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, FileText, DollarSign, UserCheck } from "lucide-react"

const actions = [
  {
    title: "Clock In/Out",
    description: "Mark your attendance",
    icon: Clock,
    color: "bg-chart-1",
  },
  {
    title: "View Payslip",
    description: "Download recent payslips",
    icon: DollarSign,
    color: "bg-chart-3",
  },
  {
    title: "Submit Report",
    description: "Weekly progress report",
    icon: FileText,
    color: "bg-accent",
  },
  {
    title: "Update Profile",
    description: "Manage your information",
    icon: UserCheck,
    color: "bg-chart-4",
  },
]

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4 hover:bg-accent/5 bg-transparent"
            >
              <div className={`rounded-lg ${action.color} p-2`}>
                <action.icon className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <p className="font-medium text-sm">{action.title}</p>
                <p className="text-xs text-muted-foreground">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
