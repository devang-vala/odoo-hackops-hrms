"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  LogOut,
  Calendar,
  Clock,
  ChevronLeft,
  ChevronRight,
  User,
  DollarSign,
  CalendarDays,
} from "lucide-react";
import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/employee",
    icon: LayoutDashboard,
  },
  {
    title: "My Attendance",
    href: "/employee/attendance",
    icon: Clock,
  },
  {
    title: "My Leaves",
    href: "/employee/leaves",
    icon:  CalendarDays,
  },
  {
    title: "Payroll",
    href:  "/employee/payroll",
    icon: DollarSign,
  },
  {
    title: "My Profile",
    href: "/employee/profile",
    icon: User,
  },
];

export default function EmployeeLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    if (! loading && !user) {
      router.push("/auth");
    }
    if (user?. role === "HR") {
      router.push("/admin");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role === "HR") {
    return null;
  }

  return (
    <TooltipProvider delayDuration={0}>
      <div className="min-h-screen bg-slate-50">
        <div className="flex">
          {/* Sidebar */}
          <aside
            className={cn(
              "fixed left-0 top-0 z-40 h-screen bg-white border-r shadow-sm transition-all duration-300",
              collapsed ? "w-17.5" : "w-65"
            )}
          >
            <div className="flex flex-col h-full">
              {/* Logo Header */}
              <div
                className={cn(
                  "flex items-center h-16 px-4 border-b",
                  collapsed ? "justify-center" : "justify-between"
                )}
              >
                {!collapsed && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-bold text-lg leading-none">HRMS</h2>
                      <p className="text-xs text-muted-foreground">Employee Portal</p>
                    </div>
                  </div>
                )}
                {collapsed && (
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white">
                    <User className="h-5 w-5" />
                  </div>
                )}
              </div>

              {/* Navigation */}
              <ScrollArea className="flex-1 py-4">
                <nav className="px-3 space-y-1">
                  {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item. icon;

                    if (collapsed) {
                      return (
                        <Tooltip key={item.href}>
                          <TooltipTrigger asChild>
                            <Link href={item.href}>
                              <Button
                                variant={isActive ? "default" : "ghost"}
                                className={cn(
                                  "w-full justify-center h-11",
                                  isActive && "bg-primary text-white shadow-md"
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </Button>
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent side="right">{item.title}</TooltipContent>
                        </Tooltip>
                      );
                    }

                    return (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActive ? "default" :  "ghost"}
                          className={cn(
                            "w-full justify-start h-11 gap-3",
                            isActive && "bg-primary text-white shadow-md"
                          )}
                        >
                          <Icon className="h-5 w-5" />
                          {item.title}
                        </Button>
                      </Link>
                    );
                  })}
                </nav>
              </ScrollArea>

              {/* User Profile & Logout */}
              <div className="border-t p-3">
                {! collapsed && (
                  <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-slate-50 mb-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-white text-sm">
                        {user.name?.charAt(0).toUpperCase() || "E"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                )}

                {collapsed ?  (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="w-full justify-center h-11 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={logout}
                      >
                        <LogOut className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">Logout</TooltipContent>
                  </Tooltip>
                ) : (
                  <Button
                    variant="ghost"
                    className="w-full justify-start h-11 gap-3 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </Button>
                )}
              </div>

              {/* Collapse Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-20 h-6 w-6 rounded-full border bg-white shadow-md hover:bg-slate-50"
                onClick={() => setCollapsed(!collapsed)}
              >
                {collapsed ? (
                  <ChevronRight className="h-3 w-3" />
                ) : (
                  <ChevronLeft className="h-3 w-3" />
                )}
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <main
            className={cn(
              "flex-1 min-h-screen transition-all duration-300",
              collapsed ? "ml-17.5" : "ml-65"
            )}
          >
            <div className="p-8">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}