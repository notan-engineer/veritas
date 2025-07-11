import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Dynamic date utilities - Always use current date instead of hardcoded dates
export function getFormattedDate(format: 'display' | 'short' | 'iso' = 'display'): string {
  const now = new Date()
  
  switch (format) {
    case 'display':
      return now.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    case 'short':
      return now.toISOString().split('T')[0] // YYYY-MM-DD
    case 'iso':
      return now.toISOString()
    default:
      return now.toLocaleDateString()
  }
}

// Get today's date for consistent documentation dating
export function getTodaysDate(): string {
  return getFormattedDate('short')
}

// Get today's date in DD-MM-YY format for planning documents
export function getPlanningDate(): string {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = String(now.getFullYear()).slice(-2)
  return `${day}-${month}-${year}`
}

// Get current timestamp for data creation
export function getCurrentTimestamp(): string {
  return new Date().toISOString()
}
