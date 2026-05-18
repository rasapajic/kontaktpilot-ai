'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { RotateCcw, Sun, Moon, Loader2 } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import type { AnalysisResult } from '@/lib/analysis'
import { saveCaseHistoryEntry } from '@/lib/cases'

type Urgency = 'none' | 'low' | 'medium' | 'high' | 'scam'
type ReplyActionId = 'more_time' | 'already_paid' | 'disagree' | 'clarify' | 'general'

const STATUS_CONFIG: Record<Urgency, { emoji:string; label:string; cls:string; color:string; textColor:string }> = {
  none:   { emoji:'✅', label:'No action needed',        cls:'status-green',  color:'var(--green)',  textColor:'var(--green)' },
  low:    { emoji:'🟡', label:'Important — read it',     cls:'status-yellow', color:'var(--yellow)', textColor:'var(--yellow)' },
  medium: { emoji:'⚠️', label:'Important — act soon',   cls:'status-orange', color:'var(--orange)', textColor:'var(--orange)' },
  high:   { emoji:'🔶', label:'Urgent — respond now',   cls:'status-red',    color:'var(--red)',    textColor:'var(--red)' },
  scam:   { emoji:'🚨', label:'Possible scam or fraud', cls:'status-red',    color:'var(--red)',    textColor:'var(--red)' },
}

export default function ResultPage() {
  const router = useRouter()
  const { resolved, toggle } = useTheme()

  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [replyAction, setReplyAction] = useState<ReplyActionId | null>(null)
  const [replyResult, setReplyResult] = useState<{ subject:string; body:string } | null>(null)
  const [replyLoading, setReplyLoading] = useState(false)
  const [replyError, setReplyError] = useState('')
  const [copied, setCopied] = useState(false)

  const replyActions: { id: ReplyActionId; label: string; note: string }[] = [
    { id: 'more_time', label: 'Ask for more time', note: 'Ask politely for more time to respond.' },
    { id: 'already_paid', label: 'I already paid', note: 'Tell them you already paid and ask them to confirm receipt.' },
    { id: 'disagree', label: 'I disagree', note: 'Say you disagree and ask them to explain why.' },
    { id: 'clarify', label: 'Request clarification', note: 'Ask for more details or missing information.' },
    { id: 'general', label: 'General polite reply', note: 'Send a calm request for next steps.' },
  ]

  async function generateReply(action: ReplyActionId) {
    if (!analysis) return
    setReplyAction(action)
    setReplyError('')
    setReplyLoading(true)
    setReplyResult(null)
    setCopied(false)

    const actionText: Record<ReplyActionId,string> = {
      more_time: 'Ask politely for more time to respond, without apologizing too much.',
      already_paid: 'Explain that you already paid and ask them to confirm receipt politely.',
      disagree: 'Say you disagree with the request and ask them to explain the reason clearly.',
      clarify: 'Ask for more information and clarification in a calm and polite way.',
      general: 'Write a short polite reply asking what the next step should be.',
    }

    const language = analysis.documentLanguage || 'English'
    
     const context = `The letter is from ${analysis.sender}. It looks like: ${analysis.summary}.` +
  (analysis.deadline ? ` The letter mentions a deadline of ${analysis.deadline}.` : '') +
  (((analysis as any).qualityWarnings?.length)
    ? ` Note: the document may be incomplete or unclear.`
    : '')

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate',
          language,
          tone: 'calm, polite, short, human, non-aggressive',
          request: `${actionText[action]} ${context}`,
        }),
      })
      const data = await response.json()
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Unable to generate reply.')
      }
      setReplyResult({ subject: data.subject || '', body: data.body || '' })
    } catch (err: any) {
      setReplyError(err?.message || 'Unable to generate reply.')
    } finally {
      setReplyLoading(false)
    }
  }

  async function copyReply() {
    if (!replyResult) return
    try {
      await navigator.clipboard.writeText(`${replyResult.subject ? replyResult.subject + '\n\n' : ''}${replyResult.body}`)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }

  useEffect(() => {
    const raw = sessionStorage.getItem('kp_result')
    if (!raw) { router.push('/check'); return }
    try {
      const parsed = JSON.parse(raw)
      setAnalysis(parsed)
      if (sessionStorage.getItem('kp_case_save_pending') === 'true') {
        saveCaseHistoryEntry(parsed)
        sessionStorage.removeItem('kp_case_save_pending')
      }
    } catch {
      router.push('/check')
    }
  }, [router])

  if (!analysis) return (
    <div style={{ minHeight:'100dvh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <Loader2 size={32} className="anim-spin" style={{ color:'var(--ink-3)' }} />
    </div>
  )

  const isScam = analysis.scamRisk === 'high' || analysis.seriousness === 'scam'
  const status = STATUS_CONFIG[analysis.seriousness] || STATUS_CONFIG.low

  const extractedDeadlineDate = analysis.extractedDeadlineDate || analysis.deadlineDate || null
  const parsedDeadline = extractedDeadlineDate ? new Date(`${extractedDeadlineDate}T00:00:00Z`) : null
  const parsedDeadlineValid = parsedDeadline ? !Number.isNaN(parsedDeadline.getTime()) : false
  const defaultDaysRemaining = parsedDeadlineValid && parsedDeadline
  ? Math.round((parsedDeadline.getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24))
  : null
  const daysRemaining = typeof analysis.daysRemaining === 'number' ? analysis.daysRemaining : defaultDaysRemaining
  const deadlineUrgency = analysis.deadlineUrgency || (
    daysRemaining === null ? 'NONE' :
    daysRemaining < 0 ? 'CRITICAL' :
    daysRemaining <= 3 ? 'CRITICAL' :
    daysRemaining <= 7 ? 'HIGH' :
    daysRemaining <= 14 ? 'MEDIUM' :
    'LOW'
  ) as 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  const deadlineStatusLabel = deadlineUrgency === 'NONE' ? 'No deadline' : deadlineUrgency
  const deadlineStatusColor = deadlineUrgency === 'CRITICAL' ? 'var(--red)' : deadlineUrgency === 'HIGH' ? 'var(--orange)' : deadlineUrgency === 'MEDIUM' ? 'var(--yellow)' : deadlineUrgency === 'LOW' ? 'var(--green)' : 'var(--ink-3)'
  const deadlineLabel = analysis.deadline || (extractedDeadlineDate ? 'Exact deadline detected' : 'No confirmed deadline detected.')
let deadlineSummary = 'No deadline detected.'

if (daysRemaining !== null) {
  if (daysRemaining < 0) {
    deadlineSummary =
      `Deadline passed ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) === 1 ? '' : 's'} ago.`
  } else if (daysRemaining === 0) {
    deadlineSummary = 'Due today.'
  } else {
    deadlineSummary =
      `${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining.`
  }
}

return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)' }}>
      <div className="topbar">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => router.push('/check')} aria-label="Go back"
            style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', borderRadius:10, cursor:'pointer', color:'var(--ink-3)' }}>
            <RotateCcw size={18} />
          </button>
          <span style={{ fontWeight:600, fontSize:'1rem', color:'var(--ink)' }}>Letter interpreter</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <Link href="/cases" style={{ padding:'8px 10px', fontSize:'.85rem', fontWeight:600, color:'var(--ink-3)', textDecoration:'none', borderRadius:10, border:'1px solid var(--rim)', background:'var(--bg-card)' }}>
            My letters
          </Link>
          <button onClick={toggle} aria-label="Toggle theme"
            style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', borderRadius:10, cursor:'pointer', color:'var(--ink-3)' }}>
            {resolved==='dark' ? <Sun size={18}/> : <Moon size={18}/>}
          </button>
        </div>
      </div>

      <div className="wrap" style={{ paddingTop:28, paddingBottom:80 }}>
        <div className={`anim-up ${status.cls}`} style={{ borderRadius:'var(--r-lg)', padding:'22px 22px', marginBottom:18 }}>
          <div style={{ display:'flex', alignItems:'flex-start', gap:14, flexWrap:'wrap' }}>
            <span style={{ fontSize:'2.2rem', lineHeight:1, flexShrink:0, marginTop:2 }}>{status.emoji}</span>
            <div style={{ minWidth:0 }}>
              <p style={{ fontWeight:800, fontSize:'1.2rem', color: status.textColor, marginBottom:8, lineHeight:1.2 }}>
                {status.label}
              </p>
              <p style={{ fontSize:'1rem', color:'var(--ink)', lineHeight:1.75 }}>
                {analysis.summary}
              </p>
            </div>
          </div>
        </div>

        {isScam && analysis.scamWarning && (
          <div className="anim-up d1 status-red" style={{ borderRadius:'var(--r-lg)', padding:'20px 22px', marginBottom:16, borderWidth:3 }}>
            <p style={{ fontWeight:800, fontSize:'1.1rem', color:'var(--red)', marginBottom:8 }}>
              🚨 Be careful — this may be a scam
            </p>
            <p style={{ fontSize:'1rem', color:'var(--ink)', lineHeight:1.65 }}>
              {analysis.scamWarning}
            </p>
          </div>
        )}

        <div className="anim-up card" style={{ marginBottom:14, padding:'20px 22px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:12, flexWrap:'wrap', alignItems:'center' }}>
            <div>
              <p style={{ fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Sender</p>
              <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)' }}>{analysis.sender}</p>
            </div>
            <div style={{ padding:'10px 14px', borderRadius:16, border:'1.5px solid var(--rim)', background:'var(--bg-subtle)', minWidth:160 }}>
              <p style={{ fontSize:'.75rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Seriousness</p>
              <p style={{ fontSize:'.95rem', fontWeight:700, color:status.textColor }}>{status.label}</p>
            </div>
          </div>
        </div>

        <div className="anim-up card" style={{ marginBottom:12, padding:'20px 22px' }}>
          <div style={{ display:'grid', gap:14, gridTemplateColumns:'1fr 1fr', alignItems:'stretch' }}>
            <div>
              <p style={{ fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Category</p>
              <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)' }}>{analysis.category}</p>
            </div>
            <div>
              <p style={{ fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Language</p>
              <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)' }}>{analysis.documentLanguage}</p>
            </div>
            <div>
              <p style={{ fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Sender confidence</p>
              <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)' }}>{analysis.senderConfidence}%</p>
            </div>
            <div>
              <p style={{ fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Urgency score</p>
              <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)' }}>{analysis.urgencyScore}/100</p>
            </div>
          </div>
        </div>

        <div className="anim-up card" style={{ marginBottom:12 }}>
          <div style={{ padding:'22px 22px' }}>
            <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:10 }}>What this letter means</p>
            <p style={{ fontSize:'1rem', color:'var(--ink)', lineHeight:1.8 }}>{analysis.explanation}</p>
          </div>
        </div>

        {(analysis as any).qualityWarnings?.length > 0 && (
          <div className="anim-up card" style={{ marginBottom:12, border:'1px solid var(--rim)' }}>
            <div style={{ padding:'22px 22px' }}>
              <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:10 }}>Quality warnings</p>
              <div style={{ display:'grid', gap:8 }}>
               {(((analysis as any).qualityWarnings) || []).map((warning: string, index: number) => (
  <p
    key={index}
    style={{ fontSize:'1rem', color:'var(--ink)', lineHeight:1.6 }}
  >
    • {warning}
  </p>
))}
            </div>
          </div>
        }

        {(analysis.confidenceExplanation || analysis.senderConfidence < 70) && (
          <div className="anim-up card" style={{ marginBottom:12, border:'1px solid var(--rim)' }}>
            <div style={{ padding:'22px 22px' }}>
              <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:10 }}>Confidence note</p>
              <p style={{ fontSize:'1rem', color:'var(--ink)', lineHeight:1.8, marginBottom:10 }}>
                {analysis.confidenceExplanation || 'This analysis is not fully certain. Please verify the sender, deadline, and amount before taking any action.'}
              </p>
              <p style={{ fontSize:'.9rem', color:'var(--ink-3)', lineHeight:1.6 }}>
                Confirmed: the main request and sender are visible. Likely: the reason for the letter and urgency. Uncertain: exact amounts, deadlines, or formal threats.
              </p>
            </div>
          </div>
        )}

        {analysis.importance && (
          <div className="anim-up card" style={{ marginBottom:12 }}>
            <div style={{ padding:'22px 22px' }}>
              <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:10 }}>Why this matters</p>
              <p style={{ fontSize:'1rem', color:'var(--ink)', lineHeight:1.8 }}>{analysis.importance}</p>
            </div>
          </div>
        )}

        <div className="anim-up" style={{ borderRadius:'var(--r-lg)', padding:'18px 22px', marginBottom:12, display:'flex', alignItems:'center', gap:14, flexWrap:'wrap', background: daysRemaining !== null && daysRemaining < 0 ? 'rgba(255, 117, 106, 0.08)' : 'var(--bg-card)', border: daysRemaining !== null && daysRemaining < 0 ? '1px solid rgba(255, 117, 106, 0.2)' : '1px solid var(--rim)' }}>
          <span style={{ fontSize:'1.75rem', lineHeight:1 }}>⏰</span>
          <div style={{ minWidth:0, flex:'1 1 240px' }}>
            <p style={{ fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--orange)', marginBottom:4 }}>Deadline</p>
            <p style={{ fontSize:'1.05rem', fontWeight:700, color:'var(--ink)' }}>{deadlineLabel}</p>
            {extractedDeadlineDate && (
              <p style={{ marginTop:6, fontSize:'.88rem', color:'var(--ink-3)' }}>Exact date: {extractedDeadlineDate}</p>
            )}
            <p style={{ marginTop:6, fontSize:'.88rem', color:'var(--ink-3)' }}>{deadlineSummary}</p>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
            <span style={{ padding:'8px 12px', borderRadius:999, border:`1px solid ${deadlineStatusColor}`, color:deadlineStatusColor, fontSize:'.8rem', fontWeight:700, background:'var(--bg-subtle)' }}>{deadlineStatusLabel}</span>
          </div>
        </div>

        {(analysis as any).qualityWarnings?.length > 0 && (
          <div className="anim-up card" style={{ marginBottom:12, border:'1px solid var(--rim)' }}>
            <div style={{ padding:'22px 22px' }}>
              <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:10 }}>Quality warnings</p>
              <div style={{ display:'grid', gap:8 }}>
                {analysis.qualityWarnings.map((warning, index) => (
                  <p key={index} style={{ fontSize:'1rem', color:'var(--ink)', lineHeight:1.6 }}>• {warning}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        {analysis.scamIndicators?.length > 0 && (
          <div className="anim-up card" style={{ marginBottom:12 }}>
            <div style={{ padding:'22px 22px' }}>
              <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:10 }}>Scam indicators</p>
              <div style={{ display:'grid', gap:10 }}>
                {analysis.scamIndicators.map((indicator, index) => (
                  <p key={index} style={{ fontSize:'1rem', color:'var(--ink)', lineHeight:1.6 }}>• {indicator}</p>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="anim-up card" style={{ marginBottom:22, padding:'20px 22px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div>
              <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:10 }}>Need help replying?</p>
              <p style={{ fontSize:'.95rem', color:'var(--ink-2)', lineHeight:1.7 }}>
                Choose one of the short reply options below and I will generate a calm, polite response in the detected language.
              </p>
            </div>
            <div style={{ display:'grid', gap:10, gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))' }}>
              {replyActions.map(action => (
                <button
                  key={action.id}
                  onClick={() => generateReply(action.id)}
                  disabled={replyLoading}
                  className={`btn btn-outline btn-full${replyAction===action.id ? ' active' : ''}`}
                  style={{ minHeight:48 }}
                >
                  {action.label}
                </button>
              ))}
            </div>
            {replyError && (
              <div className="status-orange" style={{ borderRadius:'var(--r)', padding:'12px 14px' }}>
                <p style={{ margin:0, color:'var(--orange)', fontWeight:600 }}>{replyError}</p>
              </div>
            )}
            {replyResult && (
              <div style={{ display:'grid', gap:10 }}>
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
                  <button onClick={copyReply} className="btn btn-outline" type="button">
                    {copied ? 'Copied' : 'Copy reply'}
                  </button>
                  <button onClick={() => replyAction && generateReply(replyAction)} disabled={replyLoading} className="btn btn-primary" type="button">
                    {replyLoading ? 'Regenerating…' : 'Regenerate'}
                  </button>
                </div>
                <div style={{ border:'1px solid var(--rim)', borderRadius:'var(--r-lg)', padding:'16px 18px', background:'var(--bg-subtle)' }}>
                  {replyResult.subject && (
                    <p style={{ fontWeight:700, fontSize:'1rem', marginBottom:10, color:'var(--ink)' }}>{replyResult.subject}</p>
                  )}
                  <p style={{ fontSize:'1rem', color:'var(--ink)', lineHeight:1.8, whiteSpace:'pre-wrap' }}>{replyResult.body}</p>
                </div>
                {analysis.explanation && (
                  <div style={{ border:'1px solid var(--rim)', borderRadius:'var(--r-lg)', padding:'16px 18px', background:'var(--bg)' }}>
                    <p style={{ fontSize:'.95rem', color:'var(--ink-3)', marginBottom:8 }}>Reply explanation</p>
                    <p style={{ fontSize:'.95rem', color:'var(--ink)', lineHeight:1.7 }}>{analysis.explanation}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="anim-up card" style={{ marginBottom:18 }}>
          <div style={{ padding:'22px 22px' }}>
            <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:10 }}>Recommended next step</p>
            <p style={{ fontSize:'1rem', color:'var(--ink)', lineHeight:1.8 }}>{analysis.nextStep}</p>
          </div>
        </div>

        <div className="anim-up card" style={{ marginBottom:22 }}>
          <div style={{ padding:'22px 22px' }}>
            <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:14 }}>Action checklist</p>
            <div style={{ display:'grid', gap:12 }}>
              {analysis.checklist.map((item, index) => (
                <div key={index} style={{ display:'flex', alignItems:'flex-start', gap:12 }}>
                  <span style={{ width:28, height:28, borderRadius:999, background:'var(--bg-subtle)', display:'grid', placeItems:'center', fontSize:'.88rem', color:'var(--ink)' }}>{index + 1}</span>
                  <p style={{ fontSize:'1rem', color:'var(--ink)', lineHeight:1.6 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="anim-up" style={{ display:'flex', flexDirection:'column', gap:10 }}>
          <button onClick={() => {
            sessionStorage.removeItem('kp_result')
            sessionStorage.removeItem('kp_input')
            sessionStorage.removeItem('kp_file_data')
            sessionStorage.removeItem('kp_file_type')
            router.push('/check')
          }} className="btn btn-outline btn-full">
            <RotateCcw size={16} /> Check another letter
          </button>
        </div>

        <p style={{ textAlign:'center', marginTop:24, fontSize:'.8rem', color:'var(--ink-3)', lineHeight:1.7 }}>
          🔒 Your letter is analysed only once and removed after. Your privacy is protected.
        </p>
      </div>
    </div>
  )
}
