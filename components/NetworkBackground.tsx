'use client'

import { useEffect } from 'react'

export default function NetworkBackground() {
  useEffect(() => {
    const container = document.getElementById('network-bg')
    if (!container) return

    // Create network lines
    const lines: HTMLElement[] = []
    for (let i = 0; i < 8; i++) {
      const line = document.createElement('div')
      line.className = 'network-line'
      line.style.width = `${Math.random() * 200 + 100}px`
      line.style.height = '1px'
      line.style.top = `${Math.random() * 100}%`
      line.style.left = `${Math.random() * 100}%`
      line.style.animationDelay = `${Math.random() * 20}s`
      line.style.animationDuration = `${15 + Math.random() * 10}s`
      container.appendChild(line)
      lines.push(line)
    }

    return () => {
      lines.forEach(line => line.remove())
    }
  }, [])

  return null
}

