'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function SuccessPage() {
  const [archetype, setArchetype] = useState<string>('')
  const [track, setTrack] = useState<string>('')
  const [description, setDescription] = useState<string>('')

  useEffect(() => {
    const arch = sessionStorage.getItem('archetype')
    const trk = sessionStorage.getItem('track')
    const desc = sessionStorage.getItem('description')
    
    if (arch) setArchetype(arch)
    if (trk) setTrack(trk)
    if (desc) setDescription(desc)
  }, [])

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 z-10">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <div className="text-6xl mb-4">✓</div>
        
        <h1 className="text-4xl md:text-6xl font-light">
          <span className="bg-gradient-to-r from-solar-green-400 to-solar-gold-400 bg-clip-text text-transparent">
            Mapping Complete
          </span>
        </h1>

        {archetype && (
          <div className="space-y-4 p-8 rounded-lg border-2 border-solar-gold-400/50 bg-solar-green-900/20 glow-gold">
            <h2 className="text-2xl font-light text-solar-gold-300">{archetype}</h2>
            {description && <p className="text-solar-green-200 leading-relaxed">{description}</p>}
            {track && (
              <div className="pt-4 border-t border-solar-green-700">
                <p className="text-sm text-solar-green-300/80 mb-2">Your Track:</p>
                <p className="text-solar-green-100">{track}</p>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 text-solar-green-200 leading-relaxed">
          <p>Your signals have been captured.</p>
          <p className="text-sm text-solar-green-400/60">
            Next steps will be communicated via email.
          </p>
        </div>

        <div className="pt-8">
          <Link
            href="/"
            className="inline-block px-8 py-4 border border-solar-green-700 text-solar-green-200 rounded-lg transition-smooth hover:border-solar-green-500 hover:text-solar-green-100 focus-visible:outline-2 focus-visible:outline-solar-gold-400 focus-visible:outline-offset-2"
          >
            Return Home
          </Link>
        </div>
      </div>
    </main>
  )
}

