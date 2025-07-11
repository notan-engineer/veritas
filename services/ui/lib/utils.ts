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

// Get current timestamp for data creation
export function getCurrentTimestamp(): string {
  return new Date().toISOString()
}
