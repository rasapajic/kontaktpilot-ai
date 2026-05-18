export type SeriousnessLevel = 'none' | 'low' | 'medium' | 'high' | 'scam'
export type ScamRiskLevel = 'none' | 'low' | 'medium' | 'high'
export type DocumentCategory = 'tax' | 'rent' | 'immigration' | 'debt collection' | 'insurance' | 'telecom' | 'legal' | 'utilities' | 'banking' | 'other'
export type SenderType = 'Government' | 'Court' | 'Debt collection' | 'Insurance' | 'Landlord / housing' | 'Utility company' | 'Lawyer' | 'Unknown'

export interface AnalysisResult {
  sender: string
  senderConfidence: number
  senderType: SenderType
  documentLanguage: string
  category: DocumentCategory
  seriousness: SeriousnessLevel
  urgencyScore: number
  summary: string
  deadline: string | null
  deadlineDate: string | null
  extractedDeadlineDate: string | null
  daysRemaining: number | null
  deadlineUrgency: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  nextStep: string
  scamRisk: ScamRiskLevel
  scamIndicators: string[]
  checklist: string[]
  explanation: string
  importance: string
  confidenceExplanation?: string | null
  scamWarning?: string | null
}

const DEFAULT_ANALYSIS: AnalysisResult = {
  sender: 'Authority letter',
  senderConfidence: 80,
  senderType: 'Unknown',
  documentLanguage: 'English',
  category: 'legal',
  seriousness: 'high',
  urgencyScore: 75,
  summary: 'This letter asks you to act soon. It is written by an official sender and is not just informational.',
  deadline: '7 days from today',
  deadlineDate: null,
  extractedDeadlineDate: null,
  daysRemaining: 7,
  deadlineUrgency: 'HIGH',
  nextStep: 'Review the document carefully, then pay or request a payment plan before the deadline.',
  scamRisk: 'low',
  scamIndicators: [],
  checklist: [
    'Review the sender and the amount',
    'Confirm the deadline',
    'Pay or request a payment plan',
    'Keep a copy of your response',
  ],
  explanation: 'This document is asking you to take action. It explains who sent it, what they want, and whether you need to reply or pay. If you ignore it, you could get a reminder or extra fees. Right now, check the details and act before the deadline.',
  importance: 'Ignoring the letter may lead to late fees, blocked services, or legal steps. Responding quickly keeps your options open.',
  confidenceExplanation: null,
  qualityWarnings: [],
  scamWarning: null,
}

function formatDateFromDays(days: number) {
  const date = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  return date.toISOString().slice(0, 10)
}

function parseExactDate(text: string): string | null {
  const normalized = text.replace(/\u00A0/g, ' ').trim()
  const isoMatch = normalized.match(/\b(\d{4})[./-](\d{1,2})[./-](\d{1,2})\b/)
  if (isoMatch) {
    const year = isoMatch[1]
    const month = isoMatch[2].padStart(2, '0')
    const day = isoMatch[3].padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const dmyMatch = normalized.match(/\b(\d{1,2})[./-](\d{1,2})[./-](\d{2,4})\b/)
  if (dmyMatch) {
    let [_, day, month, year] = dmyMatch
    if (year.length === 2) year = `20${year}`
    const parsed = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString().slice(0, 10)
    }
  }

  const monthNames: Record<string, string> = {
    january: '01', february: '02', march: '03', april: '04', may: '05', june: '06', july: '07', august: '08', september: '09', october: '10', november: '11', december: '12',
    januar: '01', februar: '02', märz: '03', maerz: '03', april: '04', mai: '05', juni: '06', juli: '07', august: '08', september: '09', oktober: '10', november: '11', dezember: '12',
  }

  const wordMatch = normalized.match(/\b(\d{1,2})\s+(january|february|march|april|may|june|july|august|september|october|november|december|januar|februar|märz|maerz|april|mai|juni|juli|august|september|oktober|november|dezember)\s+(\d{4})\b/i)
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
  const diff = date.getTime() - new Date().setHours(0, 0, 0, 0)
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

function deriveDeadlineUrgency(daysRemaining: number | null): AnalysisResult['deadlineUrgency'] {
  if (daysRemaining === null) return 'NONE'
  if (daysRemaining < 0) return 'CRITICAL'
  if (daysRemaining <= 3) return 'CRITICAL'
  if (daysRemaining <= 7) return 'HIGH'
  if (daysRemaining <= 14) return 'MEDIUM'
  return 'LOW'
}

function detectCategory(normalized: string): AnalysisResult['category'] {
  if (/finanzamt|steuer|tax|abgaben/.test(normalized)) return 'tax'
  if (/miete|vermietung|wohn|hausverwaltung|rental/.test(normalized)) return 'rent'
  if (/aufenthalt|visa|immigration|asyl|einreise/.test(normalized)) return 'immigration'
  if (/mahnung|inkasso|debt collection|zahlungserinnerung|offener betrag/.test(normalized)) return 'debt collection'
  if (/versicherung|claim|schadenmeldung|premie|policy/.test(normalized)) return 'insurance'
  if (/telekom|internet|telefon|handy|mobile|dsl/.test(normalized)) return 'telecom'
  if (/anwalt|gericht|klage|recht|gesetz|juristisch/.test(normalized)) return 'legal'
  if (/strom|gas|wasser|utilities|energie|abrechnung/.test(normalized)) return 'utilities'
  if (/bank|konto|überweisung|kredit|giro|saldo/.test(normalized)) return 'banking'
  return 'other'
}

function detectSenderType(normalized: string): SenderType {
  if (/finanzamt|regierung|ministerium|amt|behörde|government|state|stadt|gemeinde|verwaltung/.test(normalized)) return 'Government'
  if (/gericht|court|landgericht|amtsgericht|verhandlung|urteil|judge|case number/.test(normalized)) return 'Court'
  if (/inkasso|debt collection|collection agency|mahnung|zahlungsaufforderung|cease and desist|debt collector/.test(normalized)) return 'Debt collection'
  if (/versicherung|insurance|claim|schadenmeldung|police claim|policy number|premie/.test(normalized)) return 'Insurance'
  if (/vermiet|hausverwaltung|landlord|mieter|miete|wohnungsverwaltung|rental|lease|tenant/.test(normalized)) return 'Landlord / housing'
  if (/strom|gas|wasser|utilities|energie|telekom|internet|telefon|electric bill|gas bill|water bill|utility/.test(normalized)) return 'Utility company'
  if (/anwalt|lawyer|attorney|notar|rechtsanwalt|kanzlei|law firm|avocat/.test(normalized)) return 'Lawyer'
  return 'Unknown'
}

function detectMailType(extractedText: string): Partial<AnalysisResult> {
  const normalized = extractedText.toLowerCase()
  const isGerman = /finanzamt|mahnung|zahlungsaufforderung|frist/.test(normalized)
  const scamMatches = normalized.match(/bankkonto|passwort|klicken sie|schnell handeln|dringend|sofortige zahlung|droh(en|ung)|ankündigung von rechtlichen schritten|follow [uo]p/i)
  const isScam = Boolean(scamMatches)
  const isUrgent = /frist|sofort|letzte mahnung|drohen|rechtsanwalt|zahlungsfrist|sofortige zahlung/.test(normalized)
  const category = detectCategory(normalized)
  const senderType = detectSenderType(normalized)
  const documentLanguage = isGerman ? 'Deutsch' : /arabisch|español|français|italiano|polski/.test(normalized) ? 'Other' : 'English'
  const deadlineDate = isUrgent ? formatDateFromDays(7) : formatDateFromDays(14)
  const extractedDeadlineDate = parseExactDate(extractedText) || (isUrgent ? deadlineDate : null)
  const daysRemaining = computeDaysRemaining(extractedDeadlineDate)
  const deadlineUrgency = deriveDeadlineUrgency(daysRemaining)
  const senderConfidence = isScam ? 30 : isUrgent ? 75 : 85
  const urgencyScore = isScam ? 95 : isUrgent ? 80 : 55
  const indicators = [] as string[]
  const qualityWarnings = [] as string[]

  if (isScam) indicators.push('Urgent payment demand', 'Unknown or unclear sender', 'Threat of legal action')
  if (/frist|deadline/.test(normalized) && !isScam) indicators.push('Specific deadline')
  if (/zahlung|invoice|amount/.test(normalized)) indicators.push('Payment request')
  if (extractedText.length < 180) qualityWarnings.push('partial document')
  if (!/(frist|deadline|due date|zahldatum|zahlung bis|bis zum)/.test(normalized) && /zahlung|amount|invoice|betrag|rechn|pay/.test(normalized)) {
    qualityWarnings.push('missing deadline section')
  }
  if (/(rückseite|auf der nächsten seite|weiter auf|continued on|see next page|fortsetzung)/.test(normalized)) {
    qualityWarnings.push('possible missing pages')
  }
  const weirdCharacters = extractedText.replace(/[A-Za-zÄÖÜäöüß0-9 \n\r\t\.,;:!\?\-%()]/g, '').length
  if (weirdCharacters / Math.max(1, extractedText.length) > 0.08) {
    qualityWarnings.push('low text readability')
  }
  if (qualityWarnings.length > 0 && !isScam) {
    qualityWarnings.push('important information may be unreadable')
  }

  if (isGerman) {
    return {
      sender: 'Finanzamt Wien',
      senderConfidence: isScam ? 40 : 85,
      senderType: 'Government',
      documentLanguage: 'Deutsch',
      category: 'tax',
      seriousness: isUrgent ? 'high' : 'medium',
      urgencyScore: isUrgent ? 82 : 60,
      summary: 'This appears to be a tax or government notice asking you to act quickly on an overdue amount.',
      deadline: isUrgent ? '7 days from today' : '14 days from today',
      deadlineDate,
      extractedDeadlineDate,
      daysRemaining,
      deadlineUrgency,
      nextStep: 'Check the amount, then pay or contact the sender to arrange a payment plan before the deadline.',
      checklist: [
        'Verify the sender information',
        'Compare the amount with your records',
        'Pay or ask for a payment plan',
        'Save a copy of your response',
      ],
      explanation: 'The letter is from a government authority and outlines a required response or payment.',
      importance: 'If you do not act, fees or collection steps could start. It is important to address this promptly.',
      confidenceExplanation: isScam ? 'Confirmed: the letter uses strong demand language. Likely: it is a scam warning or phishing attempt. Uncertain: the exact sender and amount details should be verified before you decide anything.' : null,
      qualityWarnings,
      scamRisk: isScam ? 'high' : 'medium',
      scamIndicators: indicators,
      scamWarning: isScam ? 'This message contains suspicious wording. Verify the sender before sharing sensitive details.' : null,
    }
  }

  if (isScam) {
    return {
      sender: 'Unknown sender',
      senderConfidence: 25,
      senderType: 'Unknown',
      documentLanguage: documentLanguage === 'Other' ? documentLanguage : 'English',
      category: 'other',
      seriousness: 'scam',
      urgencyScore: 96,
      summary: 'This letter looks suspicious and may be a scam attempt.',
      deadline: 'No trusted deadline',
      deadlineDate: null,
      extractedDeadlineDate: null,
      daysRemaining: null,
      deadlineUrgency: 'NONE',
      nextStep: 'Do not respond. Verify the sender independently before taking any action.',
      checklist: [
        'Do not click links or share information',
        'Confirm the sender by phone or official channels',
        'Do not pay until you verify the request',
      ],
      explanation: 'The document contains common scam patterns and asks for urgent action without a clear verified source.',
      importance: 'Scam letters can lead to identity theft or financial loss if handled without caution.',
      confidenceExplanation: 'Confirmed: the sender is unclear and the notice is very urgent. Likely: it is a scam attempt. Uncertain: the exact claims, amount, and deadline are not reliable here.',
      qualityWarnings,
      scamRisk: 'high',
      scamIndicators: indicators,
      scamWarning: 'This message looks suspicious. Verify the sender with a trusted contact before responding.',
    }
  }

  return {
    sender: 'Authority letter',
    senderConfidence: isUrgent ? 75 : 88,
    senderType,
    documentLanguage: documentLanguage === 'Other' ? documentLanguage : 'English',
    category,
    seriousness: isUrgent ? 'high' : 'medium',
    urgencyScore: isUrgent ? 80 : 60,
    summary: 'This message asks you to respond to an official request. It is important but probably legitimate.',
    deadline: isUrgent ? '7 days from today' : '14 days from today',
    deadlineDate,
    extractedDeadlineDate,
    daysRemaining,
    deadlineUrgency,
    nextStep: 'Review the document, pay attention to the deadline, and reply or pay as needed.',
    checklist: [
      'Read the request carefully',
      'Confirm the due date',
      'Pay or reply if required',
      'Keep a copy for your records',
    ],
    explanation: 'The text indicates an official request that needs a response or payment.',
    importance: 'Failing to act may result in penalties or follow-up notices, so it is best to handle it soon.',
    scamRisk: 'low',
    qualityWarnings,
    scamIndicators: indicators,
    scamWarning: null,
  }
}

export async function analyzeDocument(extractedText: string): Promise<AnalysisResult> {
  // In the future this will call OpenAI or another document insight service.
  // For now we return a structured mock response using the extracted text.
  const fallback = { ...DEFAULT_ANALYSIS }
  if (!extractedText.trim()) {
    return fallback
  }

  const detected = detectMailType(extractedText)

  return new Promise(resolve => {
    window.setTimeout(() => resolve({
      ...fallback,
      ...detected,
    }), 650)
  })
}
