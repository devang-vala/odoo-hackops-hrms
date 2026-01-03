import { prisma } from "@/lib/prisma";

/**
 * Generate Employee ID
 * Format: [Company][FirstName][LastName][Year][Serial]
 * Example:  OIJODO20220001
 */
export async function generateEmployeeId(fullName, companyName, joiningYear = null) {
  try {
    // Extract name parts
    const nameParts = fullName.trim().split(" ").filter(Boolean);
    const firstName = nameParts[0] || "";
    const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : firstName;
    
    // Get first 2 letters of first and last name
    const firstNameInitials = firstName.substring(0, 2).toUpperCase().padEnd(2, "X");
    const lastNameInitials = lastName.substring(0, 2).toUpperCase().padEnd(2, "X");
    
    // Get company initials (first letter of first 2 words)
    const companyWords = companyName.trim().split(" ").filter(Boolean);
    let companyInitials = "";
    
    if (companyWords.length === 1) {
      companyInitials = companyWords[0].substring(0, 2).toUpperCase().padEnd(2, "X");
    } else {
      companyInitials = (
        companyWords[0].charAt(0) + 
        companyWords[1].charAt(0)
      ).toUpperCase();
    }
    
    // Get year
    const year = joiningYear || new Date().getFullYear();
    
    // Get serial number for this year
    const lastEmployee = await prisma.user.findFirst({
      where: {
        joiningYear: year,
        employeeId: {
          not:  null,
        },
      },
      orderBy: {
        serialNumber: "desc",
      },
    });
    
    const serialNumber = lastEmployee ? lastEmployee.serialNumber + 1 :  1;
    const serialStr = String(serialNumber).padStart(4, "0");
    
    // Build employee ID:  OIJODO20220001
    const employeeId = `${companyInitials}${firstNameInitials}${lastNameInitials}${year}${serialStr}`;
    
    return {
      employeeId,
      serialNumber,
      joiningYear:  year,
    };
  } catch (error) {
    console.error("Error generating employee ID:", error);
    throw new Error("Failed to generate employee ID");
  }
}

/**
 * Generate a random secure password
 */
export function generatePassword(length = 12) {
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "@#$%&*! ";
  
  const allChars = uppercase + lowercase + numbers + special;
  
  let password = "";
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += special[Math.floor(Math.random() * special.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}