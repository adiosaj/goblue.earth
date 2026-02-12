import Link from 'next/link'

export default function Home() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 z-10">
      <div className="max-w-2xl mx-auto text-center space-y-8">
        <h1 className="text-5xl md:text-7xl font-light tracking-tight">
          <span className="bg-gradient-to-r from-solar-green-400 to-solar-gold-400 bg-clip-text text-transparent">
            GYC Champ Signal Mapper
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-solar-green-200 font-light leading-relaxed">
          You're not applying.<br />
          You're being mapped.
        </p>

        <p className="text-solar-green-300/80 max-w-lg mx-auto leading-relaxed">
          A 5-scenario journey to classify your archetype: Builder, Translator, or Architect. 
          Your signals determine your track. Your capacity determines your tier.
        </p>

        <div className="pt-8">
          <Link
            href="/initialize"
            className="inline-block px-8 py-4 bg-gradient-to-r from-solar-green-600 to-solar-green-500 text-white rounded-lg font-medium transition-smooth hover:from-solar-green-500 hover:to-solar-green-400 glow-green focus-visible:outline-2 focus-visible:outline-solar-gold-400 focus-visible:outline-offset-2"
          >
            Start Mission
          </Link>
        </div>

        <p className="text-sm text-solar-green-400/60 pt-4">
          Estimated time: 8–10 minutes
        </p>
      </div>
    </main>
  )
}

