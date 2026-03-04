'use client'

import { useState, useEffect } from 'react'

const START_AT = new Date('2026-03-04T07:30:00Z').getTime()
const DURATION_MS = 36 * 60 * 60 * 1000
const END_AT = new Date('2026-03-05T19:30:00Z').getTime() // START_AT + DURATION_MS
const END_AT_UTC_STRING = '2026-03-05T19:30:00.000Z'

function formatHMS(ms: number): string {
  if (ms <= 0) return '00:00:00'
  const totalSeconds = Math.floor(ms / 1000)
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [h, m, s].map((n) => n.toString().padStart(2, '0')).join(':')
}

type Phase = 'before' | 'during' | 'after'

export default function GlobalCountdownGate() {
  const [phase, setPhase] = useState<Phase>('before')
  const [countdown, setCountdown] = useState('00:00:00')

  useEffect(() => {
    const tick = () => {
      const now = Date.now()
      if (now < START_AT) {
        setPhase('before')
        setCountdown(formatHMS(START_AT - now))
      } else if (now < END_AT) {
        setPhase('during')
        setCountdown(formatHMS(END_AT - now))
      } else {
        setPhase('after')
        setCountdown('00:00:00')
      }
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  const bannerLabel =
    phase === 'before'
      ? 'Calibration opens in:'
      : phase === 'during'
        ? 'Calibration closes in:'
        : 'Calibration closed'

  return (
    <>
      {/* Fixed banner on every page */}
      <div
        className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-center border-b border-solar-green-500/30 bg-solar-dark/95 px-4 py-2 text-center text-sm text-solar-green-100 shadow-lg backdrop-blur-sm"
        aria-live="polite"
      >
        <span className="font-medium text-solar-green-200">{bannerLabel}</span>
        <span className="ml-2 font-mono tabular-nums text-solar-gold-400">
          {countdown}
        </span>
      </div>

      {/* Full-screen lock overlay when expired */}
      {phase === 'after' && (
        <div
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-solar-dark/98 px-6 text-solar-green-50"
          role="alert"
          aria-live="assertive"
        >
          <p className="max-w-md text-center text-lg italic leading-relaxed text-solar-green-200 md:text-xl">
            &ldquo;Somewhere, something incredible is waiting to be known.&rdquo;
          </p>
          <p className="mt-4 text-solar-gold-400">— Carl Sagan</p>
          <p className="mt-8 text-xl font-medium text-solar-green-100">
            Calibration window closed.
          </p>
          <p className="mt-2 font-mono text-sm text-solar-green-300/90">
            {END_AT_UTC_STRING} (UTC)
          </p>
        </div>
      )}
    </>
  )
}
