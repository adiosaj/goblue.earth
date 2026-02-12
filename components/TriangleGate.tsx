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
  
  // Global event handlers for reliable dragging
  useEffect(() => {
    if (!dragging) return

    const handleGlobalMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current || !dragging) return

      const clientX = 'touches' in e ? e.touches[0]?.clientX : e.clientX
      const clientY = 'touches' in e ? e.touches[0]?.clientY : e.clientY

      if (clientX === undefined || clientY === undefined) return

      // Prevent scrolling on touch
      if ('touches' in e) {
        e.preventDefault()
      }

      const rect = containerRef.current.getBoundingClientRect()
      const newX = ((clientX - rect.left - dragOffset.x) / rect.width) * 100
      const newY = ((clientY - rect.top - dragOffset.y) / rect.height) * 100

      const constrainedX = Math.max(5, Math.min(95, newX))
      const constrainedY = Math.max(5, Math.min(95, newY))

      setNodes(prev =>
        prev.map(node =>
          node.id === dragging
            ? { ...node, x: constrainedX, y: constrainedY }
            : node
        )
      )
    }

    const handleGlobalUp = () => {
      if (!dragging) return

      setNodes(prev => {
        const node = prev.find(n => n.id === dragging)
        if (!node) return prev

        const targetVertex = vertices[node.correctVertex]
        const distance = getDistance(node.x, node.y, targetVertex.x, targetVertex.y)

        if (distance <= snapRadius) {
          const wasNotPlaced = !node.placed
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
        return prev
      })

      setDragging(null)
    }

    // Add global listeners
    document.addEventListener('mousemove', handleGlobalMove)
    document.addEventListener('mouseup', handleGlobalUp)
    document.addEventListener('touchmove', handleGlobalMove, { passive: false })
    document.addEventListener('touchend', handleGlobalUp)
    document.addEventListener('touchcancel', handleGlobalUp)

    return () => {
      document.removeEventListener('mousemove', handleGlobalMove)
      document.removeEventListener('mouseup', handleGlobalUp)
      document.removeEventListener('touchmove', handleGlobalMove)
      document.removeEventListener('touchend', handleGlobalUp)
      document.removeEventListener('touchcancel', handleGlobalUp)
    }
  }, [dragging, dragOffset])

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

    e.preventDefault()
    e.stopPropagation()

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    // Calculate offset from click position to node center
    const nodeCenterX = rect.left + (node.x / 100) * rect.width
    const nodeCenterY = rect.top + (node.y / 100) * rect.height
    
    setDragging(nodeId)
    setDragOffset({
      x: e.clientX - nodeCenterX,
      y: e.clientY - nodeCenterY,
    })
  }

  const allPlaced = nodes.every(node => node.placed)

  return (
    <div className="space-y-8">
      {!showNetwork && (
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-light text-solar-green-200">
            Structural Calibration
          </h3>
          <p className="text-solar-green-300/80 text-sm">
            Align each node to its designated vertex
          </p>
        </div>
      )}

      {showNetwork && (
        <div className="text-center space-y-4 animate-fade-in">
          <h3 className="text-2xl font-light text-solar-green-200">
            Network Integration
          </h3>
          <p className="text-solar-green-300/80 text-sm">
            System integrity achieved. Connecting to network...
          </p>
        </div>
      )}

      <div
        ref={containerRef}
        className="relative w-full aspect-square max-w-md mx-auto"
        style={{ 
          minHeight: '400px',
        }}
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
        {nodes.map(node => (
          <div
            key={node.id}
            className={`absolute select-none ${
              node.placed
                ? 'cursor-default opacity-100'
                : 'cursor-grab active:cursor-grabbing opacity-70 hover:opacity-90'
            } ${dragging === node.id ? 'opacity-90 scale-110 z-10' : ''} ${
              allPlaced && node.placed ? 'animate-pulse' : ''
            }`}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: showNetwork 
                ? 'translate(-50%, -50%) scale(0.75)' 
                : dragging === node.id
                ? 'translate(-50%, -50%) scale(1.1)'
                : 'translate(-50%, -50%)',
              transition: dragging === node.id ? 'none' : showNetwork ? 'transform 2s ease-out' : 'transform 0.3s ease-out',
              pointerEvents: node.placed ? 'none' : 'auto',
              touchAction: 'none',
            }}
            onPointerDown={(e) => {
              if (!node.placed) {
                handlePointerDown(e, node.id)
              }
            }}
          >
            <div
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center text-xs md:text-sm font-medium border-2 pointer-events-none ${
                node.placed
                  ? 'bg-solar-green-900/40 border-solar-gold-400/50 text-solar-gold-300 transition-all'
                  : 'bg-solar-green-900/20 border-solar-green-600 text-solar-green-200 transition-all'
              } ${allPlaced && node.placed ? 'glow-gold' : ''}`}
            >
              {node.label}
            </div>
          </div>
        ))}
      </div>

      {allPlaced && !showNetwork && (
        <div className="text-center space-y-6 animate-fade-in">
          <p className="text-solar-green-300 text-lg font-light">
            System integrity achieved.
          </p>
        </div>
      )}
    </div>
  )
}

