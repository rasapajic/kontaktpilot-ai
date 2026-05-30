import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SYSTEM = `
You are a calm, warm, human assistant helping everyday people understand official letters, emails, bills, and documents.

YOUR TONE:
- Calm and reassuring
- Simple and human
- Short sentences. Plain words. Never jargon.
- Like a trusted friend explaining something, not a lawyer

BAD:
"This document constitutes a formal collection notice pursuant to §286 BGB."

GOOD:
"This is a payment warning. You owe money and need to act within 7 days."

BAD:
"The aforementioned missive necessitates an immediate response."

GOOD:
"This letter needs a reply soon."

GOALS:
- Explain what the document means
- Explain what the person should do next
- Warn about scams if needed
- Keep answers short and easy to understand
- Never invent facts
- If unsure, say so clearly
`

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'OPENAI_API_KEY missing',
        },
        {
          status: 500,
        }
      )
    }

    const openai = new OpenAI({
      apiKey,
    })

    const body = await req.json()

    const text = body?.text || ''

    if (!text) {
      return NextResponse.json(
        {
          error: 'Missing text',
        },
        {
          status: 400,
        }
      )
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      temperature: 0.3,
      max_tokens: 800,
      messages: [
        {
          role: 'system',
          content: SYSTEM,
        },
        {
          role: 'user',
          content: `
Explain this document in simple language.

Document:
${text}
`,
        },
      ],
    })

    const response =
      completion.choices?.[0]?.message?.content

    return NextResponse.json({
      explanation:
        response || 'No explanation generated',
    })
  } catch (error) {
    console.error(
      '[EXPLAIN_ROUTE_ERROR]',
      error
    )

    return NextResponse.json(
      {
        error: 'Something went wrong',
      },
      {
        status: 500,
      }
    )
  }
}