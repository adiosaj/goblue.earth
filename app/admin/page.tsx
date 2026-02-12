'use client'

import { useState, useEffect } from 'react'
import { supabase, ChampEntry } from '@/lib/supabase'

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [entries, setEntries] = useState<ChampEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<ChampEntry | null>(null)
  const [filterArchetype, setFilterArchetype] = useState<string>('all')

  useEffect(() => {
    // Check if already authenticated (simple check)
    const auth = sessionStorage.getItem('admin_auth')
    if (auth === 'true') {
      setAuthenticated(true)
      loadEntries()
    }
  }, [])

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authenticated) {
          setAuthenticated(true)
          sessionStorage.setItem('admin_auth', 'true')
          loadEntries()
        } else {
          alert('Incorrect password')
        }
      } else {
        alert('Authentication failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      alert('Error during authentication')
    }
  }

  const loadEntries = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('champ_entries')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading entries:', error)
        alert('Error loading entries. Check console.')
      } else {
        setEntries(data || [])
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error loading entries.')
    } finally {
      setLoading(false)
    }
  }

  const exportCSV = () => {
    const headers = [
      'ID', 'Created At', 'First Name', 'Last Name', 'Age', 'Country', 'City', 'Timezone',
      'Email', 'LinkedIn', 'Identity', 'Scenario 1', 'Scenario 2', 'Scenario 3', 'Scenario 4', 'Scenario 5',
      'Shipped Text', 'Created Link', 'Project Text', 'Availability Hours', 'Led Team',
      'Handle Disagreement', 'Drains Most', 'Builder Score', 'Translator Score', 'Architect Score',
      'Archetype', 'Tier', 'Consent'
    ]

    const rows = filteredEntries.map(entry => [
      entry.id,
      entry.created_at,
      entry.first_name,
      entry.last_name,
      entry.age,
      entry.country,
      entry.city || '',
      entry.timezone,
      entry.email,
      entry.linkedin_url || '',
      entry.identity_choice,
      entry.scenario1,
      entry.scenario2,
      entry.scenario3,
      entry.scenario4,
      entry.scenario5,
      entry.shipped_text || '',
      entry.created_link || '',
      entry.project_text || '',
      entry.availability_hours,
      entry.led_team ? 'Yes' : 'No',
      entry.handle_disagreement,
      entry.drains_most,
      entry.builder_score,
      entry.translator_score,
      entry.architect_score,
      entry.archetype_label,
      entry.hidden_tier,
      entry.consent ? 'Yes' : 'No'
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `champ_entries_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const filteredEntries = filterArchetype === 'all'
    ? entries
    : entries.filter(e => e.archetype_label === filterArchetype)

  const uniqueArchetypes = Array.from(new Set(entries.map(e => e.archetype_label)))

  if (!authenticated) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-4 z-10">
        <div className="max-w-md mx-auto bg-solar-green-900/20 backdrop-blur-sm rounded-lg border border-solar-green-700/50 p-8 space-y-6">
          <h1 className="text-3xl font-light text-center">Admin Access</h1>
          <div>
            <label className="block text-solar-green-200 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              className="w-full p-3 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
              autoFocus
            />
          </div>
          <button
            onClick={handleLogin}
            className="w-full px-6 py-3 bg-gradient-to-r from-solar-green-600 to-solar-green-500 text-white rounded-lg transition-smooth hover:from-solar-green-500 hover:to-solar-green-400 glow-green focus-visible:outline-2 focus-visible:outline-solar-gold-400 focus-visible:outline-offset-2"
          >
            Login
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="relative min-h-screen py-12 px-4 z-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-light">
            <span className="bg-gradient-to-r from-solar-green-400 to-solar-gold-400 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <div className="flex gap-4">
            <button
              onClick={loadEntries}
              disabled={loading}
              className="px-4 py-2 border border-solar-green-700 text-solar-green-200 rounded-lg transition-smooth hover:border-solar-green-500 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
            <button
              onClick={exportCSV}
              className="px-4 py-2 bg-gradient-to-r from-solar-green-600 to-solar-green-500 text-white rounded-lg transition-smooth hover:from-solar-green-500 hover:to-solar-green-400 glow-green"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-solar-green-200 mb-2">Filter by Archetype</label>
          <select
            value={filterArchetype}
            onChange={(e) => setFilterArchetype(e.target.value)}
            className="p-3 bg-solar-green-900/20 border border-solar-green-700 rounded-lg text-solar-green-50 focus:border-solar-gold-400 focus:outline-none"
          >
            <option value="all">All</option>
            {uniqueArchetypes.map(arch => (
              <option key={arch} value={arch}>{arch}</option>
            ))}
          </select>
        </div>

        <div className="bg-solar-green-900/10 backdrop-blur-sm rounded-lg border border-solar-green-700/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-solar-green-900/30">
                <tr>
                  <th className="px-4 py-3 text-left text-solar-green-200 font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-solar-green-200 font-medium">Email</th>
                  <th className="px-4 py-3 text-left text-solar-green-200 font-medium">Country</th>
                  <th className="px-4 py-3 text-left text-solar-green-200 font-medium">Archetype</th>
                  <th className="px-4 py-3 text-left text-solar-green-200 font-medium">Tier</th>
                  <th className="px-4 py-3 text-left text-solar-green-200 font-medium">Availability</th>
                  <th className="px-4 py-3 text-left text-solar-green-200 font-medium">Created</th>
                  <th className="px-4 py-3 text-left text-solar-green-200 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry) => (
                  <tr
                    key={entry.id}
                    className="border-t border-solar-green-700/50 hover:bg-solar-green-900/20 transition-smooth"
                  >
                    <td className="px-4 py-3 text-solar-green-100">
                      {entry.first_name} {entry.last_name}
                    </td>
                    <td className="px-4 py-3 text-solar-green-200">{entry.email}</td>
                    <td className="px-4 py-3 text-solar-green-200">{entry.country}</td>
                    <td className="px-4 py-3 text-solar-green-200">{entry.archetype_label}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs ${
                        entry.hidden_tier === 'Tier1'
                          ? 'bg-solar-gold-400/20 text-solar-gold-300'
                          : entry.hidden_tier === 'Tier2'
                          ? 'bg-solar-green-400/20 text-solar-green-300'
                          : 'bg-solar-green-700/20 text-solar-green-400'
                      }`}>
                        {entry.hidden_tier}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-solar-green-200">{entry.availability_hours}h/mo</td>
                    <td className="px-4 py-3 text-solar-green-400/60 text-sm">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedEntry(entry)}
                        className="text-solar-gold-400 hover:text-solar-gold-300 transition-smooth"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-center text-solar-green-400/60 mt-6">
          Total entries: {filteredEntries.length}
        </p>

        {selectedEntry && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-solar-green-900/95 backdrop-blur-md rounded-lg border border-solar-green-700 max-w-3xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-light text-solar-gold-300">Entry Details</h2>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-solar-green-400 hover:text-solar-green-300"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-solar-green-400/60">Name</p>
                    <p className="text-solar-green-100">{selectedEntry.first_name} {selectedEntry.last_name}</p>
                  </div>
                  <div>
                    <p className="text-solar-green-400/60">Email</p>
                    <p className="text-solar-green-100">{selectedEntry.email}</p>
                  </div>
                  <div>
                    <p className="text-solar-green-400/60">Age</p>
                    <p className="text-solar-green-100">{selectedEntry.age}</p>
                  </div>
                  <div>
                    <p className="text-solar-green-400/60">Country</p>
                    <p className="text-solar-green-100">{selectedEntry.country}</p>
                  </div>
                  <div>
                    <p className="text-solar-green-400/60">Archetype</p>
                    <p className="text-solar-green-100">{selectedEntry.archetype_label}</p>
                  </div>
                  <div>
                    <p className="text-solar-green-400/60">Tier</p>
                    <p className="text-solar-green-100">{selectedEntry.hidden_tier}</p>
                  </div>
                </div>

                <div>
                  <p className="text-solar-green-400/60 mb-2">Scores</p>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-solar-green-300">Builder: {selectedEntry.builder_score}</p>
                    </div>
                    <div>
                      <p className="text-solar-green-300">Translator: {selectedEntry.translator_score}</p>
                    </div>
                    <div>
                      <p className="text-solar-green-300">Architect: {selectedEntry.architect_score}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-solar-green-400/60 mb-2">Scenarios</p>
                  <div className="space-y-2">
                    <p className="text-solar-green-200">Identity: {selectedEntry.identity_choice}</p>
                    <p className="text-solar-green-200">Scenario 1: {selectedEntry.scenario1}</p>
                    <p className="text-solar-green-200">Scenario 2: {selectedEntry.scenario2}</p>
                    <p className="text-solar-green-200">Scenario 3: {selectedEntry.scenario3}</p>
                    <p className="text-solar-green-200">Scenario 4: {selectedEntry.scenario4}</p>
                    <p className="text-solar-green-200">Scenario 5: {selectedEntry.scenario5}</p>
                  </div>
                </div>

                <div>
                  <p className="text-solar-green-400/60 mb-2">Shipped Text</p>
                  <p className="text-solar-green-100 whitespace-pre-wrap">{selectedEntry.shipped_text || 'N/A'}</p>
                </div>

                <div>
                  <p className="text-solar-green-400/60 mb-2">Capacity</p>
                  <div className="space-y-1">
                    <p className="text-solar-green-200">Availability: {selectedEntry.availability_hours} hours/month</p>
                    <p className="text-solar-green-200">Led Team: {selectedEntry.led_team ? 'Yes' : 'No'}</p>
                    <p className="text-solar-green-200">Handle Disagreement: {selectedEntry.handle_disagreement}</p>
                    <p className="text-solar-green-200">Drains Most: {selectedEntry.drains_most}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

