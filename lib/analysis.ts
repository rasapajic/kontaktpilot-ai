export type AnalysisResult = {
  sender: string
  summary: string
  urgency: string
  deadline: string | null
  amount: string | null
  documentLanguage: string
  explanation: string
  nextStep: string
  scamRisk: string
  scamIndicators: string[]
  checklist: string[]
  confidenceExplanation: string | null
  importance: string
  qualityWarnings?: string[]
  scamWarning?: string | null
  extractedDate?: string | null
  daysRemaining?: number | null
  deadlineUrgency?: string | null
}

export const DEFAULT_ANALYSIS: AnalysisResult = {
  sender: 'Unknown sender',
  summary: 'The document could not be analysed completely.',
  urgency: 'medium',
  deadline: null,
  amount: null,
  documentLanguage: 'English',
  explanation:
    'This document is asking you to take action. It explains who sent it, what they want, and whether you need to reply or pay.',
  nextStep:
    'Review the document carefully, then pay or request a payment plan before the deadline.',
  scamRisk: 'low',
  scamIndicators: [],
  checklist: [
    'Review the sender and the amount',
    'Confirm the deadline',
    'Pay or request a payment plan',
    'Keep a copy of your response',
  ],
  confidenceExplanation: null,
  importance:
    'Ignoring the letter may lead to late fees, blocked services, or legal steps. Responding quickly keeps your options open.',
  qualityWarnings: [],
  scamWarning: null,
  extractedDate: null,
  daysRemaining: 7,
  deadlineUrgency: 'HIGH',
}

function formatDateFromDays(days: number) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000)

  return date.toISOString().slice(0, 10)
}

function parseExactDate(text: string): string | null {
  const normalized = text.replace(/\u00A0/g, ' ').trim()

  const isoMatch = normalized.match(
    /\b(\d{4})[-./](\d{1,2})[-./](\d{1,2})\b/
  )

  if (isoMatch) {
    const [, year, month, day] = isoMatch

    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
  }

  const dmyMatch = normalized.match(
    /\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/
  )

  if (dmyMatch) {
    let [, day, month, year] = dmyMatch

    if (year.length === 2) {
      year = `20${year}`
    }

    const parsed = new Date(
      `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
    )

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10)
    }
  }

  const monthNames: Record<string, string> = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',

  januar: '01',
februar: '02',
märz: '03',
maerz: '03',
mai: '05',
juni: '06',
juli: '07',
oktober: '10',
dezember: '12',
}

  const wordMatch = normalized.match(
    /\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|januar|februar|märz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember)\s+(\d{4})\b/i
  )

  if (wordMatch) {
    const day = wordMatch[1].padStart(2, '0')
    const month = monthNames[wordMatch[2].toLowerCase()] || '01'
    const year = wordMatch[3]

    return `${year}-${month}-${day}`
  }

  return null
}

function computeDaysRemaining(dateString: string | null): number | null {
  if (!dateString) return null

  const date = new Date(`${dateString}T00:00:00Z`)

  if (Number.isNaN(date.getTime())) return null

  const diff =
    date.getTime() - new Date().setHours(0, 0, 0, 0)

  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export function enhanceAnalysis(
  analysis: Partial<AnalysisResult>
): AnalysisResult {
  const deadline =
    analysis.deadline ||
    parseExactDate(analysis.summary || '') ||
    formatDateFromDays(7)

  const daysRemaining = computeDaysRemaining(deadline)

  let deadlineUrgency = 'LOW'

  if (daysRemaining !== null) {
    if (daysRemaining <= 3) {
      deadlineUrgency = 'HIGH'
    } else if (daysRemaining <= 7) {
      deadlineUrgency = 'MEDIUM'
    }
  }

  return {
    ...DEFAULT_ANALYSIS,
    ...analysis,
    deadline,
    extractedDate: deadline,
    daysRemaining,
    deadlineUrgency,
    qualityWarnings: analysis.qualityWarnings || [],
    scamWarning: analysis.scamWarning || null,
  }
}