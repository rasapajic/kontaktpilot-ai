import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY missing' }, { status: 500 })
    }
    const openai = new OpenAI({ apiKey })

    const formData = await req.formData()
    const language = (formData.get('language') as string) || 'English'
    const file     = formData.get('file') as File | null
    const text     = formData.get('text') as string | null

    const JSON_SCHEMA = `{
  "sender": "who sent this",
  "summary": "1-2 sentence plain language summary",
  "urgency": "none|low|medium|high|scam",
  "deadline": "deadline text or null",
  "documentLanguage": "language of the document",
  "explanation": "plain language explanation for the recipient",
  "nextStep": "the single most important thing to do",
  "scamRisk": "none|low|medium|high",
  "scamWarning": "warning text or null",
  "scamIndicators": [],
  "checklist": ["step1", "step2"],
  "extractedDate": "YYYY-MM-DD or null",
  "deadlineUrgency": "NONE|LOW|MEDIUM|HIGH|CRITICAL",
  "daysRemaining": null
}`

    let messages: any[]

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer())
      const base64 = buffer.toString('base64')
      const mime   = file.type || 'image/jpeg'
      messages = [{
        role: 'user',
        content: [
          {
            type: 'text',
            text: `You are an expert at reading official letters and documents.
Analyse this document and return ONLY valid JSON with these exact fields:
${JSON_SCHEMA}
Reply language for explanation and nextStep: ${language}`
          },
          {
            type: 'image_url',
            image_url: { url: `data:${mime};base64,${base64}`, detail: 'high' }
          }
        ]
      }]
    } else if (text) {
      messages = [
        {
          role: 'system',
          content: `You are an expert at reading official letters and documents.
Analyse the text and return ONLY valid JSON with these exact fields:
${JSON_SCHEMA}
Reply language for explanation and nextStep: ${language}`
        },
        { role: 'user', content: text }
      ]
    } else {
      return NextResponse.json({ error: 'No file or text provided' }, { status: 400 })
    }

    const model      = file ? 'gpt-4o' : 'gpt-4o-mini'
    const completion = await openai.chat.completions.create({
      model,
      temperature: 0.1,
      max_tokens:  1200,
      messages,
    })

    const raw   = completion.choices?.[0]?.message?.content || '{}'
    const clean = raw.replace(/```json|```/g, '').trim()

    let parsed: any
    try {
      parsed = JSON.parse(clean)
    } catch {
      parsed = {
        sender:           'Unknown',
        summary:          raw,
        urgency:          'low',
        deadline:         null,
        documentLanguage: language,
        explanation:      raw,
        nextStep:         'Please review this document manually.',
        scamRisk:         'none',
        scamWarning:      null,
        scamIndicators:   [],
        checklist:        [],
        extractedDate:    null,
        deadlineUrgency:  'NONE',
        daysRemaining:    null,
      }
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('[AI_ROUTE_ERROR]', error)
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 })
  }
}