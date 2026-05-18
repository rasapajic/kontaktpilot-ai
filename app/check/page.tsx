'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Upload, Loader2, Sun, Moon, ArrowLeft } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'

const LANGUAGES = ['English','Deutsch','Srpski','Türkçe','Bosanski','Shqip','Română','العربية','Hrvatski','Français','Español']

export default function CheckPage() {
  const router = useRouter()
  const { resolved, toggle } = useTheme()

  const [text,     setText]     = useState('')
  const [filename, setFilename] = useState('')
  const [hasFile,  setHasFile]  = useState(false)
  const [lang,     setLang]     = useState('English')
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [analysisStatus, setAnalysisStatus] = useState('')
  const [autoLaunch, setAutoLaunch] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  /* Pre-fill from landing page if user uploaded/pasted there */
  useEffect(() => {
    const raw = sessionStorage.getItem('kp_input')
    if (raw) {
      const data = JSON.parse(raw)
      if (data.text && !data.text.startsWith('[FILE:')) {
        setText(data.text)
      } else if (data.text?.startsWith('[FILE:')) {
        setFilename(data.filename || 'Uploaded file')
        setHasFile(true)
        setText('')
        setAutoLaunch(true)
      }
    }
    /* Detect language preference */
    const nav = navigator.language || ''
    if (nav.startsWith('de')) setLang('Deutsch')
    else if (nav.startsWith('tr')) setLang('Türkçe')
    else if (nav.startsWith('sr') || nav.startsWith('hr') || nav.startsWith('bs')) setLang('Srpski')
    else if (nav.startsWith('ro')) setLang('Română')
    else if (nav.startsWith('sq')) setLang('Shqip')
    else if (nav.startsWith('ar')) setLang('العربية')
  }, [])

  function handleFile(file: File) {
    setFilename(file.name)
    setHasFile(true)
    if (file.type === 'text/plain') {
      const reader = new FileReader()
      reader.onload = e => { setText(e.target?.result as string || ''); setHasFile(false) }
      reader.readAsText(file)
    } else {
      const reader = new FileReader()
      reader.onload = e => {
        sessionStorage.setItem('kp_file_data', e.target?.result as string)
        sessionStorage.setItem('kp_file_type', file.type)
      }
      reader.readAsDataURL(file)
    }
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false)
    const f = e.dataTransfer.files[0]; if (f) handleFile(f)
  }, [])

  useEffect(() => {
    if (autoLaunch && hasFile && !loading) {
      const timer = window.setTimeout(() => {
        handleAnalyse()
      }, 700)
      return () => window.clearTimeout(timer)
    }
  }, [autoLaunch, hasFile, loading])

  async function handleAnalyse() {
    if (!text.trim() && !hasFile) return
    setError('')
    setAnalysisStatus('')
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('language', lang)

      if (hasFile) {
        const fileData = sessionStorage.getItem('kp_file_data')
        const fileType = sessionStorage.getItem('kp_file_type')
        if (!fileData || !fileType) {
          throw new Error('No uploaded image found. Please upload again.')
        }
        if (!fileType.startsWith('image/')) {
          throw new Error('Only image uploads are supported for analysis right now.')
        }

        setAnalysisStatus('Preparing image for analysis…')
        const blob = dataUrlToBlob(fileData)
        const file = new File([blob], filename || 'document-image', { type: fileType })
        formData.append('file', file)
      } else {
        formData.append('text', text.trim())
      }

      setAnalysisStatus(hasFile ? 'Sending image to OpenAI Vision…' : 'Sending text to analysis…')
      const response = await fetch('/api/analyze', { method: 'POST', body: formData })
      const json = await response.json()

      if (!response.ok) {
        throw new Error(json?.error || 'Analysis failed. Please try again.')
      }

      sessionStorage.setItem('kp_result', JSON.stringify(json))
      sessionStorage.setItem('kp_case_save_pending', 'true')
      setAnalysisStatus('Analysis complete. Redirecting…')
      setTimeout(() => router.push('/result'), 900)
    } catch (err: any) {
      setError(err?.message || 'Image analysis failed. Please try again.')
      setLoading(false)
      setAnalysisStatus('')
    }
  }

  const canProceed = (text.trim().length > 10 || hasFile) && !loading

  function dataUrlToBlob(dataUrl: string) {
    const [meta, base64] = dataUrl.split(',')
    const mime = meta.match(/data:(.*?);/)?.[1] || 'application/octet-stream'
    const binary = atob(base64)
    const array = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i += 1) {
      array[i] = binary.charCodeAt(i)
    }
    return new Blob([array], { type: mime })
  }

  return (
    <div style={{ minHeight:'100dvh', background:'var(--bg)' }}>

      {/* Top bar */}
      <div className="topbar">
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => router.push('/')} aria-label="Go back"
            style={{ width:40, height:40, display:'flex', alignItems:'center', justifyContent:'center', background:'transparent', border:'none', borderRadius:10, cursor:'pointer', color:'var(--ink-3)' }}>
            <ArrowLeft size={20} />
          </button>
          <span style={{ fontWeight:600, fontSize:'1rem', color:'var(--ink)' }}>Upload your letter</span>
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

      <div className="wrap" style={{ paddingTop:32, paddingBottom:80 }}>

        {/* Reassurance message */}
        <div className="anim-up" style={{ textAlign:'center', marginBottom:32 }}>
          <p className="t-section" style={{ color:'var(--ink)', marginBottom:10 }}>
            Let's look at this together.
          </p>
          <p style={{ fontSize:'1rem', color:'var(--ink-2)', lineHeight:1.65 }}>
            Upload or paste your letter. I will explain it simply and help you know exactly what to do.
          </p>
        </div>

        {/* ── What language? — first question ── */}
        <div className="anim-up d1" style={{ marginBottom:24 }}>
          <p style={{ fontSize:'.82rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:12 }}>
            Explain it to me in
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {LANGUAGES.map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`lang-pill${lang===l?' active':''}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* ── Upload zone ── */}
        <div className="anim-up d2" style={{ marginBottom:16 }}>
          {hasFile ? (
            /* File loaded */
            <div className="card card-p" style={{ display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:52, height:52, background:'var(--gold-3)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <span style={{ fontSize:'1.6rem' }}>📄</span>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ fontWeight:600, color:'var(--ink)', fontSize:'1rem', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  {filename}
                </p>
                <p style={{ fontSize:'.85rem', color:'var(--ink-3)', marginTop:2 }}>Ready to analyse</p>
              </div>
              <button onClick={() => { setHasFile(false); setFilename(''); sessionStorage.removeItem('kp_file_data') }}
                className="btn btn-ghost btn-sm" style={{ flexShrink:0 }}>
                Remove
              </button>
            </div>
          ) : (
            <div
              className={`upload-zone${dragging?' drag-over':''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              tabIndex={0} role="button" aria-label="Upload file"
              onKeyDown={e => e.key==='Enter' && fileRef.current?.click()}
            >
              <div style={{ width:56, height:56, background:'var(--gold-3)', border:'2px solid var(--gold-2)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
                <Upload size={24} style={{ color:'var(--gold-4)' }} />
              </div>
              <p style={{ fontSize:'1rem', fontWeight:600, color:'var(--ink)', marginBottom:6 }}>
                Upload a photo, PDF, or screenshot
              </p>
              <p style={{ fontSize:'.88rem', color:'var(--ink-3)' }}>Or paste the text below</p>
              <input ref={fileRef} type="file" accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,.heic,image/*"
                className="hidden" onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
            </div>
          )}
        </div>

        {/* ── Paste / edit area ── */}
        {!hasFile && (
          <div className="anim-up d2" style={{ marginBottom:20 }}>
            <p style={{ fontSize:'.82rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:10 }}>
              Or paste the text here
            </p>
            <textarea
              className="input"
              rows={8}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Paste any email, letter, bill, or official message…&#10;&#10;Any language works — German, English, Turkish, Serbian, Romanian…"
              style={{ borderRadius:'var(--r-lg)', lineHeight:1.7 }}
            />
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="anim-slide status-orange" style={{ borderRadius:'var(--r)', padding:'16px 18px', marginBottom:16 }}>
            <p style={{ color:'var(--orange)', fontWeight:600, fontSize:'.95rem' }}>{error}</p>
          </div>
        )}

        {/* ── THE BIG BUTTON ── */}
        <div className="anim-up d3">
          <button
            onClick={handleAnalyse}
            disabled={!canProceed}
            className="btn btn-primary btn-xl btn-full"
          >
            {loading ? (
              <>
                <Loader2 size={22} className="anim-spin" />
                <span>Reading your letter carefully…</span>
              </>
            ) : (
              <>Explain this to me →</>
            )}
          </button>

          {loading && (
            <p className="anim-pulse" style={{ textAlign:'center', marginTop:14, fontSize:'.9rem', color:'var(--ink-3)' }}>
              {analysisStatus || 'This takes about 5–10 seconds…'}
            </p>
          )}
        </div>

        {/* Privacy note */}
        <div style={{ textAlign:'center', marginTop:22 }}>
          <p style={{ fontSize:'.8rem', color:'var(--ink-3)', lineHeight:1.7 }}>
            🔒 Your document is analysed privately and deleted immediately after.<br />
            We never store or share your documents.
          </p>
        </div>
      </div>
    </div>
  )
}
