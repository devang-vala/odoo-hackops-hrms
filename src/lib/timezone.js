// IST Timezone Utilities

// Convert date to IST
export function toIST(date) {
  if (!date) return null;
  
  const utcDate = new Date(date);
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(utcDate.getTime() + istOffset);
}

// Get current IST date/time
export function getCurrentIST() {
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + istOffset);
}

// Get IST date only (no time)
export function getISTDateOnly(date = new Date()) {
  const istDate = toIST(date);
  istDate.setHours(0, 0, 0, 0);
  return istDate;
}

// Format date for shadcn calendar (YYYY-MM-DD)
export function formatDateForCalendar(date) {
  if (!date) return null;
  
  const istDate = toIST(date);
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Parse date from calendar format (YYYY-MM-DD)
export function parseDateFromCalendar(dateString) {
  if (!dateString) return null;
  
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

// Format date range for API response (shadcn compatible)
export function formatDateRange(startDate, endDate) {
  return {
    from: formatDateForCalendar(startDate),
    to: formatDateForCalendar(endDate),
  };
}

// Get IST date from request (handles timezone conversion)
export function parseRequestDate(dateString) {
  if (!dateString) return getISTDateOnly();
  
  const date = new Date(dateString);
  return getISTDateOnly(date);
}

// Format time for display (IST)
export function formatISTTime(date) {
  if (!date) return null;
  
  const istDate = toIST(date);
  return istDate.toLocaleTimeString('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Format datetime for display (IST)
export function formatISTDateTime(date) {
  if (!date) return null;
  
  const istDate = toIST(date);
  return istDate.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour:  '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Calculate business days (excluding weekends)
export function calculateBusinessDays(startDate, endDate) {
  let count = 0;
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  
  return count;
}

// Check if date is weekend
export function isWeekend(date) {
  const dayOfWeek = date.getDay();
  return dayOfWeek === 0 || dayOfWeek === 6;
}

// Get IST start of day
export function getISTStartOfDay(date = new Date()) {
  const istDate = toIST(date);
  istDate.setHours(0, 0, 0, 0);
  return istDate;
}

// Get IST end of day
export function getISTEndOfDay(date = new Date()) {
  const istDate = toIST(date);
  istDate.setHours(23, 59, 59, 999);
  return istDate;
}