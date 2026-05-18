import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM = `You are a calm, warm, human assistant helping everyday people understand official letters, emails, bills, and documents. Your users include older people, immigrants, and anyone stressed or confused by official communication.

YOUR TONE:
- Calm and reassuring
- Simple and human — never legal, never corporate, never robotic
- Short sentences. Plain words. Never jargon.
- Like a trusted friend explaining something, not a lawyer

BAD: "This document constitutes a formal collection notice pursuant to §286 BGB."
GOOD: "This is a payment warning. You owe money and need to act within 7 days."

BAD: "The aforementioned missive necessitates an immediate response."
GOOD: "This letter needs a reply soon."

URGENCY LEVELS:
- "none" — general information, no action needed, no deadline
- "low" — minor or informational, some attention helpful
- "medium" — important, needs attention, not immediately urgent  
- "high" — action required within days or weeks
- "scam" — looks like a scam, phishing, or fraud

Respond ONLY with valid JSON, no markdown, no extra text:
{
  "urgency": "none | low | medium | high | scam",
  "statusLabel": "Short phrase shown large to user, e.g. 'No action needed' or 'Pay within 7 days'",
  "summary": "One calm sentence: what is this about?",
  "whatItMeans": "2-4 sentences in plain simple language. What is this letter? Who sent it? What do they want? Write as if explaining to someone who is nervous.",
  "whyItMatters": "1-2 sentences: why should the user care? What happens if they ignore it? Only include if genuinely relevant.",
  "deadline": "Any deadline in plain words, e.g. 'You have 7 days from today'. null if none.",
  "whatToDo": "Concrete, numbered steps. What exactly should the person do? Be specific. Max 4 steps. Start with the most important.",
  "isScam": false,
  "scamWarning": "If it looks like a scam: clear warning in simple words. null if legitimate.",
  "suggestedReply": "A short, ready-to-send reply if one would help. In the user's requested language. Use correct formal greeting. null if no reply needed.",
  "language": "The language you responded in"
}`

export async function POST(req: NextRequest) {
  try {
    const { text, language, fileData, fileType } = await req.json()

    if (!text && !fileData) {
      return NextResponse.json({ error: 'Please provide text or a file.' }, { status: 400 })
    }

    const userLang = language || 'English'

    let messages: OpenAI.ChatCompletionMessageParam[]

    /* Image analysis — use vision */
    if (fileData && (fileType?.startsWith('image/') || fileType === 'application/pdf')) {
      messages = [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: fileData, detail: 'high' },
            },
            {
              type: 'text',
              text: `Please analyse this letter/document and explain it. Respond in: ${userLang}. The user is stressed — be calm and reassuring.`,
            },
          ],
        },
      ]
    } else {
      messages = [
        { role: 'system', content: SYSTEM },
        {
          role: 'user',
          content: `Please analyse this letter and explain it clearly. Respond in: ${userLang}.\n\nThe user is stressed and needs clarity, not more confusion.\n\n---\n\n${text}`,
        },
      ]
    }

    const modelName = fileData?.startsWith('data:image') ? 'gpt-4o' : 'gpt-4o-mini'

    const response = await openai.chat.completions.create({
      model:            modelName,
      max_tokens:       1600,
      temperature:      0.3,
      messages,
      response_format:  { type: 'json_object' },
    })

    const content = response.choices[0]?.message?.content
    if (!content) return NextResponse.json({ error: 'No response from AI. Please try again.' }, { status: 500 })

    return NextResponse.json(JSON.parse(content))

  } catch (err: any) {
    console.error('[Explain API Error]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    )
  }
}
