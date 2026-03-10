'use client'

import { CHAMP_DOCUMENTS, ChampDocument, CHAMP_FOLDER_URL } from '@/lib/champ-documents'
import { setChampAccessUnlocked } from './ChampAccessGate'

interface ChampMotherboardProps {
  onExit?: () => void
}

const TOTAL_SLOTS = 12
const ACTIVE_COUNT = 4
const RADIUS_PERCENT = 38
/** Active nodes at cardinal positions: top (0), right (3), bottom (6), left (9) */
const DESKTOP_ACTIVE_SLOTS = [0, 3, 6, 9]

function getSlotPosition(index: number, radiusPercent = RADIUS_PERCENT) {
  const angle = (index / TOTAL_SLOTS) * Math.PI * 2 - Math.PI / 2
  const x = 50 + radiusPercent * Math.cos(angle)
  const y = 50 + radiusPercent * Math.sin(angle)
  return { x, y }
}

function getDodecagonPath(radiusPercent: number) {
  return Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    const { x, y } = getSlotPosition(i, radiusPercent)
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ') + ' Z'
}

export default function ChampMotherboard({ onExit }: ChampMotherboardProps) {
  const handleExit = () => {
    setChampAccessUnlocked(false)
    onExit?.()
  }

  const activeDocs: ChampDocument[] = CHAMP_DOCUMENTS.slice(0, ACTIVE_COUNT)

  const pathD = DESKTOP_ACTIVE_SLOTS.map((slotIndex, i) => {
    const { x, y } = getSlotPosition(slotIndex)
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')
  const dodecagonPath = getDodecagonPath(RADIUS_PERCENT + 6)

  return (
    <main className="relative min-h-screen px-4 py-10 md:py-14 z-10">
      <div className="max-w-5xl mx-auto space-y-12 animate-fade-in">
        {/* Central core */}
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-solar-green-50">
            GYC 2026 // Year of the Sky
          </h1>
          <p className="text-solar-gold-400/90 text-sm md:text-base uppercase tracking-[0.18em]">
            12 nodes. One rhythm.
          </p>
          <p className="text-solar-green-200/90 text-sm md:text-base">
            Read. Align. Sign. Activate.
          </p>
          <p className="text-solar-green-500/70 text-xs">
            Begin with the highlighted path.
          </p>
        </div>

        {/* Desktop: Chamber 12-node ring */}
        <div className="hidden md:block relative max-w-[640px] mx-auto">
          <div className="relative aspect-square max-w-full mx-auto">
            {/* Ring outline & path */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <radialGradient id="ring-gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(76, 175, 80, 0.0)" />
                  <stop offset="70%" stopColor="rgba(76, 175, 80, 0.15)" />
                  <stop offset="100%" stopColor="rgba(249, 168, 37, 0.12)" />
                </radialGradient>
                <linearGradient id="path-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(76, 175, 80, 0.6)" />
                  <stop offset="100%" stopColor="rgba(249, 168, 37, 0.7)" />
                </linearGradient>
              </defs>

              {/* Dodecagon chamber outline */}
              <path
                d={dodecagonPath}
                fill="none"
                stroke="url(#ring-gradient)"
                strokeWidth="0.6"
                strokeDasharray="2 3"
                opacity="0.8"
              />

              {/* Highlighted path through active nodes */}
              <path
                d={pathD}
                fill="none"
                stroke="url(#path-gradient)"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="4 3"
                opacity="0.9"
              />
            </svg>

            {/* 12 slots: active at cardinal positions 0,3,6,9 */}
            <div className="absolute inset-0">
              {Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
                const { x, y } = getSlotPosition(index)
                const activeIndex = DESKTOP_ACTIVE_SLOTS.indexOf(index)
                const isActive = activeIndex >= 0
                const doc = isActive ? activeDocs[activeIndex] : null
                return (
                  <div
                    key={index}
                    className="absolute"
                    style={{
                      left: `${x}%`,
                      top: `${y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {isActive && doc ? (
                      <ActiveNode index={activeIndex} doc={doc} />
                    ) : (
                      <InactiveNode />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Mobile: Vertical activation spine */}
        <div className="md:hidden relative w-full max-w-sm mx-auto">
          {/* Central spine line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-px bg-gradient-to-b from-solar-green-500/40 via-solar-green-500/30 to-solar-gold-400/30 opacity-70"
            aria-hidden
          />
          <div className="relative flex flex-col items-stretch gap-0">
            {activeDocs.map((doc, index) => (
              <div key={doc.title} className="flex flex-col items-center">
                {/* Level: two inactive dots + active node + two inactive dots */}
                <div className="flex items-center justify-between w-full gap-2 py-5">
                  <div className="flex gap-2 shrink-0">
                    <InactiveNode />
                    <InactiveNode />
                  </div>
                  <div className="flex-1 min-w-0 flex justify-center px-1">
                    <ActiveNode index={index} doc={doc} variant="spine" />
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <InactiveNode />
                    <InactiveNode />
                  </div>
                </div>
                {/* Connector line between nodes */}
                {index < activeDocs.length - 1 && (
                  <div
                    className="w-px h-8 flex-shrink-0 rounded-full bg-solar-green-500/40"
                    aria-hidden
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Small notes and folder link */}
        <div className="max-w-xl mx-auto text-center space-y-2 text-xs pt-8 md:pt-0">
          <p className="text-solar-green-400/70">
            Access to this layer is limited to confirmed GYC Champs 2026.
          </p>
          <p className="text-solar-green-500/60">
            Do not share this access layer publicly.
          </p>
          <p className="pt-1">
            <a
              href={CHAMP_FOLDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-solar-green-300/80 hover:text-solar-gold-400/90 transition-smooth underline underline-offset-2 text-[0.7rem]"
            >
              View full document folder
            </a>
          </p>
        </div>

        {/* Exit system */}
        {onExit && (
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={handleExit}
              className="text-xs text-solar-green-500/70 hover:text-solar-green-400/90 transition-smooth underline underline-offset-2"
            >
              Exit system
            </button>
          </div>
        )}
      </div>
    </main>
  )
}

function ActiveNode({
  index,
  doc,
  variant = 'ring',
}: {
  index: number
  doc: ChampDocument
  variant?: 'ring' | 'spine'
}) {
  const isMission = index === 3
  const isPlaceholder = doc.url === '#'
  const isSpine = variant === 'spine'

  const content = (
    <div
      className={`
        relative border text-center select-none
        motherboard-card-pulse transition-smooth
        ${isSpine ? 'w-full rounded-lg px-4 py-3.5' : 'rounded-full px-4 py-3 md:px-5 md:py-3.5'}
        ${
          isMission
            ? 'border-solar-gold-400/70 bg-solar-green-900/20 shadow-[0_0_24px_rgba(249,168,37,0.25)]'
            : 'border-solar-green-500/50 bg-solar-dark/90 shadow-[0_0_18px_rgba(76,175,80,0.18)]'
        }
        ${isPlaceholder ? 'opacity-80' : 'cursor-pointer hover:scale-[1.03] active:scale-[0.99]'}
      `}
    >
      <div className="text-[0.6rem] md:text-[0.65rem] font-medium tracking-[0.22em] uppercase text-solar-green-300/90">
        {doc.label}
      </div>
      <div className="mt-1 text-xs md:text-sm font-medium text-solar-green-50">
        {doc.title}
      </div>
      {doc.subtitle && (
        <div className="text-[0.65rem] md:text-xs text-solar-green-300/80 mt-0.5">
          {doc.subtitle}
        </div>
      )}
    </div>
  )

  if (isPlaceholder) {
    return content
  }

  return (
    <a href={doc.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${doc.title}`}>
      {content}
    </a>
  )
}

function InactiveNode() {
  return (
    <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full border border-solar-green-700/40 bg-solar-green-900/30 shadow-[0_0_10px_rgba(76,175,80,0.16)]" />
  )
}
