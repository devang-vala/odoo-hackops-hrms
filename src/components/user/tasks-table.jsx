"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal } from "lucide-react"

const tasks = [
  {
    id: 1,
    title: "Complete API documentation",
    project: "E-Commerce Platform",
    priority: "high",
    status: "in-progress",
    dueDate: "Dec 20, 2024",
  },
  {
    id: 2,
    title: "Review pull requests",
    project: "Mobile App",
    priority: "medium",
    status: "in-progress",
    dueDate: "Dec 21, 2024",
  },
  {
    id: 3,
    title: "Update user dashboard",
    project: "E-Commerce Platform",
    priority: "high",
    status: "in-progress",
    dueDate: "Dec 22, 2024",
  },
  {
    id: 4,
    title: "Fix authentication bugs",
    project: "API Integration",
    priority: "urgent",
    status: "todo",
    dueDate: "Dec 20, 2024",
  },
  {
    id: 5,
    title: "Setup CI/CD pipeline",
    project: "Mobile App",
    priority: "low",
    status: "todo",
    dueDate: "Dec 25, 2024",
  },
  {
    id: 6,
    title: "Implement payment gateway",
    project: "E-Commerce Platform",
    priority: "medium",
    status: "completed",
    dueDate: "Dec 15, 2024",
  },
]

export function TasksTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Task</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Priority</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Due Date</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => (
          <TableRow key={task.id}>
            <TableCell className="font-medium">{task.title}</TableCell>
            <TableCell>{task.project}</TableCell>
            <TableCell>
              <Badge
                variant={
                  task.priority === "urgent"
                    ? "destructive"
                    : task.priority === "high"
                      ? "default"
                      : task.priority === "medium"
                        ? "secondary"
                        : "outline"
                }
              >
                {task.priority}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={
                  task.status === "completed" ? "default" : task.status === "in-progress" ? "secondary" : "outline"
                }
              >
                {task.status}
              </Badge>
            </TableCell>
            <TableCell>{task.dueDate}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
