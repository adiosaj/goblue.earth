'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import TriangleGate from '@/components/TriangleGate'

type Stage = 'entry' | 'triangle' | 'governance'

export default function InitializePage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('entry')
  const [governanceAccepted, setGovernanceAccepted] = useState(false)

  const handleInitialize = () => {
    setStage('triangle')
  }

  const handleTriangleComplete = () => {
    setStage('governance')
  }

  const handleEnterMission = () => {
    if (governanceAccepted) {
      // Set calibration flag
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('systemCalibrated', 'true')
      }
      router.push('/mission')
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 z-10">
      <div className="max-w-2xl mx-auto w-full">
        {stage === 'entry' && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-light tracking-tight">
                <span className="bg-gradient-to-r from-solar-green-400 to-solar-gold-400 bg-clip-text text-transparent">
                  GYC Skills Pipeline
                </span>
              </h1>
              <p className="text-xl text-solar-green-300 font-light">
                Cohort 2026
              </p>
              <p className="text-lg text-solar-green-400/80 font-light">
                System Entry Protocol
              </p>
            </div>

            <p className="text-solar-green-300/70 text-sm max-w-md mx-auto leading-relaxed">
              Access requires structural calibration.
            </p>

            <div className="pt-8">
              <button
                onClick={handleInitialize}
                className="px-8 py-4 bg-gradient-to-r from-solar-green-600 to-solar-green-500 text-white rounded-lg font-medium transition-smooth hover:from-solar-green-500 hover:to-solar-green-400 glow-green focus-visible:outline-2 focus-visible:outline-solar-gold-400 focus-visible:outline-offset-2"
              >
                Initialize
              </button>
            </div>
          </div>
        )}

        {stage === 'triangle' && (
          <div className="bg-solar-green-900/10 backdrop-blur-sm rounded-lg border border-solar-green-700/50 p-8 md:p-12">
            <TriangleGate onComplete={handleTriangleComplete} />
          </div>
        )}

        {stage === 'governance' && (
          <div className="text-center space-y-8 animate-fade-in">
            <div className="space-y-6 max-w-lg mx-auto">
              <h2 className="text-3xl font-light text-solar-green-200">
                Governance Acknowledgment
              </h2>

              <div className="space-y-4 text-solar-green-300/80 leading-relaxed">
                <p>
                  This system operates through coordinated leadership.
                </p>
                <p>
                  Input is valued. Final decisions are structured.
                </p>
              </div>

              <div className="flex items-start justify-center space-x-3 pt-6">
                <input
                  type="checkbox"
                  id="governance"
                  checked={governanceAccepted}
                  onChange={(e) => setGovernanceAccepted(e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-solar-green-700 bg-solar-green-900/20 text-solar-gold-400 focus:ring-solar-gold-400"
                />
                <label
                  htmlFor="governance"
                  className="text-solar-green-200 text-sm cursor-pointer"
                >
                  I understand and accept this model.
                </label>
              </div>

              <div className="pt-6">
                <button
                  onClick={handleEnterMission}
                  disabled={!governanceAccepted}
                  className="px-8 py-4 bg-gradient-to-r from-solar-green-600 to-solar-green-500 text-white rounded-lg font-medium transition-smooth hover:from-solar-green-500 hover:to-solar-green-400 glow-green disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-solar-gold-400 focus-visible:outline-offset-2"
                >
                  Enter Mission
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

