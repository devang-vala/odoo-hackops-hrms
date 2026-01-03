import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, Briefcase, TrendingUp } from "lucide-react"

const stats = [
  {
    title: "Total Hours",
    value: "168.5",
    subtitle: "This month",
    icon: Clock,
    trend: "+2.5%",
    trendUp: true,
  },
  {
    title: "Days Present",
    value: "22",
    subtitle: "Out of 23 days",
    icon: Calendar,
    trend: "95.6%",
    trendUp: true,
  },
  {
    title: "Leave Balance",
    value: "12",
    subtitle: "Days remaining",
    icon: Briefcase,
    trend: "-3 days",
    trendUp: false,
  },
  {
    title: "Performance",
    value: "4.8",
    subtitle: "Rating this quarter",
    icon: TrendingUp,
    trend: "+0.3",
    trendUp: true,
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className="mt-2 flex items-baseline gap-2">
                  <h3 className="text-3xl font-semibold tracking-tight">{stat.value}</h3>
                  <span className={`text-xs font-medium ${stat.trendUp ? "text-chart-3" : "text-muted-foreground"}`}>
                    {stat.trend}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </div>
              <div className="rounded-full bg-primary/10 p-3">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
