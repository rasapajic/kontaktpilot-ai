'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Trash2 } from 'lucide-react'
import { getCaseHistory, deleteCaseHistoryEntry } from '@/lib/cases'
import type { CaseHistoryEntry } from '@/lib/cases'

export default function CasesPage() {
  const router = useRouter()
  const [cases, setCases] = useState<CaseHistoryEntry[]>([])

  useEffect(() => {
    setCases(getCaseHistory())
  }, [])

  function openCase(entry: CaseHistoryEntry) {
    sessionStorage.setItem('kp_result', JSON.stringify(entry.analysis))
    sessionStorage.removeItem('kp_case_save_pending')
    router.push('/result')
  }

  function removeCase(id: string) {
    deleteCaseHistoryEntry(id)
    setCases(getCaseHistory())
  }

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)' }}>
      <div className="topbar">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => router.push('/')} aria-label="Go back"
            style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', borderRadius:10, cursor:'pointer', color:'var(--ink-3)' }}>
            <ArrowLeft size={18} />
          </button>
          <span style={{ fontWeight:600, fontSize:'1rem', color:'var(--ink)' }}>My letters</span>
        </div>
        <Link href="/" style={{ padding:'8px 12px', borderRadius:10, border:'1px solid var(--rim)', color:'var(--ink-3)', textDecoration:'none', fontSize:'.9rem' }}>
          Home
        </Link>
      </div>

      <div className="wrap" style={{ paddingTop:28, paddingBottom:80 }}>
        {cases.length === 0 ? (
          <div className="anim-up card" style={{ padding:'24px 22px', textAlign:'center' }}>
            <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)', marginBottom:10 }}>No saved letters yet</p>
            <p style={{ fontSize:'.95rem', color:'var(--ink-3)', lineHeight:1.7 }}>Complete one analysis and it will appear here for later review.</p>
          </div>
        ) : (
          <div style={{ display:'grid', gap:12 }}>
            {cases.map(entry => (
              <div key={entry.id} className="card card-p" style={{ padding:'18px 20px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', gap:14, flexWrap:'wrap', alignItems:'flex-start' }}>
                  <div style={{ minWidth:0, flex:'1 1 160px' }}>
                    <p style={{ fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Sender</p>
                    <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{entry.sender}</p>
                  </div>
                  <div style={{ minWidth:0, flex:'1 1 120px' }}>
                    <p style={{ fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Category</p>
                    <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)' }}>{entry.category}</p>
                  </div>
                  <div style={{ minWidth:0, flex:'1 1 100px' }}>
                    <p style={{ fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Urgency</p>
                    <p style={{ fontSize:'1rem', fontWeight:700, color:'var(--ink)' }}>{Math.round(entry.urgencyScore)} / 100</p>
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', gap:14, alignItems:'center', flexWrap:'wrap', marginTop:16 }}>
                  <div style={{ minWidth:0, flex:'1 1 200px' }}>
                    <p style={{ fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Viewed</p>
                    <p style={{ fontSize:'.95rem', color:'var(--ink-2)' }}>{new Date(entry.savedAt).toLocaleDateString(undefined, { year:'numeric', month:'short', day:'numeric' })}</p>
                  </div>
                  <div style={{ minWidth:0, flex:'1 1 100%' }}>
                    <p style={{ fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:6 }}>Summary</p>
                    <p style={{ fontSize:'.95rem', color:'var(--ink)', lineHeight:1.6 }}>{entry.summary}</p>
                  </div>
                </div>

                <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginTop:16 }}>
                  <button onClick={() => openCase(entry)} className="btn btn-outline" style={{ flex:'1 1 150px' }}>
                    Open case
                  </button>
                  <button onClick={() => removeCase(entry.id)} className="btn btn-ghost" style={{ flex:'1 1 150px', color:'var(--orange)' }}>
                    <Trash2 size={16} style={{ marginRight:8 }} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
