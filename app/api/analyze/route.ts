import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY missing' },
        { status: 500 }
      )
    }

    const openai = new OpenAI({
      apiKey,
    })

    const body = await req.json()

    const action = body?.action

    let systemPrompt = ''
    let userPrompt = ''

    if (action === 'reply') {
      systemPrompt = 'Write professional email replies. Return JSON with subject and body.'

      userPrompt = `
Reply in ${body.language || 'German'}.

Original:
${body.email || ''}

Instruction:
${body.instruction || ''}
`
    } else if (action === 'generate') {
      systemPrompt = 'Write professional emails. Return JSON with subject and body.'

      userPrompt = `
Write an email in ${body.language || 'German'}.

Request:
${body.request || ''}
`
    } else if (action === 'translate') {
      systemPrompt = 'Translate text. Return JSON with translation and detectedLanguage.'

      userPrompt = `
Translate to ${body.to || 'English'}:

${body.text || ''}
`
    const completion =
  await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: userPrompt,
      },
    ],
  })

const content =
  completion.choices?.[0]?.message?.content || '{}'

let parsed

try {
  parsed = JSON.parse(content)
} catch {
  parsed = { raw: content }
}

return NextResponse.json(parsed)
      
    }

    const completion =
      await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      })

    const content =
      completion.choices?.[0]?.message?.content || ''

    return NextResponse.json({
      result: content,
    })
  } catch (error) {
    console.error('[AI_ROUTE_ERROR]', error)

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}

