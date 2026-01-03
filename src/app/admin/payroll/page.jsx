"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  Users,
  Settings,
  Calculator,
  Search,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  Calendar,
  Loader2,
  Save,
  Eye,
} from "lucide-react";

export default function AdminPayrollPage() {
  const [employees, setEmployees] = useState([]);
  const [componentTypes, setComponentTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Selected employee state
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [salaryInfo, setSalaryInfo] = useState(null);
  const [employeeComponents, setEmployeeComponents] = useState([]);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Payroll view state
  const [payrollDialogOpen, setPayrollDialogOpen] = useState(false);
  const [payrollData, setPayrollData] = useState(null);
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());
  const [loadingPayroll, setLoadingPayroll] = useState(false);

  // Form state for salary info
  const [formData, setFormData] = useState({
    monthlyWage: "",
    workingDaysPerWeek: 5,
    breakTimeHours: 1,
  });

  // Form state for components
  const [componentFormData, setComponentFormData] = useState({});

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [employeesRes, typesRes] = await Promise.all([
        api.get("/api/users"),
        api.get("/api/payroll/component-types"),
      ]);

      if (employeesRes.data.success) {
        setEmployees(employeesRes.data.users.filter(u => u.role === "EMPLOYEE"));
      }
      if (typesRes.data.success) {
        setComponentTypes(typesRes.data.componentTypes);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const openConfigDialog = async (employee) => {
    setSelectedEmployee(employee);
    setConfigDialogOpen(true);
    
    try {
      const [infoRes, componentsRes] = await Promise.all([
        api.get(`/api/payroll/salary-info?userId=${employee.id}`),
        api.get(`/api/payroll/employee-components?userId=${employee.id}`),
      ]);

      if (infoRes.data.success && infoRes.data.salaryInfo) {
        setSalaryInfo(infoRes.data.salaryInfo);
        setFormData({
          monthlyWage: infoRes.data.salaryInfo.monthlyWage || "",
          workingDaysPerWeek: infoRes.data.salaryInfo.workingDaysPerWeek || 5,
          breakTimeHours: infoRes.data.salaryInfo.breakTimeHours || 1,
        });
      } else {
        setSalaryInfo(null);
        setFormData({ monthlyWage: "", workingDaysPerWeek: 5, breakTimeHours: 1 });
      }

      if (componentsRes.data.success) {
        setEmployeeComponents(componentsRes.data.employeeComponents);
        
        // Initialize component form data
        const compData = {};
        for (const type of componentTypes) {
          const existing = componentsRes.data.employeeComponents.find(
            c => c.salaryComponentTypeId === type.id
          );
          if (existing) {
            compData[type.id] = {
              computationType: existing.computationType,
              percentageValue: existing.percentageValue || "",
              fixedAmount: existing.fixedAmount || "",
              percentageBase: existing.percentageBase || "WAGE",
            };
          } else {
            compData[type.id] = {
              computationType: "PERCENTAGE",
              percentageValue: "",
              fixedAmount: "",
              percentageBase: "WAGE",
            };
          }
        }
        setComponentFormData(compData);
      }
    } catch (error) {
      console.error("Error fetching employee config:", error);
    }
  };

  const saveSalaryInfo = async () => {
    if (!selectedEmployee || !formData.monthlyWage) return;
    
    setSaving(true);
    try {
      await api.post("/api/payroll/salary-info", {
        userId: selectedEmployee.id,
        monthlyWage: parseFloat(formData.monthlyWage),
        workingDaysPerWeek: parseInt(formData.workingDaysPerWeek),
        breakTimeHours: parseFloat(formData.breakTimeHours),
      });
      
      // Re-fetch salary info
      const infoRes = await api.get(`/api/payroll/salary-info?userId=${selectedEmployee.id}`);
      if (infoRes.data.success) {
        setSalaryInfo(infoRes.data.salaryInfo);
      }
    } catch (error) {
      console.error("Error saving salary info:", error);
    } finally {
      setSaving(false);
    }
  };

  const saveComponents = async () => {
    if (!selectedEmployee) return;
    
    setSaving(true);
    try {
      const components = Object.entries(componentFormData)
        .filter(([_, data]) => data.percentageValue || data.fixedAmount)
        .map(([typeId, data]) => ({
          salaryComponentTypeId: typeId,
          computationType: data.computationType,
          percentageValue: data.computationType === "PERCENTAGE" ? parseFloat(data.percentageValue) : null,
          fixedAmount: data.computationType === "FIXED" ? parseFloat(data.fixedAmount) : null,
          percentageBase: data.computationType === "PERCENTAGE" ? data.percentageBase : null,
        }));

      await api.post("/api/payroll/employee-components", {
        userId: selectedEmployee.id,
        components,
      });

      // Re-fetch components
      const componentsRes = await api.get(`/api/payroll/employee-components?userId=${selectedEmployee.id}`);
      if (componentsRes.data.success) {
        setEmployeeComponents(componentsRes.data.employeeComponents);
      }
    } catch (error) {
      console.error("Error saving components:", error);
    } finally {
      setSaving(false);
    }
  };

  const viewPayroll = async (employee) => {
    setSelectedEmployee(employee);
    setPayrollDialogOpen(true);
    setLoadingPayroll(true);
    
    try {
      const res = await api.get(
        `/api/payroll/calculate?userId=${employee.id}&month=${payrollMonth}&year=${payrollYear}`
      );
      if (res.data.success) {
        setPayrollData(res.data.payroll);
      } else {
        setPayrollData(null);
      }
    } catch (error) {
      console.error("Error fetching payroll:", error);
      setPayrollData(null);
    } finally {
      setLoadingPayroll(false);
    }
  };

  const refreshPayroll = async () => {
    if (!selectedEmployee) return;
    setLoadingPayroll(true);
    
    try {
      const res = await api.get(
        `/api/payroll/calculate?userId=${selectedEmployee.id}&month=${payrollMonth}&year=${payrollYear}`
      );
      if (res.data.success) {
        setPayrollData(res.data.payroll);
      }
    } catch (error) {
      console.error("Error fetching payroll:", error);
    } finally {
      setLoadingPayroll(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getMonthName = (month) => {
    return new Date(2000, month - 1).toLocaleString("default", { month: "long" });
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.employeeId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payroll Management</h1>
        <p className="text-muted-foreground">
          Configure salary structure and view payroll for employees
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Employees</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-100">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salary Components</p>
                <p className="text-2xl font-bold">{componentTypes.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-purple-100">
                <Calendar className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Period</p>
                <p className="text-2xl font-bold">{getMonthName(new Date().getMonth() + 1)} {new Date().getFullYear()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employee Salary Configuration</CardTitle>
              <CardDescription>Click on an employee to configure their salary structure</CardDescription>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead>Employee</TableHead>
                  <TableHead>Employee ID</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.map((employee) => (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium">{employee.name}</TableCell>
                    <TableCell>{employee.employeeId || "-"}</TableCell>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openConfigDialog(employee)}
                        >
                          <Settings className="h-4 w-4 mr-1" />
                          Configure
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => viewPayroll(employee)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Payroll
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No employees found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Salary Configuration - {selectedEmployee?.name}</DialogTitle>
            <DialogDescription>
              Configure salary info and component calculations for this employee
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="salary-info" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="salary-info">Salary Info</TabsTrigger>
              <TabsTrigger value="components">Salary Components</TabsTrigger>
            </TabsList>

            <TabsContent value="salary-info" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthlyWage">Monthly Wage (₹)</Label>
                  <Input
                    id="monthlyWage"
                    type="number"
                    placeholder="e.g., 50000"
                    value={formData.monthlyWage}
                    onChange={(e) => setFormData({ ...formData, monthlyWage: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workingDays">Working Days/Week</Label>
                  <Select
                    value={formData.workingDaysPerWeek.toString()}
                    onValueChange={(v) => setFormData({ ...formData, workingDaysPerWeek: parseInt(v) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 Days (Mon-Fri)</SelectItem>
                      <SelectItem value="6">6 Days (Mon-Sat)</SelectItem>
                      <SelectItem value="7">7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="breakTime">Break Time (Hours)</Label>
                  <Input
                    id="breakTime"
                    type="number"
                    step="0.5"
                    value={formData.breakTimeHours}
                    onChange={(e) => setFormData({ ...formData, breakTimeHours: e.target.value })}
                  />
                </div>
              </div>

              {formData.monthlyWage && (
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Yearly Wage (Auto-calculated)</p>
                  <p className="text-2xl font-bold">{formatCurrency(parseFloat(formData.monthlyWage) * 12)}</p>
                </div>
              )}

              <Button onClick={saveSalaryInfo} disabled={saving || !formData.monthlyWage}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Salary Info
              </Button>
            </TabsContent>

            <TabsContent value="components" className="space-y-4 mt-4">
              {!salaryInfo ? (
                <div className="text-center py-8 text-muted-foreground">
                  Please configure Salary Info first
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {/* Earnings */}
                    <div>
                      <h3 className="font-semibold text-green-700 mb-3 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Earnings
                      </h3>
                      <div className="space-y-3">
                        {componentTypes
                          .filter((t) => t.category === "EARNING")
                          .map((type) => (
                            <ComponentRow
                              key={type.id}
                              type={type}
                              data={componentFormData[type.id] || {}}
                              onChange={(data) =>
                                setComponentFormData({ ...componentFormData, [type.id]: data })
                              }
                            />
                          ))}
                      </div>
                    </div>

                    {/* Deductions */}
                    <div>
                      <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                        <TrendingDown className="h-5 w-5" />
                        Deductions
                      </h3>
                      <div className="space-y-3">
                        {componentTypes
                          .filter((t) => t.category === "DEDUCTION")
                          .map((type) => (
                            <ComponentRow
                              key={type.id}
                              type={type}
                              data={componentFormData[type.id] || {}}
                              onChange={(data) =>
                                setComponentFormData({ ...componentFormData, [type.id]: data })
                              }
                            />
                          ))}
                      </div>
                    </div>
                  </div>

                  <Button onClick={saveComponents} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                    Save Components
                  </Button>
                </>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Payroll View Dialog */}
      <Dialog open={payrollDialogOpen} onOpenChange={setPayrollDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Payroll - {selectedEmployee?.name}</DialogTitle>
            <DialogDescription>
              Calculated payroll based on salary structure and attendance
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center gap-4 mt-4">
            <Select value={payrollMonth.toString()} onValueChange={(v) => setPayrollMonth(parseInt(v))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <SelectItem key={m} value={m.toString()}>
                    {getMonthName(m)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={payrollYear.toString()} onValueChange={(v) => setPayrollYear(parseInt(v))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[2024, 2025, 2026].map((y) => (
                  <SelectItem key={y} value={y.toString()}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={refreshPayroll} disabled={loadingPayroll}>
              {loadingPayroll ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calculator className="h-4 w-4" />}
              <span className="ml-2">Calculate</span>
            </Button>
          </div>

          {loadingPayroll ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : payrollData ? (
            <div className="space-y-6 mt-4">
              {/* Attendance Summary */}
              <div className="grid grid-cols-5 gap-2">
                <div className="p-3 rounded-lg bg-slate-50 text-center">
                  <p className="text-lg font-bold">{payrollData.attendance.totalWorkingDays}</p>
                  <p className="text-xs text-muted-foreground">Working Days</p>
                </div>
                <div className="p-3 rounded-lg bg-green-50 text-center">
                  <p className="text-lg font-bold text-green-600">{payrollData.attendance.daysPresent}</p>
                  <p className="text-xs text-muted-foreground">Present</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 text-center">
                  <p className="text-lg font-bold text-blue-600">{payrollData.attendance.paidLeaveDays}</p>
                  <p className="text-xs text-muted-foreground">Paid Leave</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50 text-center">
                  <p className="text-lg font-bold text-red-600">{payrollData.attendance.unpaidLeaveDays}</p>
                  <p className="text-xs text-muted-foreground">Unpaid Leave</p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 text-center">
                  <p className="text-lg font-bold text-purple-600">{payrollData.attendance.payableDays}</p>
                  <p className="text-xs text-muted-foreground">Payable Days</p>
                </div>
              </div>

              {/* Earnings & Deductions */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-green-50 px-4 py-2 font-semibold text-green-700">Earnings</div>
                  <Table>
                    <TableBody>
                      {payrollData.earnings.map((e, i) => (
                        <TableRow key={i}>
                          <TableCell>{e.name}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(e.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-green-50 font-bold">
                        <TableCell>Total Earnings</TableCell>
                        <TableCell className="text-right">{formatCurrency(payrollData.summary.grossEarnings)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-red-50 px-4 py-2 font-semibold text-red-700">Deductions</div>
                  <Table>
                    <TableBody>
                      {payrollData.deductions.map((d, i) => (
                        <TableRow key={i}>
                          <TableCell>{d.name}</TableCell>
                          <TableCell className="text-right font-medium">{formatCurrency(d.amount)}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-red-50 font-bold">
                        <TableCell>Total Deductions</TableCell>
                        <TableCell className="text-right">{formatCurrency(payrollData.summary.totalDeductions)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Net Salary */}
              <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground">Net Salary ({payrollData.attendance.attendancePercentage}% attendance)</p>
                    <p className="text-4xl font-bold text-blue-700">{formatCurrency(payrollData.summary.netSalary)}</p>
                  </div>
                  <Wallet className="h-12 w-12 text-blue-300" />
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Salary not configured for this employee. Please configure salary info and components first.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Component row for configuring individual salary components
function ComponentRow({ type, data, onChange }) {
  const handleChange = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg bg-white">
      <div className="w-48 font-medium text-sm">{type.name}</div>
      <Select
        value={data.computationType || "PERCENTAGE"}
        onValueChange={(v) => handleChange("computationType", v)}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PERCENTAGE">Percentage</SelectItem>
          <SelectItem value="FIXED">Fixed Amount</SelectItem>
        </SelectContent>
      </Select>

      {data.computationType === "PERCENTAGE" || !data.computationType ? (
        <>
          <Input
            type="number"
            placeholder="% value"
            className="w-24"
            value={data.percentageValue || ""}
            onChange={(e) => handleChange("percentageValue", e.target.value)}
          />
          <span className="text-sm text-muted-foreground">% of</span>
          <Select
            value={data.percentageBase || "WAGE"}
            onValueChange={(v) => handleChange("percentageBase", v)}
          >
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WAGE">Wage</SelectItem>
              <SelectItem value="BASIC">Basic</SelectItem>
            </SelectContent>
          </Select>
        </>
      ) : (
        <Input
          type="number"
          placeholder="Amount (₹)"
          className="w-32"
          value={data.fixedAmount || ""}
          onChange={(e) => handleChange("fixedAmount", e.target.value)}
        />
      )}
    </div>
  );
}
