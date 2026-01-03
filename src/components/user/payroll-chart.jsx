"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const payrollData = [
  { month: "Jan", gross: 8500, deductions: 1275, net: 7225 },
  { month: "Feb", gross: 8500, deductions: 1275, net: 7225 },
  { month: "Mar", gross: 8500, deductions: 1275, net: 7225 },
  { month: "Apr", gross: 8500, deductions: 1275, net: 7225 },
  { month: "May", gross: 8500, deductions: 1275, net: 7225 },
  { month: "Jun", gross: 9500, deductions: 1425, net: 8075 },
  { month: "Jul", gross: 8500, deductions: 1275, net: 7225 },
  { month: "Aug", gross: 8500, deductions: 1275, net: 7225 },
  { month: "Sep", gross: 8500, deductions: 1275, net: 7225 },
  { month: "Oct", gross: 8500, deductions: 1275, net: 7225 },
  { month: "Nov", gross: 8500, deductions: 1275, net: 7225 },
  { month: "Dec", gross: 8500, deductions: 1275, net: 7225 },
]

export function PayrollChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Salary Trends</CardTitle>
        <CardDescription>Monthly gross salary, deductions, and net pay (2024)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            gross: {
              label: "Gross Salary",
              color: "hsl(var(--chart-1))",
            },
            deductions: {
              label: "Deductions",
              color: "hsl(var(--chart-5))",
            },
            net: {
              label: "Net Pay",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-87.5"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={payrollData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="gross" fill="var(--color-gross)" name="Gross Salary" radius={[4, 4, 0, 0]} />
              <Bar dataKey="deductions" fill="var(--color-deductions)" name="Deductions" radius={[4, 4, 0, 0]} />
              <Bar dataKey="net" fill="var(--color-net)" name="Net Pay" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
