'use client'

import { CHAMP_DOCUMENTS } from '@/lib/champ-documents'
import { setChampAccessUnlocked } from './ChampAccessGate'

interface ChampMotherboardProps {
  onExit?: () => void
}

export default function ChampMotherboard({ onExit }: ChampMotherboardProps) {
  const handleExit = () => {
    setChampAccessUnlocked(false)
    onExit?.()
  }

  return (
    <main className="relative min-h-screen px-4 py-8 md:py-12 z-10">
      <div className="max-w-4xl mx-auto space-y-8 md:space-y-10 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-solar-green-50">
            GYC 2026 // Year of the Sky
          </h1>
          <p className="text-solar-gold-400/90 text-lg md:text-xl">
            Read. Align. Sign. Activate.
          </p>
        </div>

        {/* Instruction block */}
        <div className="max-w-xl mx-auto text-center space-y-4">
          <p className="text-solar-green-200/90 text-sm md:text-base leading-relaxed">
            Read the first two documents carefully. Sign the Champ Agreement.
            Then move into Mission 01, where your first activation task is waiting.
          </p>
          <p className="text-solar-green-400/70 text-xs">
            Access to this layer is limited to confirmed GYC Champs 2026.
          </p>
          <p className="text-solar-green-500/60 text-xs">
            Do not share this access layer publicly.
          </p>
        </div>

        {/* Document nodes — motherboard layout */}
        <div className="relative">
          {/* Desktop: 2x2 grid with connectors (node order: 0 top-left, 1 top-right, 2 bottom-left, 3 bottom-right) */}
          <div className="hidden md:block relative min-h-[320px]">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden
            >
              <defs>
                <linearGradient id="connector-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(76, 175, 80, 0.35)" />
                  <stop offset="100%" stopColor="rgba(249, 168, 37, 0.35)" />
                </linearGradient>
              </defs>
              {/* Rectangle connecting the four node centers */}
              <path d="M 25 25 L 75 25 L 75 75 L 25 75 Z" fill="none" stroke="url(#connector-gradient)" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.7" />
            </svg>
            <div className="grid grid-cols-2 gap-6 md:gap-8 relative">
              {CHAMP_DOCUMENTS.map((doc, i) => (
                <NodeCard key={doc.title} doc={doc} index={i} isMissionOne={i === 3} />
              ))}
            </div>
          </div>

          {/* Mobile: vertical stack with step connectors */}
          <div className="md:hidden space-y-0">
            {CHAMP_DOCUMENTS.map((doc, i) => (
              <div key={doc.title} className="flex flex-col items-center">
                <NodeCard doc={doc} index={i} isMissionOne={i === 3} />
                {i < CHAMP_DOCUMENTS.length - 1 && (
                  <div className="w-px h-6 bg-solar-green-500/40 my-1" aria-hidden />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Exit system */}
        {onExit && (
          <div className="text-center pt-4">
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

function NodeCard({
  doc,
  index,
  isMissionOne,
}: {
  doc: { title: string; label: string; url: string }
  index: number
  isMissionOne: boolean
}) {
  const isPlaceholder = doc.url === '#'
  return (
    <a
      href={isPlaceholder ? undefined : doc.url}
      target={isPlaceholder ? undefined : '_blank'}
      rel={isPlaceholder ? undefined : 'noopener noreferrer'}
      className={`
        group block p-5 md:p-6 rounded-lg border text-left transition-smooth motherboard-card-pulse
        ${isMissionOne
          ? 'border-solar-gold-400/50 bg-solar-green-900/10 hover:border-solar-gold-400 hover:shadow-[0_0_24px_rgba(249,168,37,0.15)]'
          : 'border-solar-green-500/30 bg-solar-dark/80 hover:border-solar-green-400/50 hover:shadow-[0_0_20px_rgba(76,175,80,0.12)]'
        }
        ${isPlaceholder ? 'pointer-events-none opacity-90' : 'cursor-pointer'}
      `}
      onClick={isPlaceholder ? (e) => e.preventDefault() : undefined}
      aria-label={isPlaceholder ? `${doc.title} (link not yet available)` : `Open ${doc.title}`}
    >
      <span className="text-xs font-medium text-solar-green-500/90 uppercase tracking-wider">
        {doc.label}
      </span>
      <h3 className="mt-1 text-lg md:text-xl font-medium text-solar-green-50 group-hover:text-solar-green-100 transition-smooth">
        {doc.title}
      </h3>
      {isMissionOne && (
        <span className="inline-block mt-2 text-xs text-solar-gold-400/90">Next step</span>
      )}
    </a>
  )
}
