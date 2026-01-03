import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const events = [
  {
    title: "Team Standup",
    time: "09:00 AM",
    date: "Today",
    type: "meeting",
  },
  {
    title: "Performance Review",
    time: "02:00 PM",
    date: "Tomorrow",
    type: "review",
  },
  {
    title: "Project Deadline",
    time: "All Day",
    date: "Jan 15",
    type: "deadline",
  },
  {
    title: "Company Event",
    time: "06:00 PM",
    date: "Jan 20",
    type: "event",
  },
]

const typeColors = {
  meeting: "bg-chart-1/10 text-chart-1 border-chart-1/20",
  review: "bg-accent/10 text-accent border-accent/20",
  deadline: "bg-chart-5/10 text-chart-5 border-chart-5/20",
  event: "bg-chart-3/10 text-chart-3 border-chart-3/20",
}

export function UpcomingEvents() {
  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Upcoming Events</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="rounded-lg bg-card p-2 border border-border">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1 space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm leading-none truncate">{event.title}</p>
                  <Badge variant="outline" className={`text-xs ${typeColors[event.type]}`}>
                    {event.type}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {event.time}
                  </span>
                  <span>{event.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
