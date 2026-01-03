"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, User, Calendar, ClipboardList, DollarSign, CheckSquare, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navigation = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "My Profile", icon: User, href: "/profile" },
  { name: "Attendance", icon: Calendar, href: "/attendance" },
  { name: "Leave Management", icon: ClipboardList, href: "/leave" },
  { name: "Payroll", icon: DollarSign, href: "/payroll" },
  { name: "Tasks & Projects", icon: CheckSquare, href: "/tasks" },
]

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()

  return (
    <aside
      className={cn("relative border-r border-border bg-card transition-all duration-300", collapsed ? "w-16" : "w-64")}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">D</span>
            </div>
            <span className="font-semibold text-lg">Dayflow</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="h-8 w-8">
          <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex flex-col gap-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Button
              key={item.name}
              variant={isActive ? "default" : "ghost"}
              className={cn("justify-start gap-3", collapsed && "justify-center px-2")}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            </Button>
          )
        })}
      </nav>
    </aside>
  )
}
