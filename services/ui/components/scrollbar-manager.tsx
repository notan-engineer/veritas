"use client"

import { useEffect } from 'react'

export function ScrollbarManager() {
  useEffect(() => {
    const scrollTimeouts = new Map<Element, NodeJS.Timeout>()

    const handleScroll = (event: Event) => {
      let target = event.target as Element | null
      
      // Handle different scroll targets
      if (!target || !target.classList) {
        // If target is document or window, use document.documentElement (html element)
        if (event.target === document || event.target === window) {
          target = document.documentElement
        } else {
          return // Skip if we can't find a valid element
        }
      }

      // Ensure target has classList before proceeding
      if (!target || !target.classList) return

      // Add scrolling class
      target.classList.add('scrolling')
      
      // Debug logging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('Scrolling detected on:', target.tagName, target.className)
      }

      // Clear existing timeout for this element
      const existingTimeout = scrollTimeouts.get(target)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
      }

      // Set new timeout to remove scrolling class after 1 second
      const timeout = setTimeout(() => {
        if (target && target.classList) {
          target.classList.remove('scrolling')
        }
        scrollTimeouts.delete(target as Element)
      }, 1000)

      scrollTimeouts.set(target, timeout)
    }

    // Add event listener to document for all scroll events (including window scroll)
    document.addEventListener('scroll', handleScroll, { capture: true, passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup function
    return () => {
      document.removeEventListener('scroll', handleScroll, { capture: true })
      window.removeEventListener('scroll', handleScroll)
      // Clear all timeouts
      scrollTimeouts.forEach(timeout => clearTimeout(timeout))
      scrollTimeouts.clear()
    }
  }, [])

  return null // This component doesn't render anything
}