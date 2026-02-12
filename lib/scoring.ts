import { ChampEntry } from './supabase'

export type Archetype = 'Builder' | 'Translator' | 'Architect'
export type HybridArchetype = 'Builder–Translator' | 'Builder–Architect' | 'Translator–Architect'

export interface Scores {
  builder: number
  translator: number
  architect: number
}

export interface QuizAnswers {
  identity: 'A' | 'B' | 'C'
  scenario1: 'A' | 'B' | 'C'
  scenario2: 'A' | 'B' | 'C'
  scenario3: 'A' | 'B' | 'C'
  scenario4: 'A' | 'B' | 'C'
  scenario5: 'A' | 'B' | 'C'
}

// Map choices to archetypes
const choiceToArchetype: Record<string, Archetype> = {
  'A': 'Builder',
  'B': 'Translator',
  'C': 'Architect',
}

export function calculateScores(answers: QuizAnswers): Scores {
  let builder = 0
  let translator = 0
  let architect = 0

  // Scenario 1
  const arch1 = choiceToArchetype[answers.scenario1]
  if (arch1 === 'Builder') builder += 1
  if (arch1 === 'Translator') translator += 1
  if (arch1 === 'Architect') architect += 1

  // Scenario 2
  const arch2 = choiceToArchetype[answers.scenario2]
  if (arch2 === 'Builder') builder += 1
  if (arch2 === 'Translator') translator += 1
  if (arch2 === 'Architect') architect += 1

  // Scenario 3
  const arch3 = choiceToArchetype[answers.scenario3]
  if (arch3 === 'Builder') builder += 1
  if (arch3 === 'Translator') translator += 1
  if (arch3 === 'Architect') architect += 1

  // Scenario 4 (weighted x1.5)
  const arch4 = choiceToArchetype[answers.scenario4]
  if (arch4 === 'Builder') builder += 1.5
  if (arch4 === 'Translator') translator += 1.5
  if (arch4 === 'Architect') architect += 1.5

  // Scenario 5
  const arch5 = choiceToArchetype[answers.scenario5]
  if (arch5 === 'Builder') builder += 1
  if (arch5 === 'Translator') translator += 1
  if (arch5 === 'Architect') architect += 1

  return { builder, translator, architect }
}

export function determineArchetype(scores: Scores): string {
  const { builder, translator, architect } = scores
  const sorted = [
    { name: 'Builder', score: builder },
    { name: 'Translator', score: translator },
    { name: 'Architect', score: architect },
  ].sort((a, b) => b.score - a.score)

  const top = sorted[0]
  const second = sorted[1]

  // Check for hybrid (within 0.5 difference)
  if (top.score - second.score <= 0.5) {
    const hybridName = [top.name, second.name].sort().join('–')
    return hybridName
  }

  return top.name
}

export function determineTier(
  scores: Scores,
  archetype: string,
  availabilityHours: number,
  shippedText: string | undefined,
  handleDisagreement: string
): 'Tier1' | 'Tier2' | 'OpenNetwork' {
  const primaryScore = Math.max(scores.builder, scores.translator, scores.architect)

  // Tier 1 requirements
  if (primaryScore >= 3.0 && 
      availabilityHours >= 6 && 
      shippedText && 
      shippedText.length >= 30) {
    
    // Leadership maturity check
    if (handleDisagreement === 'Avoid it') {
      return 'Tier2'
    }
    
    return 'Tier1'
  }

  // Tier 2: Has some signals but not Tier 1
  if (primaryScore >= 2.0 && availabilityHours >= 4) {
    return 'Tier2'
  }

  return 'OpenNetwork'
}

export function getTrackSuggestion(archetype: string): string {
  if (archetype.includes('Builder') && archetype.includes('Translator')) {
    return 'Green Jobs Pipeline / Training delivery / Governance & negotiation literacy / External communication'
  }
  if (archetype.includes('Builder') && archetype.includes('Architect')) {
    return 'Green Jobs Pipeline / Training delivery / Responsible AI & tech-for-nature / Resilience design / Fund-of-funds logic'
  }
  if (archetype.includes('Translator') && archetype.includes('Architect')) {
    return 'Governance & negotiation literacy / External communication / Responsible AI & tech-for-nature / Resilience design / Fund-of-funds logic'
  }
  if (archetype === 'Builder') {
    return 'Green Jobs Pipeline / Training delivery / Micro-governance pilots'
  }
  if (archetype === 'Translator') {
    return 'Governance & negotiation literacy / External communication'
  }
  if (archetype === 'Architect') {
    return 'Responsible AI & tech-for-nature / Resilience design / Fund-of-funds logic'
  }
  return 'Track assignment pending review'
}

export function getArchetypeDescription(archetype: string): string {
  if (archetype.includes('Builder') && archetype.includes('Translator')) {
    return 'You bridge vision and execution. You translate complex ideas into concrete actions while maintaining clarity across teams.'
  }
  if (archetype.includes('Builder') && archetype.includes('Architect')) {
    return 'You design systems and ship them. You see structural patterns and build solutions that scale.'
  }
  if (archetype.includes('Translator') && archetype.includes('Architect')) {
    return 'You map complexity and communicate it. You understand systems deeply and make them accessible to others.'
  }
  if (archetype === 'Builder') {
    return 'You ship. You turn ideas into reality through concrete deliverables and structured execution.'
  }
  if (archetype === 'Translator') {
    return 'You connect. You synthesize perspectives, mediate differences, and make complex ideas accessible.'
  }
  if (archetype === 'Architect') {
    return 'You design. You see systems, power dynamics, and long-term structures that others miss.'
  }
  return 'Your archetype is being mapped.'
}

