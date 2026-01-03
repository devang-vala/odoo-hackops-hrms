import { z } from "zod"

/**
 * Validation schema for employee updating own profile
 */
export const updateOwnProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long").optional(),
  phone: z
    .string()
    .regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number format")
    .optional()
    .nullable(),
})

/**
 * Validate update data against schema
 * @param {Object} data - Data to validate
 * @param {Object} schema - Zod schema
 * @returns {Object} Validation result
 */
export function validateData(data, schema) {
  try {
    const validated = schema.parse(data)
    return { success: true, data: validated }
  } catch (error) {
    const errors = error.errors.map((err) => ({
      field: err.path.join("."),
      message: err.message,
    }))
    return { success: false, errors }
  }
}
