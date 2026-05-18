import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const PROMPTS = {
  reply: `You write professional email replies for people who struggle with formal communication.

Rules:
- Use correct formal greeting/closing for the target language (e.g. "Sehr geehrte Damen und Herren" for German)
- Match the register of the original email
- Be polite, clear, professional
- Follow the user's instructions exactly
- Write in the requested language

Respond ONLY with valid JSON: { "subject": "...", "body": "..." }`,

  generate: `You write professional emails for people who need help with formal communication.

Rules:
- Use correct formal greeting and closing for the language
- No placeholder brackets — write naturally
- Match the requested tone
- Be concise but complete

Respond ONLY with valid JSON: { "subject": "...", "body": "..." }`,

  translate: `You are a precise translator. Preserve tone and formality of the original.

Respond ONLY with valid JSON: { "translation": "...", "detectedLanguage": "..." }`,
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { action } = body

    const prompt = PROMPTS[action as keyof typeof PROMPTS]
    if (!prompt) return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

    let userMsg = ''
    switch (action) {
      case 'reply':
        userMsg = `Write a ${body.tone||'professional'} reply in ${body.language||'Deutsch'}.\n\nOriginal:\n${body.email}\n\nUser's intention: ${body.instruction||'Reply politely'}`
        break
      case 'generate':
        userMsg = `Write a ${body.tone||'professional'} email in ${body.language||'Deutsch'}.\n\nRequest: ${body.request}`
        break
      case 'translate':
        userMsg = `Translate to ${body.to}.\n\n${body.text}`
        break
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', max_tokens: 1200, temperature: 0.35,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user',   content: userMsg },
      ],
      response_format: { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) return NextResponse.json({ error: 'No response' }, { status: 500 })
    return NextResponse.json(JSON.parse(content))

  } catch (err: any) {
    console.error('[AI Route]', err)
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}
