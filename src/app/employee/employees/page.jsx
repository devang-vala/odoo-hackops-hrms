"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import {
  Building2,
  Users,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AllEmployeesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);
  const [companyLogo, setCompanyLogo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user) {
      fetchEmployeesData();
    }
  }, [user]);

  const fetchEmployeesData = async () => {
    try {
      setLoading(true);
      
      // Fetch all employees from the backend
      const response = await api.get("/api/employees");
      const employeesData = response.data.employees || [];
      
      setEmployees(employeesData);
      
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on search term
  const filteredEmployees = employees.filter(employee =>
    employee.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const EmployeeCard = ({ employee }) => {
    // Determine status color
    const getStatusColor = () => {
      if (employee.status === "PRESENT") return "bg-green-500";
      if (employee.status === "ON_LEAVE") return "bg-yellow-500";
      return "bg-red-500";
    };

    return (
      <Card className="relative overflow-hidden hover:shadow-lg transition-shadow duration-200 w-full h-64 bg-white border border-gray-200">
        <CardContent className="p-6 h-full relative">
          {/* Status Indicator - Top Right Circle */}
          <div className="absolute top-4 right-4">
            <div 
              className={`w-5 h-5 rounded-full ${getStatusColor()} border-2 border-white shadow-lg`}
              title={employee.status === "PRESENT" ? "Present" : employee.status === "ON_LEAVE" ? "On Leave" : "Absent"}
            />
          </div>
          
          {/* Employee Profile Picture - Far Left */}
          <div className="absolute left-4 top-6">
            <div className="w-24 h-24 rounded-lg overflow-hidden border border-gray-300 bg-gray-100">
              {employee.companyLogo ? (
                <Image
                  src={employee.companyLogo}
                  alt={`${employee.name}'s profile`}
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
          </div>
          
          {/* Company Logo - Center (removed) */}
          
          {/* Employee Name - Bottom */}
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-sm font-medium text-gray-900 text-center truncate">
              {employee.name || "Employee"}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  const SkeletonCard = () => (
    <Card className="w-full h-64">
      <CardContent className="p-6 h-full relative">
        <div className="absolute left-4 top-6">
          <Skeleton className="w-16 h-16 rounded-full" />
        </div>
        <div className="flex justify-center items-center h-2/3">
          <Skeleton className="w-24 h-24 rounded-lg" />
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <Skeleton className="h-16 w-full rounded-lg" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary rounded-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">All Employees</h1>
            <p className="text-muted-foreground">
              {loading ? "Loading..." : `${filteredEmployees.length} employees found`}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search employees..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
        ) : (
          filteredEmployees.map((employee) => (
            <EmployeeCard key={employee.id} employee={employee} />
          ))
        )}
      </div>

      {/* Empty State */}
      {!loading && filteredEmployees.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No employees found</h3>
          <p className="text-gray-500">
            {searchTerm ? "Try adjusting your search terms." : "No employees have been added yet."}
          </p>
        </div>
      )}
    </div>
  );
}