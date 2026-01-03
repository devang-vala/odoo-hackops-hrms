import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

// Server-side session helper
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

// Check if user is HR
export async function isHR() {
  const user = await getCurrentUser();
  return user?.role === "HR";
}

// Check if user is Employee
export async function isEmployee() {
  const user = await getCurrentUser();
  return user?.role === "EMPLOYEE";
}

// Check if user is authenticated
export async function isAuthenticated() {
  const session = await getServerSession(authOptions);
  return !!session;
}

// Get user role
export async function getUserRole() {
  const user = await getCurrentUser();
  return user?.role || null;
}

// Require authentication
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

// Require HR role
export async function requireHR() {
  const user = await requireAuth();
  if (user.role !== "HR") {
    throw new Error("Forbidden:  HR/ADMIN access required");
  }
  return user;
}