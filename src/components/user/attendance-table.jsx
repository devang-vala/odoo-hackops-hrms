"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const attendanceRecords = [
  { date: "Dec 20, 2024", checkIn: "9:15 AM", checkOut: "6:30 PM", hours: "9h 15m", status: "present" },
  { date: "Dec 19, 2024", checkIn: "9:00 AM", checkOut: "6:00 PM", hours: "9h 0m", status: "present" },
  { date: "Dec 18, 2024", checkIn: "9:10 AM", checkOut: "6:15 PM", hours: "9h 5m", status: "present" },
  { date: "Dec 17, 2024", checkIn: "-", checkOut: "-", hours: "-", status: "weekend" },
  { date: "Dec 16, 2024", checkIn: "8:55 AM", checkOut: "6:20 PM", hours: "9h 25m", status: "present" },
  { date: "Dec 15, 2024", checkIn: "-", checkOut: "-", hours: "-", status: "absent" },
  { date: "Dec 14, 2024", checkIn: "9:05 AM", checkOut: "6:10 PM", hours: "9h 5m", status: "present" },
]

export function AttendanceTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Attendance</CardTitle>
        <CardDescription>Last 7 days attendance records</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Hours Worked</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendanceRecords.map((record) => (
              <TableRow key={record.date}>
                <TableCell className="font-medium">{record.date}</TableCell>
                <TableCell>{record.checkIn}</TableCell>
                <TableCell>{record.checkOut}</TableCell>
                <TableCell>{record.hours}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      record.status === "present" ? "default" : record.status === "absent" ? "destructive" : "secondary"
                    }
                  >
                    {record.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
