'use client'

import { useState, useRef, useEffect } from 'react'

// Sound generation for unlocking mechanic (cage unlocking)
let audioContextInstance: AudioContext | null = null

const getAudioContext = (): AudioContext | null => {
  try {
    if (!audioContextInstance) {
      audioContextInstance = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    // Resume if suspended (browsers require user interaction)
    if (audioContextInstance.state === 'suspended') {
      audioContextInstance.resume()
    }
    return audioContextInstance
  } catch (err) {
    return null
  }
}

const createUnlockSound = (frequency: number, duration: number = 0.15, type: OscillatorType = 'sine') => {
  const audioContext = getAudioContext()
  if (!audioContext) return

  try {
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.type = type
    oscillator.frequency.value = frequency

    // Envelope for unlocking sound (quick attack, decay) - metallic/cage-like
    gainNode.gain.setValueAtTime(0, audioContext.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.08, audioContext.currentTime + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + duration)
  } catch (err) {
    // Silently fail if audio not available
  }
}

const playNodePlaceSound = () => {
  // Metallic click/unlock sound - like a cage mechanism clicking into place
  createUnlockSound(600, 0.1, 'square') // Square wave for more metallic sound
  setTimeout(() => createUnlockSound(800, 0.08, 'sine'), 30)
}

const playCompleteUnlockSound = () => {
  // Lower, more resonant unlocking sound - cage opening fully
  createUnlockSound(300, 0.25, 'sine')
  setTimeout(() => createUnlockSound(400, 0.2, 'sine'), 100)
  setTimeout(() => createUnlockSound(500, 0.15, 'sine'), 200)
  // Final metallic release
  setTimeout(() => createUnlockSound(700, 0.1, 'square'), 300)
}

interface Node {
  id: string
  label: string
  x: number
  y: number
  placed: boolean
  correctVertex: 'top' | 'bottomLeft' | 'bottomRight'
}

interface TriangleGateProps {
  onComplete: () => void
}

export default function TriangleGate({ onComplete }: TriangleGateProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const onCompleteRef = useRef(onComplete)
  const networkTriggeredRef = useRef(false)
  
  // Update ref when onComplete changes
  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])
  
  const [nodes, setNodes] = useState<Node[]>([
    { id: 'builder', label: 'Builder', x: 20, y: 30, placed: false, correctVertex: 'bottomLeft' },
    { id: 'translator', label: 'Translator', x: 50, y: 60, placed: false, correctVertex: 'bottomRight' },
    { id: 'architect', label: 'Architect', x: 70, y: 20, placed: false, correctVertex: 'top' },
  ])
  const [dragging, setDragging] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [glowActive, setGlowActive] = useState(false)
  const [showNetwork, setShowNetwork] = useState(false)
  const capturedElementRef = useRef<HTMLElement | null>(null)
  const capturedPointerIdRef = useRef<number | null>(null)
  
  // Performance: useRef for live drag position (avoids re-renders during drag)
  const liveDragPositionRef = useRef<{ nodeId: string; x: number; y: number } | null>(null)
  const cachedRectRef = useRef<DOMRect | null>(null)

  // Vertex positions (percentage-based)
  const vertices = {
    top: { x: 50, y: 10 },
    bottomLeft: { x: 20, y: 85 },
    bottomRight: { x: 80, y: 85 },
  }

  const snapRadius = 12 // percentage (increased for better mobile touch targets and intuitiveness)

  useEffect(() => {
    // Position nodes outside triangle frame as "ingredients"
    // Place them around the edges of the container, away from triangle vertices
    const positions = [
      { x: 5, y: 50, label: 'Builder' },        // Far left, middle
      { x: 95, y: 50, label: 'Translator' },    // Far right, middle
      { x: 50, y: 2, label: 'Architect' },      // Top center, above triangle
    ]
    
    const randomized = nodes.map((node) => {
      const pos = positions.find(p => p.label === node.label)
      if (!pos) return node
      // Add slight random offset to avoid exact same positions
      return {
        ...node,
        x: pos.x + (Math.random() - 0.5) * 3,
        y: pos.y + (Math.random() - 0.5) * 3,
      }
    })
    setNodes(randomized)
  }, [])

  useEffect(() => {
    const allPlaced = nodes.every(node => node.placed)
    
    if (allPlaced) {
      if (!glowActive) {
        setGlowActive(true)
        // Play complete unlock sound when all nodes are placed
        playCompleteUnlockSound()
      }
      
      // Show network integration after a brief moment (only once)
      if (!showNetwork && !networkTriggeredRef.current) {
        networkTriggeredRef.current = true
        const networkTimer = setTimeout(() => {
          setShowNetwork(true)
          // Auto-proceed after network animation
          setTimeout(() => {
            onCompleteRef.current()
          }, 2500) // 2.5 seconds for the animation
        }, 800)
        
        return () => clearTimeout(networkTimer)
      }
    } else {
      setGlowActive(false)
      setShowNetwork(false)
      networkTriggeredRef.current = false // Reset if nodes are unplaced
    }
  }, [nodes]) // Only depend on nodes to trigger when placement changes

  const getDistance = (x1: number, y1: number, x2: number, y2: number) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }

  const handlePointerDown = (e: React.PointerEvent, nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node || node.placed || dragging) return

    // Prevent all default behaviors
    e.preventDefault()
    e.stopPropagation()

    // Performance: Cache boundingClientRect on pointerDown (don't recalculate on every move)
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    cachedRectRef.current = rect

    // Calculate offset from pointer position to node center
    const nodeCenterX = rect.left + (node.x / 100) * rect.width
    const nodeCenterY = rect.top + (node.y / 100) * rect.height
    
    setDragging(nodeId)
    setDragOffset({
      x: e.clientX - nodeCenterX,
      y: e.clientY - nodeCenterY,
    })
    
    // Performance: Initialize live drag position ref
    liveDragPositionRef.current = { nodeId, x: node.x, y: node.y }

    // Capture pointer for smooth dragging (works on both mouse and touch)
    const target = e.currentTarget as HTMLElement
    try {
      target.setPointerCapture(e.pointerId)
      capturedElementRef.current = target
      capturedPointerIdRef.current = e.pointerId
    } catch (err) {
      // Fallback for browsers that don't support pointer capture
      capturedElementRef.current = null
      capturedPointerIdRef.current = null
    }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging || !containerRef.current || !liveDragPositionRef.current) return

    // Only process if this is the captured pointer
    if (capturedPointerIdRef.current !== null && e.pointerId !== capturedPointerIdRef.current) {
      return
    }

    e.preventDefault()

    // Performance: Use cached rect instead of recalculating
    const rect = cachedRectRef.current || containerRef.current.getBoundingClientRect()
    if (!cachedRectRef.current) {
      cachedRectRef.current = rect
    }
    
    // Calculate new position using clientX/clientY (works for both mouse and touch)
    const newX = ((e.clientX - rect.left - dragOffset.x) / rect.width) * 100
    const newY = ((e.clientY - rect.top - dragOffset.y) / rect.height) * 100

    // Constrain to container bounds
    const constrainedX = Math.max(5, Math.min(95, newX))
    const constrainedY = Math.max(5, Math.min(95, newY))

    // Performance: Update ref directly (no re-render during drag)
    liveDragPositionRef.current = { nodeId: dragging, x: constrainedX, y: constrainedY }
    
    // Performance: Direct DOM manipulation using transform (no React re-render, GPU accelerated)
    // This avoids setState during drag which would cause full component re-renders
    const draggingNode = containerRef.current?.querySelector(`[data-node-id="${dragging}"]`) as HTMLElement
    if (draggingNode && rect) {
      const translateX = (constrainedX / 100) * rect.width - rect.width / 2
      const translateY = (constrainedY / 100) * rect.height - rect.height / 2
      draggingNode.style.transform = `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(1.1)`
    }
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragging) {
      // Release capture if we have one
      releasePointerCapture(e.pointerId)
      return
    }

    // Only process if this is the captured pointer
    if (capturedPointerIdRef.current !== null && e.pointerId !== capturedPointerIdRef.current) {
      return
    }

    // Performance: Sync ref position to state (only once on pointerUp)
    const livePos = liveDragPositionRef.current
    if (livePos && livePos.nodeId === dragging) {
      setNodes(prev => {
        const node = prev.find(n => n.id === dragging)
        if (!node) return prev

        // Update position from ref
        const updatedNode = { ...node, x: livePos.x, y: livePos.y }
        const targetVertex = vertices[updatedNode.correctVertex]
        const distance = getDistance(updatedNode.x, updatedNode.y, targetVertex.x, targetVertex.y)

        if (distance <= snapRadius) {
          const wasNotPlaced = !updatedNode.placed
          const updated = prev.map(n =>
            n.id === dragging
              ? { ...n, x: targetVertex.x, y: targetVertex.y, placed: true }
              : n
          )
          if (wasNotPlaced) {
            playNodePlaceSound()
          }
          return updated
        }
        
        // Update position from ref
        return prev.map(n => n.id === dragging ? updatedNode : n)
      })
    }

    setDragging(null)
    liveDragPositionRef.current = null
    cachedRectRef.current = null
    releasePointerCapture(e.pointerId)
  }

  const handlePointerCancel = (e: React.PointerEvent) => {
    // Handle pointer cancellation (e.g., user switches apps, pointer lost)
    setDragging(null)
    liveDragPositionRef.current = null
    cachedRectRef.current = null
    releasePointerCapture(e.pointerId)
  }

  const releasePointerCapture = (pointerId: number) => {
    if (capturedElementRef.current && capturedPointerIdRef.current === pointerId) {
      try {
        capturedElementRef.current.releasePointerCapture(pointerId)
      } catch (err) {
        // Ignore if not supported
      }
      capturedElementRef.current = null
      capturedPointerIdRef.current = null
    }
  }

  const allPlaced = nodes.every(node => node.placed)

  return (
    <div className="space-y-8">
      {!showNetwork && (
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-light text-solar-green-200">
            Structural Calibration
          </h3>
          <p 
            className="text-solar-green-300/80 text-sm pointer-events-none select-none"
            style={{ WebkitTouchCallout: 'none' }}
          >
            Align each node to its designated vertex
          </p>
        </div>
      )}

      {showNetwork && (
        <div className="text-center space-y-4 animate-fade-in">
          <h3 className="text-2xl font-light text-solar-green-200">
            Network Integration
          </h3>
          <p 
            className="text-solar-green-300/80 text-sm pointer-events-none select-none"
            style={{ WebkitTouchCallout: 'none' }}
          >
            System integrity achieved. Connecting to network...
          </p>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative w-full aspect-square max-w-md mx-auto triangle-gate-container"
        style={{ 
          minHeight: '400px',
          touchAction: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        {/* Larger circle (network) - appears when showNetwork is true */}
        {showNetwork && (
          <svg
            className="absolute inset-0 w-full h-full z-0 animate-fade-in"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Outer circle representing the network */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(76, 175, 80, 0.2)"
              strokeWidth="0.3"
              className="animate-pulse"
            />
            {/* Subtle background triangles (other nodes in network) */}
            <g opacity="0.15">
              <polygon
                points="20,20 10,35 30,35"
                fill="none"
                stroke="rgba(76, 175, 80, 0.3)"
                strokeWidth="0.2"
              />
              <polygon
                points="80,20 70,35 90,35"
                fill="none"
                stroke="rgba(76, 175, 80, 0.3)"
                strokeWidth="0.2"
              />
              <polygon
                points="20,80 10,65 30,65"
                fill="none"
                stroke="rgba(76, 175, 80, 0.3)"
                strokeWidth="0.2"
              />
              <polygon
                points="80,80 70,65 90,65"
                fill="none"
                stroke="rgba(76, 175, 80, 0.3)"
                strokeWidth="0.2"
              />
            </g>
            {/* Connection lines to other nodes */}
            <g opacity="0.2">
              <line
                x1="50"
                y1="50"
                x2="20"
                y2="20"
                stroke="rgba(76, 175, 80, 0.2)"
                strokeWidth="0.2"
              />
              <line
                x1="50"
                y1="50"
                x2="80"
                y2="20"
                stroke="rgba(76, 175, 80, 0.2)"
                strokeWidth="0.2"
              />
              <line
                x1="50"
                y1="50"
                x2="20"
                y2="80"
                stroke="rgba(76, 175, 80, 0.2)"
                strokeWidth="0.2"
              />
              <line
                x1="50"
                y1="50"
                x2="80"
                y2="80"
                stroke="rgba(76, 175, 80, 0.2)"
                strokeWidth="0.2"
              />
            </g>
          </svg>
        )}

        {/* Triangle outline - animates to fit within circle */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          style={{
            transform: showNetwork ? 'scale(0.75)' : 'scale(1)',
            transition: 'transform 2s ease-out',
            zIndex: 1,
          }}
        >
          <polygon
            points="50,10 20,85 80,85"
            fill="none"
            stroke={allPlaced && glowActive ? '#4caf50' : 'rgba(76, 175, 80, 0.3)'}
            strokeWidth={showNetwork ? '0.4' : '0.5'}
            className={`transition-all duration-2000 ${
              allPlaced ? 'drop-shadow-[0_0_20px_rgba(76,175,80,0.5)]' : ''
            } ${showNetwork ? 'drop-shadow-[0_0_30px_rgba(76,175,80,0.6)]' : ''}`}
          />
        </svg>

        {/* Vertex zones (snap areas) - more visible when dragging */}
        {Object.entries(vertices).map(([key, vertex]) => {
          const node = nodes.find(n => n.correctVertex === key)
          const isDraggingToThis = dragging && nodes.find(n => n.id === dragging)?.correctVertex === key
          const distance = dragging && node
            ? getDistance(
                nodes.find(n => n.id === dragging)!.x,
                nodes.find(n => n.id === dragging)!.y,
                vertex.x,
                vertex.y
              )
            : Infinity
          const isInRange = distance <= snapRadius
          
          return (
            <div
              key={key}
              className={`absolute rounded-full border-2 transition-all ${
                isDraggingToThis && isInRange
                  ? 'border-solar-gold-400 bg-solar-gold-400/10'
                  : isDraggingToThis
                  ? 'border-solar-green-500/50 bg-solar-green-500/5'
                  : 'border-solar-green-700/20 bg-transparent'
              }`}
              style={{
                left: `${vertex.x - snapRadius}%`,
                top: `${vertex.y - snapRadius}%`,
                width: `${snapRadius * 2}%`,
                height: `${snapRadius * 2}%`,
                pointerEvents: 'none',
                opacity: dragging && isDraggingToThis ? 1 : dragging ? 0.3 : 0.1,
              }}
            />
          )
        })}

        {/* Draggable nodes */}
        {nodes.map(node => {
          // Performance: Use live position from ref during drag, otherwise use state
          const isDragging = dragging === node.id
          const livePos = isDragging && liveDragPositionRef.current?.nodeId === node.id
            ? liveDragPositionRef.current
            : null
          const displayX = livePos ? livePos.x : node.x
          const displayY = livePos ? livePos.y : node.y
          
          // Performance: Use transform instead of left/top (GPU accelerated, no layout)
          // Use cached rect if available, otherwise use container dimensions (no getBoundingClientRect call)
          const rect = cachedRectRef.current
          const containerWidth = rect?.width || containerRef.current?.offsetWidth || 400
          const containerHeight = rect?.height || containerRef.current?.offsetHeight || 400
          const translateX = (displayX / 100) * containerWidth - containerWidth / 2
          const translateY = (displayY / 100) * containerHeight - containerHeight / 2
          
          return (
            <div
              key={node.id}
              data-node-id={node.id}
              className={`absolute select-none rounded-full flex items-center justify-center text-xs md:text-sm font-medium border-2 ${
                node.placed
                  ? 'cursor-default opacity-100 bg-solar-green-900/40 border-solar-gold-400/50 text-solar-gold-300 transition-all'
                  : 'cursor-grab active:cursor-grabbing opacity-70 hover:opacity-90 bg-solar-green-900/20 border-solar-green-600 text-solar-green-200 transition-all'
              } ${isDragging ? 'opacity-90 scale-110 z-10' : ''} ${
                allPlaced && node.placed ? 'animate-pulse glow-gold' : ''
              } w-20 h-20 md:w-24 md:h-24`}
              style={{
                left: '50%',
                top: '50%',
                // Performance: Use transform instead of left/top (GPU accelerated, no layout)
                // During drag, handlePointerMove updates transform directly via DOM for performance
                // React sets initial/fallback transform here
                // translate(-50%, -50%) centers the element on its anchor point (left: 50%, top: 50%)
                transform: showNetwork 
                  ? `translate(-50%, -50%) translate(${translateX * 0.75}px, ${translateY * 0.75}px) scale(0.75)` 
                  : isDragging
                  ? `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(1.1)`
                  : `translate(-50%, -50%) translate(${translateX}px, ${translateY}px)`,
                transition: isDragging ? 'none' : showNetwork ? 'transform 2s ease-out' : 'transform 0.3s ease-out',
                pointerEvents: node.placed ? 'none' : 'auto',
                touchAction: 'none',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTapHighlightColor: 'transparent',
              }}
              draggable={false}
              onPointerDown={(e) => {
                if (!node.placed) {
                  handlePointerDown(e, node.id)
                }
              }}
            >
              {node.label}
            </div>
          )
        })}
      </div>

      {allPlaced && !showNetwork && (
        <div className="text-center space-y-6 animate-fade-in">
          <p 
            className="text-solar-green-300 text-lg font-light pointer-events-none select-none"
            style={{ WebkitTouchCallout: 'none' }}
          >
            System integrity achieved.
          </p>
        </div>
      )}
    </div>
  )
}
