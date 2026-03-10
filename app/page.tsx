'use client'

import { useState, useEffect } from 'react'
import ChampAccessGate from '@/components/ChampAccessGate'
import ChampMotherboard from '@/components/ChampMotherboard'
import { isChampAccessUnlocked } from '@/components/ChampAccessGate'

export default function Home() {
  const [unlocked, setUnlocked] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setUnlocked(isChampAccessUnlocked())
  }, [])

  const handleSuccess = () => setUnlocked(true)
  const handleExit = () => setUnlocked(false)

  if (!mounted) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4 z-10">
        <div className="text-solar-green-500/60 text-sm">Loading…</div>
      </main>
    )
  }

  if (unlocked) {
    return <ChampMotherboard onExit={handleExit} />
  }

  return <ChampAccessGate onSuccess={handleSuccess} />
}
