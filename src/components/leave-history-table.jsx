"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const leaveHistory = [
  {
    id: 1,
    type: "Annual Leave",
    startDate: "Dec 25, 2024",
    endDate: "Dec 27, 2024",
    days: 3,
    status: "approved",
  },
  { id: 2, type: "Sick Leave", startDate: "Dec 8, 2024", endDate: "Dec 9, 2024", days: 2, status: "approved" },
  { id: 3, type: "Personal Leave", startDate: "Nov 15, 2024", endDate: "Nov 15, 2024", days: 1, status: "approved" },
  {
    id: 4,
    type: "Annual Leave",
    startDate: "Jan 5, 2025",
    endDate: "Jan 10, 2025",
    days: 6,
    status: "pending",
  },
  { id: 5, type: "Sick Leave", startDate: "Oct 20, 2024", endDate: "Oct 20, 2024", days: 1, status: "rejected" },
]

export function LeaveHistoryTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Type</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Days</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {leaveHistory.map((leave) => (
          <TableRow key={leave.id}>
            <TableCell className="font-medium">{leave.type}</TableCell>
            <TableCell>{leave.startDate}</TableCell>
            <TableCell>{leave.endDate}</TableCell>
            <TableCell>{leave.days}</TableCell>
            <TableCell>
              <Badge
                variant={
                  leave.status === "approved" ? "default" : leave.status === "pending" ? "secondary" : "destructive"
                }
              >
                {leave.status}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
