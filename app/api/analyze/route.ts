import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import type { AnalysisResult } from '@/lib/analysis'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPT = `You are a calm, clear assistant helping everyday people understand official letters, bills, and documents. Use simple language for stressed non-native German speakers. Avoid legal jargon and do not sound robotic.

RULES:
- Respond ONLY with valid JSON and nothing else.
- Do not add markdown, extra formatting, or explanation outside the JSON.
- Use short, human sentences.
- Keep tone calm, kind, and reassuring.
- Return the explanation in the user's requested language.
- The explanation must feel natural, not like a checklist.
- Make consequences clear and realistic.
- If the user ignores the letter, say what may happen next.
- If the letter is urgent, explain why and what could follow.
- If you are not confident, say this clearly and recommend verifying important details.
- Do not hallucinate deadlines, amounts, or legal threats.
- When confidence is low, separate confirmed information, likely interpretation, and uncertain details.
- Separate the explanation into four simple ideas:
  1. what this is
  2. why they sent it
  3. what happens next
  4. what the user should do now

JSON schema:
{
  "sender": "The sender name or origin",
  "senderConfidence": "A number from 0 to 100 showing how confident the sender is real",
  "senderType": "Government | Court | Debt collection | Insurance | Landlord / housing | Utility company | Lawyer | Unknown",
  "documentLanguage": "The original language detected in the document",
  "category": "tax | rent | immigration | debt collection | insurance | telecom | legal | utilities | banking | other",
  "seriousness": "none | low | medium | high | scam",
  "urgencyScore": "A number from 0 to 100 showing how urgent this document is",
  "summary": "One calm sentence explaining the document.",
  "deadline": "A plain-language deadline or null. Use 'No confirmed deadline detected.' if no clear deadline exists.",
  "deadlineDate": "An exact date if extracted, or null.",
  "extractedDeadlineDate": "An exact deadline date in ISO format YYYY-MM-DD if clearly present, or null.",
  "daysRemaining": "Days until the exact deadline, or null if no exact date is confirmed.",
  "deadlineUrgency": "LOW | MEDIUM | HIGH | CRITICAL | NONE.",
  "nextStep": "A short sentence telling the user what to do next.",
  "scamRisk": "none | low | medium | high",
  "scamIndicators": ["Short suspicious detail 1", "Detail 2"],
  "qualityWarnings": ["blurry image", "partial document", "missing deadline section", "low text readability"],
  "checklist": ["Short practical step 1", "Step 2", "Step 3"],
  "explanation": "Four simple, calm sentences or short paragraphs in the user's language. Cover what this is, why it was sent, what happens next, and what to do now."
}

If the image contains no readable text, return a JSON object with a clear value for "summary" and set "sender" to "Unknown sender". Do not return an error string inside the JSON object.`

function isValidAnalysisResult(value: any): value is AnalysisResult {
  return Boolean(
    value &&
    typeof value.sender === 'string' &&
    typeof value.senderConfidence === 'number' &&
    typeof value.documentLanguage === 'string' &&
    ['tax', 'rent', 'immigration', 'debt collection', 'insurance', 'telecom', 'legal', 'utilities', 'banking', 'other'].includes(value.category) &&
    ['none', 'low', 'medium', 'high', 'scam'].includes(value.seriousness) &&
    typeof value.urgencyScore === 'number' &&
    typeof value.summary === 'string' &&
    (typeof value.senderType === 'string' && ['Government','Court','Debt collection','Insurance','Landlord / housing','Utility company','Lawyer','Unknown'].includes(value.senderType)) &&
    (typeof value.deadline === 'string' || value.deadline === null) &&
    (typeof value.deadlineDate === 'string' || value.deadlineDate === null || typeof value.deadlineDate === 'undefined') &&
    (typeof value.extractedDeadlineDate === 'string' || value.extractedDeadlineDate === null || typeof value.extractedDeadlineDate === 'undefined') &&
    (typeof value.daysRemaining === 'number' || value.daysRemaining === null || typeof value.daysRemaining === 'undefined') &&
    (typeof value.deadlineUrgency === 'string' || typeof value.deadlineUrgency === 'undefined') &&
    typeof value.nextStep === 'string' &&
    ['none', 'low', 'medium', 'high'].includes(value.scamRisk) &&
    Array.isArray(value.scamIndicators) &&
    value.scamIndicators.every((item: any) => typeof item === 'string') &&
    (typeof value.qualityWarnings === 'undefined' || (Array.isArray(value.qualityWarnings) && value.qualityWarnings.every((item: any) => typeof item === 'string'))) &&
    Array.isArray(value.checklist) &&
    value.checklist.every((item: any) => typeof item === 'string') &&
    (typeof value.confidenceExplanation === 'undefined' || typeof value.confidenceExplanation === 'string')
  )
}

function computeDaysRemaining(dateString: string | null): number | null {
  if (!dateString) return null
  const parsed = new Date(`${dateString}T00:00:00Z`)
  if (Number.isNaN(parsed.getTime())) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = parsed.getTime() - today.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

function deriveDeadlineUrgency(daysRemaining: number | null): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (daysRemaining === null) return 'NONE'
  if (daysRemaining < 0) return 'CRITICAL'
  if (daysRemaining <= 3) return 'CRITICAL'
  if (daysRemaining <= 7) return 'HIGH'
  if (daysRemaining <= 14) return 'MEDIUM'
  return 'LOW'
}

async function fileToDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer()
  const bytes = new Uint8Array(arrayBuffer)
  const base64 = Buffer.from(bytes).toString('base64')
  return `data:${file.type};base64,${base64}`
}

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key is not configured.' }, { status: 500 })
  }

  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const text = form.get('text')?.toString().trim() || ''
    const language = form.get('language')?.toString() || 'English'

    if (!file && !text) {
      return NextResponse.json({ error: 'Please upload an image or paste text.' }, { status: 400 })
    }

    const messages: any[] = [
      { role: 'system', content: SYSTEM_PROMPT },
    ]

    if (file) {
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Only image uploads are supported for vision analysis.' }, { status: 415 })
      }

      const imageDataUrl = await fileToDataUrl(file)
      messages.push({
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: imageDataUrl, detail: 'high' },
          },
          {
            type: 'text',
            text: `Analyze this document in a calm, plain style and reply in ${language}. Extract the sender, seriousness, summary, deadline, deadlineDate, extractedDeadlineDate, daysRemaining, deadlineUrgency, nextStep, scamRisk, qualityWarnings, and checklist. If the image or text looks incomplete, blurry, or missing pages, include a quality warning and avoid strong conclusions. If no clear deadline exists, set deadline to 'No confirmed deadline detected.', and set deadlineDate, extractedDeadlineDate and daysRemaining to null.`,
          },
        ],
      })
    } else {
      messages.push({
        role: 'user',
        content: `Analyze this text in a calm, plain style and reply in ${language}. Extract the sender, seriousness, summary, deadline, nextStep, scamRisk, and checklist.\n\n${text}`,
      })
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      temperature: 0.2,
      max_tokens: 1200,
      messages,
      response_format: { type: 'json_object' },
    })

    const content = response.choices?.[0]?.message?.content
    if (!content) {
      return NextResponse.json({ error: 'No response from OpenAI.' }, { status: 502 })
    }

    const result = JSON.parse(content)
    const extractedDeadlineDate = result.extractedDeadlineDate ?? result.deadlineDate ?? null
    const normalizedDaysRemaining = typeof result.daysRemaining === 'number' ? result.daysRemaining : computeDaysRemaining(extractedDeadlineDate)
    const normalizedDeadlineUrgency = result.deadlineUrgency ?? deriveDeadlineUrgency(normalizedDaysRemaining)
    const rawDeadline = typeof result.deadline === 'string' ? result.deadline : null
    const normalizedDeadline = rawDeadline && /no (trusted|confirmed) deadline|kein festes datum|kein bestätigtes datum/i.test(rawDeadline)
      ? 'No confirmed deadline detected.'
      : rawDeadline
    const normalizedResult = {
      ...result,
      senderType: result.senderType ?? 'Unknown',
      deadline: normalizedDeadline ?? (extractedDeadlineDate ? null : 'No confirmed deadline detected.'),
      extractedDeadlineDate,
      daysRemaining: normalizedDaysRemaining,
      deadlineUrgency: normalizedDeadlineUrgency,
    }

    if (!isValidAnalysisResult(normalizedResult)) {
      return NextResponse.json({ error: 'Invalid analysis result returned by OpenAI.' }, { status: 502 })
    }

    if (!normalizedResult.summary.trim()) {
      return NextResponse.json({ error: 'No readable text found in the uploaded image.' }, { status: 422 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('[Analyze API]', error)
    const message = error?.message || 'Something went wrong while analysing the image.'
    if (message.includes('timed out')) {
      return NextResponse.json({ error: 'OpenAI request timed out. Please try again.' }, { status: 504 })
    }
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
