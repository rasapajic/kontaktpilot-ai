import type { AnalysisResult } from '@/lib/analysis'

export interface CaseHistoryEntry {
  id: string
  savedAt: string
  sender: string
  category: string
  urgencyScore: number
  deadline: string | null
  summary: string
  analysis: AnalysisResult
}

const STORAGE_KEY = 'kp_cases'

export function getCaseHistory(): CaseHistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
  } catch {
    return []
  }
}

export function saveCaseHistoryEntry(analysis: AnalysisResult) {
  if (typeof window === 'undefined') return
  const entry: CaseHistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
    sender: analysis.sender,
    category: analysis.scamRisk || 'general',
urgencyScore:
  analysis.deadlineUrgency === 'HIGH'
    ? 90
    : analysis.deadlineUrgency === 'MEDIUM'
    ? 60
    : 30,
    deadline: analysis.deadline,
    summary: analysis.summary,
    analysis,
  }

  const list = getCaseHistory()
  list.unshift(entry)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)))
}

export function deleteCaseHistoryEntry(id: string) {
  if (typeof window === 'undefined') return
  const list = getCaseHistory().filter(entry => entry.id !== id)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}
