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
      systemPrompt = `
You write professional email replies.

Return ONLY JSON:
{
  "subject": "",
  "body": ""
}
`

      userPrompt = `
Write a professional reply in ${
        body.language || 'German'
      }.

Original email:
${body.email || ''}

Instruction:
${body.instruction || ''}
`
    } else if (action === 'generate') {
      systemPrompt = `
You write professional emails.

Return ONLY JSON:
{
  "subject": "",
  "body": ""
}
`

      userPrompt = `
Write a professional email in ${
        body.language || 'German'
      }.

Request:
${body.request || ''}
`
    } else if (action === 'translate') {
      systemPrompt = `
You are a translator.

Return ONLY JSON:
{
  "translation": "",
  "detectedLanguage": ""
}
`

      userPrompt = `
Translate this text to ${
        body.to || 'English'
      }:

${body.text || ''}
`
    } else {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      )
    }

    const completion =
      await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        response_format: {
          type: 'json_object',
        },
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
        max_tokens: 1200,
      })

    const content =
      completion.choices?.[0]?.message?.content

    if (!content) {
      return NextResponse.json(
        { error: 'No response from OpenAI' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      JSON.parse(content)
    )
  } catch (error) {
    console.error(
      '[AI_ROUTE_ERROR]',
      error
    )

    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}