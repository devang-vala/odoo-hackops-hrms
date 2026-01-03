"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

const payslips = [
  { month: "December 2024", gross: "$8,500", deductions: "$1,275", net: "$7,225" },
  { month: "November 2024", gross: "$8,500", deductions: "$1,275", net: "$7,225" },
  { month: "October 2024", gross: "$8,500", deductions: "$1,275", net: "$7,225" },
  { month: "September 2024", gross: "$8,500", deductions: "$1,275", net: "$7,225" },
  { month: "August 2024", gross: "$8,500", deductions: "$1,275", net: "$7,225" },
  { month: "July 2024", gross: "$8,500", deductions: "$1,275", net: "$7,225" },
]

export function PayslipTable() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead>Gross Salary</TableHead>
          <TableHead>Deductions</TableHead>
          <TableHead>Net Pay</TableHead>
          <TableHead>Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payslips.map((payslip) => (
          <TableRow key={payslip.month}>
            <TableCell className="font-medium">{payslip.month}</TableCell>
            <TableCell>{payslip.gross}</TableCell>
            <TableCell>{payslip.deductions}</TableCell>
            <TableCell className="font-semibold">{payslip.net}</TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
