'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { calculateScores, determineArchetype, determineTier, getTrackSuggestion, getArchetypeDescription } from '@/lib/scoring'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

type Choice = 'A' | 'B' | 'C'

interface QuizData {
  identity: Choice | null
  scenario1: Choice | null
  scenario2: Choice | null
  scenario3: Choice | null
  scenario4: Choice | null
  scenario5: Choice | null
  shippedText: string
  createdLink: string
  projectText: string
  availabilityHours: number
  ledTeam: boolean
  handleDisagreement: string
  drainsMost: string
  firstName: string
  lastName: string
  age: number
  country: string
  city: string
  timezone: string
  email: string
  linkedinUrl: string
  consent: boolean
}

const SCENARIOS = [
  {
    id: 1,
    prompt: "You are in a UN side event. Youth delegates disagree on strategy before entering a negotiation space. Time is limited. You:",
    options: [
      { value: 'A' as Choice, text: "Draft a 3-point position and move forward" },
      { value: 'B' as Choice, text: "Clarify everyone's arguments and synthesize them verbally" },
      { value: 'C' as Choice, text: "Step back and reframe the power dynamics of the negotiation" },
    ],
  },
  {
    id: 2,
    prompt: "Midway through a global training cohort, engagement drops. You:",
    options: [
      { value: 'A' as Choice, text: "Redesign session structure and introduce concrete deliverables" },
      { value: 'B' as Choice, text: "Create a narrative recap video explaining why the work matters" },
      { value: 'C' as Choice, text: "Analyze systemic reasons behind engagement behavior" },
    ],
  },
  {
    id: 3,
    prompt: "A donor wants measurable outputs quickly. The team wants systemic depth. You:",
    options: [
      { value: 'A' as Choice, text: "Propose a pilot project with clear metrics" },
      { value: 'B' as Choice, text: "Translate systemic value into language funders understand" },
      { value: 'C' as Choice, text: "Redesign the funding structure to align incentives long-term" },
    ],
  },
  {
    id: 4,
    prompt: "You disagree with a strategic decision made by the Chair. You:",
    options: [
      { value: 'A' as Choice, text: "Deliver your input clearly, then execute regardless" },
      { value: 'B' as Choice, text: "Request clarification dialogue to understand the rationale" },
      { value: 'C' as Choice, text: "Suggest an alternative governance mechanism" },
    ],
  },
  {
    id: 5,
    prompt: "Your country team wants to launch a GYC initiative. There is limited funding and high enthusiasm. You:",
    options: [
      { value: 'A' as Choice, text: "Start small, ship one concrete action within 30 days" },
      { value: 'B' as Choice, text: "Host a public session explaining the Avocado Framework" },
      { value: 'C' as Choice, text: "Map regional ecosystem actors before launching" },
    ],
  },
]

export default function MissionPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [accessChecked, setAccessChecked] = useState(false)
  const [data, setData] = useState<QuizData>({
    identity: null,
    scenario1: null,
    scenario2: null,
    scenario3: null,
    scenario4: null,
    scenario5: null,
    shippedText: '',
    createdLink: '',
    projectText: '',
    availabilityHours: 6,
    ledTeam: false,
    handleDisagreement: '',
    drainsMost: '',
    firstName: '',
    lastName: '',
    age: 25,
    country: '',
    city: '',
    timezone: '',
    email: '',
    linkedinUrl: '',
    consent: false,
  })

  const totalSteps = 9

  // Access guard: check for system calibration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const calibrated = sessionStorage.getItem('systemCalibrated')
      if (calibrated !== 'true') {
        router.push('/initialize')
        return
      }
      setAccessChecked(true)
    }
  }, [router])

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
      window.scrollTo(0, 0)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      window.scrollTo(0, 0)
    }
  }

  const handleSubmit = async () => {
    if (!data.consent) {
      alert('Please provide consent to continue.')
      return
    }

    setSubmitting(true)

    try {
      // Calculate scores
      const scores = calculateScores({
        identity: data.identity!,
        scenario1: data.scenario1!,
        scenario2: data.scenario2!,
        scenario3: data.scenario3!,
        scenario4: data.scenario4!,
        scenario5: data.scenario5!,
      })

      const archetype = determineArchetype(scores)
      const tier = determineTier(
        scores,
        archetype,
        data.availabilityHours,
        data.shippedText,
        data.handleDisagreement
      )

      // Save to database
      const entry = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        first_name: data.firstName,
        last_name: data.lastName,
        age: data.age,
        country: data.country,
        city: data.city || null,
        timezone: data.timezone,
        email: data.email,
        linkedin_url: data.linkedinUrl || null,
        identity_choice: data.identity!,
        scenario1: data.scenario1!,
        scenario2: data.scenario2!,
        scenario3: data.scenario3!,
        scenario4: data.scenario4!,
        scenario5: data.scenario5!,
        shipped_text: data.shippedText || null,
        created_link: data.createdLink || null,
        project_text: data.projectText || null,
        availability_hours: data.availabilityHours,
        led_team: data.ledTeam,
        handle_disagreement: data.handleDisagreement,
        drains_most: data.drainsMost,
        builder_score: scores.builder,
        translator_score: scores.translator,
        architect_score: scores.architect,
        archetype_label: archetype,
        hidden_tier: tier,
        consent: data.consent,
      }

      // Try to save to database (skip if Supabase not configured)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
      
      // DIAGNOSTIC: Log environment variable status
      console.log('🔍 Mission Page Environment Check:', {
        hasUrl: !!supabaseUrl,
        urlLength: supabaseUrl.length,
        urlPreview: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'MISSING',
        hasKey: !!supabaseAnonKey,
        keyLength: supabaseAnonKey.length,
        keyPreview: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'MISSING',
      })
      
      const isTestMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')
      
      if (isTestMode) {
        console.warn('⚠️ Running in test mode. Supabase URL:', supabaseUrl || 'MISSING', '| Key:', supabaseAnonKey ? 'PRESENT' : 'MISSING')
      }
      
      if (!isTestMode) {
        // DIAGNOSTIC: Log the full payload being sent
        console.log('📤 Supabase insert payload:', JSON.stringify(entry, null, 2))
        console.log('📤 Payload keys:', Object.keys(entry))
        console.log('📤 Payload values check:', {
          firstName: data.firstName,
          lastName: data.lastName,
          age: data.age,
          country: data.country,
          timezone: data.timezone,
          email: data.email,
          identity: data.identity,
          scenario1: data.scenario1,
          scenario2: data.scenario2,
          scenario3: data.scenario3,
          scenario4: data.scenario4,
          scenario5: data.scenario5,
          availabilityHours: data.availabilityHours,
          ledTeam: data.ledTeam,
          handleDisagreement: data.handleDisagreement,
          drainsMost: data.drainsMost,
          consent: data.consent,
        })

        const { data: insertData, error } = await supabase.from('champ_entries').insert([entry])

        if (error) {
          // DIAGNOSTIC: Log full Supabase error object
          console.error('❌ Supabase error object:', error)
          console.error('❌ Supabase error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          })
          console.error('❌ Full error JSON:', JSON.stringify(error, null, 2))
          
          // DIAGNOSTIC: Compare payload against schema requirements
          const requiredFields = [
            'first_name', 'last_name', 'age', 'country', 'timezone', 'email',
            'identity_choice', 'scenario1', 'scenario2', 'scenario3', 'scenario4', 'scenario5',
            'availability_hours', 'led_team', 'handle_disagreement', 'drains_most',
            'builder_score', 'translator_score', 'architect_score', 'archetype_label', 'hidden_tier',
            'consent'
          ]
          
          const missingFields = requiredFields.filter(field => (entry as any)[field] === undefined || (entry as any)[field] === null)
          const nullFields = Object.entries(entry)
            .filter(([key, value]) => requiredFields.includes(key) && (value === null || value === undefined))
            .map(([key]) => key)
          
          console.error('❌ Missing required fields:', missingFields)
          console.error('❌ Null/undefined required fields:', nullFields)
          console.error('❌ Entry object check:', entry)
          
          alert(`Error saving your response: ${error.message || 'Unknown error'}. Check console for details.`)
          setSubmitting(false)
          return
        }
        
        // DIAGNOSTIC: Log successful insert
        console.log('✅ Insert successful:', insertData)
      } else {
        // Test mode - log to console instead
        console.log('🧪 Test mode - Entry data:', entry)
        console.log('🧪 Archetype:', archetype, '| Tier:', tier)
      }

      // Store archetype in sessionStorage for success page
      sessionStorage.setItem('archetype', archetype)
      sessionStorage.setItem('track', getTrackSuggestion(archetype))
      sessionStorage.setItem('description', getArchetypeDescription(archetype))

      router.push('/success')
    } catch (error) {
      console.error('Error:', error)
      alert('An error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-light mb-6">Identity Activation</h2>
            <p className="text-solar-green-200 mb-8">How do you see yourself in this work?</p>
            <div className="space-y-4">
              {[
                { value: 'A' as Choice, text: 'I build things that matter' },
                { value: 'B' as Choice, text: 'I connect people and ideas' },
                { value: 'C' as Choice, text: 'I design systems and structures' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setData({ ...data, identity: option.value })}
                  className={`w-full text-left p-6 rounded-lg border-2 transition-smooth ${
                    data.identity === option.value
                      ? 'border-solar-gold-400 bg-solar-green-900/30 glow-gold'
                      : 'border-solar-green-700 hover:border-solar-green-500'
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        )

      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        const scenarioIndex = step - 2
        const scenario = SCENARIOS[scenarioIndex]
        const scenarioKey = `scenario${scenario.id}` as keyof QuizData
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-light mb-6">Scenario {scenario.id}</h2>
            <p className="text-lg text-solar-green-200 mb-8 leading-relaxed">{scenario.prompt}</p>
            <div className="space-y-4">
              {scenario.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setData({ ...data, [scenarioKey]: option.value })}
                  className={`w-full text-left p-6 rounded-lg border-2 transition-smooth ${
                    data[scenarioKey] === option.value
                      ? 'border-solar-gold-400 bg-solar-green-900/30 glow-gold'
                      : 'border-solar-green-700 hover:border-solar-green-500'
                  }`}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-light mb-6">Skill Signals</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-solar-green-200 mb-2">
                  What have you shipped in the last 6 months? *
                </label>
                <textarea
                  value={data.shippedText}
                  onChange={(e) => setData({ ...data, shippedText: e.target.value })}
                  maxLength={600}
                  rows={4}
                  className="w-full p-4 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
                  placeholder="Describe concrete deliverables, projects, or outcomes..."
                />
                <p className="text-sm text-solar-green-400/60 mt-1">{data.shippedText.length}/600</p>
              </div>
              <div>
                <label className="block text-solar-green-200 mb-2">
                  Link something you created (optional)
                </label>
                <input
                  type="url"
                  value={data.createdLink}
                  onChange={(e) => setData({ ...data, createdLink: e.target.value })}
                  className="w-full p-4 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-solar-green-200 mb-2">
                  Describe one project you helped complete (optional)
                </label>
                <textarea
                  value={data.projectText}
                  onChange={(e) => setData({ ...data, projectText: e.target.value })}
                  maxLength={400}
                  rows={3}
                  className="w-full p-4 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
                  placeholder="Brief description..."
                />
                <p className="text-sm text-solar-green-400/60 mt-1">{data.projectText.length}/400</p>
              </div>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-light mb-6">Capacity & Stability Check</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-solar-green-200 mb-2">
                  Availability (hours/month) *
                </label>
                <select
                  value={data.availabilityHours}
                  onChange={(e) => setData({ ...data, availabilityHours: Number(e.target.value) })}
                  className="w-full p-4 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
                >
                  {[2, 4, 6, 8, 10, 15, 20].map((hours) => (
                    <option key={hours} value={hours} className="bg-solar-dark">
                      {hours} hours/month
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.ledTeam}
                    onChange={(e) => setData({ ...data, ledTeam: e.target.checked })}
                    className="w-5 h-5 rounded border-solar-green-700 bg-solar-green-900/20 text-solar-gold-400 focus:ring-solar-gold-400"
                  />
                  <span className="text-solar-green-200">Have you led a team before?</span>
                </label>
              </div>
              <div>
                <label className="block text-solar-green-200 mb-2">
                  How do you handle disagreement? *
                </label>
                <div className="space-y-3">
                  {['Avoid it', 'Mediate it', 'Redesign structure around it'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setData({ ...data, handleDisagreement: option })}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-smooth ${
                        data.handleDisagreement === option
                          ? 'border-solar-gold-400 bg-solar-green-900/30 glow-gold'
                          : 'border-solar-green-700 hover:border-solar-green-500'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-solar-green-200 mb-2">
                  What drains you most? *
                </label>
                <div className="space-y-3">
                  {['Endless talk', 'Public exposure', 'Slow progress', 'Chaos'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setData({ ...data, drainsMost: option })}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-smooth ${
                        data.drainsMost === option
                          ? 'border-solar-gold-400 bg-solar-green-900/30 glow-gold'
                          : 'border-solar-green-700 hover:border-solar-green-500'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 9:
        const scores = calculateScores({
          identity: data.identity!,
          scenario1: data.scenario1!,
          scenario2: data.scenario2!,
          scenario3: data.scenario3!,
          scenario4: data.scenario4!,
          scenario5: data.scenario5!,
        })
        const archetype = determineArchetype(scores)
        const track = getTrackSuggestion(archetype)
        const description = getArchetypeDescription(archetype)

        return (
          <div className="space-y-8">
            <h2 className="text-4xl font-light mb-6 text-center">
              <span className="bg-gradient-to-r from-solar-green-400 to-solar-gold-400 bg-clip-text text-transparent">
                Archetype Revealed
              </span>
            </h2>
            
            <div className="text-center space-y-6 p-8 rounded-lg border-2 border-solar-gold-400/50 bg-solar-green-900/20 glow-gold">
              <h3 className="text-3xl font-light text-solar-gold-300">{archetype}</h3>
              <p className="text-lg text-solar-green-200 leading-relaxed">{description}</p>
              <div className="pt-4 border-t border-solar-green-700">
                <p className="text-sm text-solar-green-300/80 mb-2">Suggested Track:</p>
                <p className="text-solar-green-100">{track}</p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-2xl font-light">Identity Data</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-solar-green-200 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={data.firstName}
                    onChange={(e) => setData({ ...data, firstName: e.target.value })}
                    className="w-full p-3 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-solar-green-200 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={data.lastName}
                    onChange={(e) => setData({ ...data, lastName: e.target.value })}
                    className="w-full p-3 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-solar-green-200 mb-2">Age *</label>
                  <input
                    type="number"
                    value={data.age}
                    onChange={(e) => setData({ ...data, age: Number(e.target.value) })}
                    min={18}
                    max={100}
                    className="w-full p-3 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
                    required
                  />
                  {data.age < 20 || data.age > 32 ? (
                    <p className="text-sm text-solar-gold-400 mt-1">Note: Typical range is 20–32</p>
                  ) : null}
                </div>
                <div>
                  <label className="block text-solar-green-200 mb-2">Country *</label>
                  <input
                    type="text"
                    value={data.country}
                    onChange={(e) => setData({ ...data, country: e.target.value })}
                    className="w-full p-3 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-solar-green-200 mb-2">City (optional)</label>
                  <input
                    type="text"
                    value={data.city}
                    onChange={(e) => setData({ ...data, city: e.target.value })}
                    className="w-full p-3 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-solar-green-200 mb-2">Timezone *</label>
                  <input
                    type="text"
                    value={data.timezone}
                    onChange={(e) => setData({ ...data, timezone: e.target.value })}
                    placeholder="e.g., UTC+1, EST, PST"
                    className="w-full p-3 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-solar-green-200 mb-2">Email *</label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => setData({ ...data, email: e.target.value })}
                    className="w-full p-3 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-solar-green-200 mb-2">LinkedIn URL (optional)</label>
                  <input
                    type="url"
                    value={data.linkedinUrl}
                    onChange={(e) => setData({ ...data, linkedinUrl: e.target.value })}
                    placeholder="https://linkedin.com/in/..."
                    className="w-full p-3 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex items-start space-x-3 pt-4">
                <input
                  type="checkbox"
                  id="consent"
                  checked={data.consent}
                  onChange={(e) => setData({ ...data, consent: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-solar-green-700 bg-solar-green-900/20 text-solar-gold-400 focus:ring-solar-gold-400"
                  required
                />
                <label htmlFor="consent" className="text-solar-green-200 text-sm">
                  I consent to my data being stored and used for GYC Champ Signal Mapper purposes. *
                </label>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={handleSubmit}
                disabled={submitting || !data.consent || !data.firstName || !data.lastName || !data.email || !data.country || !data.timezone}
                className="w-full px-8 py-4 bg-gradient-to-r from-solar-green-600 to-solar-green-500 text-white rounded-lg font-medium transition-smooth hover:from-solar-green-500 hover:to-solar-green-400 glow-green disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-solar-gold-400 focus-visible:outline-offset-2"
              >
                {submitting ? 'Submitting...' : 'Unlock & Submit'}
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return data.identity !== null
      case 2:
        return data.scenario1 !== null
      case 3:
        return data.scenario2 !== null
      case 4:
        return data.scenario3 !== null
      case 5:
        return data.scenario4 !== null
      case 6:
        return data.scenario5 !== null
      case 7:
        return data.shippedText.length >= 30
      case 8:
        return data.handleDisagreement !== '' && data.drainsMost !== ''
      case 9:
        return data.consent && data.firstName && data.lastName && data.email && data.country && data.timezone
      default:
        return false
    }
  }

  // Show nothing until access is verified
  if (!accessChecked) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4 z-10">
        <div className="text-solar-green-300">Verifying access...</div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen py-12 px-4 z-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-solar-green-400/60">Level {step}/{totalSteps}</span>
            <span className="text-sm text-solar-green-400/60">{Math.round((step / totalSteps) * 100)}%</span>
          </div>
          <div className="w-full h-2 bg-solar-green-900/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-solar-green-500 to-solar-gold-400 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-solar-green-900/10 backdrop-blur-sm rounded-lg border border-solar-green-700/50 p-8 md:p-12">
          {renderStep()}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            disabled={step === 1}
            className="px-6 py-3 border border-solar-green-700 text-solar-green-200 rounded-lg transition-smooth hover:border-solar-green-500 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-solar-gold-400 focus-visible:outline-offset-2"
          >
            Back
          </button>
          {step < totalSteps && (
            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="px-6 py-3 bg-gradient-to-r from-solar-green-600 to-solar-green-500 text-white rounded-lg transition-smooth hover:from-solar-green-500 hover:to-solar-green-400 glow-green disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-solar-gold-400 focus-visible:outline-offset-2"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </main>
  )
}

