"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const daysInMonth = [
  { date: 1, status: "present" },
  { date: 2, status: "present" },
  { date: 3, status: "weekend" },
  { date: 4, status: "weekend" },
  { date: 5, status: "present" },
  { date: 6, status: "present" },
  { date: 7, status: "present" },
  { date: 8, status: "leave" },
  { date: 9, status: "leave" },
  { date: 10, status: "weekend" },
  { date: 11, status: "weekend" },
  { date: 12, status: "present" },
  { date: 13, status: "absent" },
  { date: 14, status: "present" },
  { date: 15, status: "present" },
  { date: 16, status: "present" },
  { date: 17, status: "weekend" },
  { date: 18, status: "weekend" },
  { date: 19, status: "present" },
  { date: 20, status: "present" },
  { date: 21, status: "present" },
  { date: 22, status: "leave" },
  { date: 23, status: "present" },
  { date: 24, status: "weekend" },
  { date: 25, status: "weekend" },
  { date: 26, status: "present" },
  { date: 27, status: "present" },
  { date: 28, status: "present" },
  { date: 29, status: "absent" },
  { date: 30, status: "present" },
  { date: 31, status: "weekend" },
]

const statusColors = {
  present: "bg-primary text-primary-foreground",
  absent: "bg-destructive text-destructive-foreground",
  leave: "bg-chart-4 text-white",
  weekend: "bg-muted text-muted-foreground",
  future: "bg-background text-foreground border border-border",
}

export function AttendanceCalendar() {
  return (
    <Card className="lg:col-span-5">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Attendance Calendar</CardTitle>
            <CardDescription>December 2024</CardDescription>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-muted-foreground">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-chart-4" />
              <span className="text-muted-foreground">Leave</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
          {daysInMonth.map((day) => (
            <div
              key={day.date}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium ${
                statusColors[day.status]
              }`}
            >
              {day.date}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
