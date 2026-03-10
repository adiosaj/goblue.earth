'use client'

import { useState, FormEvent } from 'react'
import { CHAMP_ACCESS_PASSWORD } from '@/lib/champ-documents'

const STORAGE_KEY = 'champAccessUnlocked'

export function setChampAccessUnlocked(value: boolean) {
  if (typeof window === 'undefined') return
  if (value) {
    sessionStorage.setItem(STORAGE_KEY, 'true')
  } else {
    sessionStorage.removeItem(STORAGE_KEY)
  }
}

export function isChampAccessUnlocked(): boolean {
  if (typeof window === 'undefined') return false
  return sessionStorage.getItem(STORAGE_KEY) === 'true'
}

interface ChampAccessGateProps {
  onSuccess: () => void
}

export default function ChampAccessGate({ onSuccess }: ChampAccessGateProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (password === CHAMP_ACCESS_PASSWORD) {
      setChampAccessUnlocked(true)
      onSuccess()
    } else {
      setError('Incorrect access code.')
    }
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 z-10">
      <div className="max-w-md mx-auto text-center space-y-8 animate-fade-in">
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-solar-green-50">
            Champ Access Protocol
          </h1>
          <p className="text-solar-green-300/90 text-sm md:text-base">
            This layer is reserved for confirmed GYC Champs 2026.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="champ-password" className="sr-only">
              Access code
            </label>
            <input
              id="champ-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Access code"
              className="w-full px-4 py-3 bg-solar-dark border border-solar-green-500/40 rounded-lg text-solar-green-50 placeholder-solar-green-500/50 focus:outline-none focus:ring-1 focus:ring-solar-gold-400 focus:border-solar-gold-400/50 transition-smooth"
              autoComplete="current-password"
              autoFocus
            />
          </div>
          <button
            type="submit"
            className="w-full px-6 py-3 bg-solar-green-600/90 hover:bg-solar-green-500 text-solar-green-50 font-medium rounded-lg transition-smooth glow-green focus-visible:outline-2 focus-visible:outline-solar-gold-400 focus-visible:outline-offset-2"
          >
            Enter System
          </button>
          {error && (
            <p className="text-sm text-solar-green-400/80" role="alert">
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  )
}
