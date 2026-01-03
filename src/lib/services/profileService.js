import { prisma } from "@/lib/prisma"

/**
 * Get user profile by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profile data
 */
export async function getUserProfile(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      employeeId: true,
      role: true,
      paidLeaveBalance: true,
      sickLeaveBalance: true,
      casualLeaveBalance: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  if (!user) {
    throw new Error("User not found")
  }

  return user
}

/**
 * Update employee's own profile (limited fields)
 * @param {string} userId - User ID
 * @param {Object} data - Update data
 * @returns {Promise<Object>} Updated user profile
 */
export async function updateOwnProfile(userId, data) {
  // Only allow updating name and phone
  const allowedFields = {}
  if (data.name !== undefined) allowedFields.name = data.name
  if (data.phone !== undefined) allowedFields.phone = data.phone

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: allowedFields,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      employeeId: true,
      role: true,
      paidLeaveBalance: true,
      sickLeaveBalance: true,
      casualLeaveBalance: true,
      createdAt: true,
      updatedAt: true,
    },
  })

  return updatedUser
}
