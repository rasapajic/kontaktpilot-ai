'use client'

import messages from '@/lib/messages/sr.json'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Moon, Sun, Camera, FileUp, ClipboardPaste } from 'lucide-react'
import { useTheme } from '@/components/ThemeProvider'
import Link from 'next/link'

/* ─── Nav ─────────────────────────────────── */
function Nav() {
  const { resolved, toggle } = useTheme()
  return (
    <nav style={{
      position:'sticky',top:0,zIndex:50,height:56,
      display:'flex',alignItems:'center',justifyContent:'space-between',
      padding:'0 20px',
      background:'color-mix(in srgb,var(--bg) 94%,transparent)',
      backdropFilter:'blur(14px)',WebkitBackdropFilter:'blur(14px)',
      borderBottom:'1px solid var(--rim-2)',
    }}>
      <div style={{display:'flex',alignItems:'center',gap:9}}>
        <div style={{width:33,height:33,background:'var(--ink)',borderRadius:9,display:'flex',alignItems:'center',justifyContent:'center'}}>
          <span style={{fontFamily:'Instrument Serif,serif',fontStyle:'italic',fontSize:'1.1rem',color:'var(--gold)',lineHeight:1}}>K</span>
        </div>
        <span style={{fontWeight:700,fontSize:'.95rem',color:'var(--ink)'}}>
          Kontakt<span style={{color:'var(--gold)'}}>AI</span>
        </span>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:2}}>
        <Link href="/cases" style={{padding:'7px 13px',fontSize:'.85rem',fontWeight:500,color:'var(--ink-3)',textDecoration:'none',borderRadius:8}}>
          My letters
        </Link>
        <Link href="/login" style={{padding:'7px 13px',fontSize:'.85rem',fontWeight:500,color:'var(--ink-3)',textDecoration:'none',borderRadius:8}}>
          Sign in
        </Link>
        <button onClick={toggle} aria-label="Toggle theme"
          style={{width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',background:'transparent',border:'none',cursor:'pointer',color:'var(--ink-3)',borderRadius:8}}>
          {resolved==='dark'?<Sun size={16}/>:<Moon size={16}/>}
        </button>
      </div>
    </nav>
  )
}

/* ─── Trust row ──────────────────────────── */
function TrustRow() {
  const badges = [
    { icon:'🔒', text:'Private by default' },
    { icon:'⚡', text:'Instant explanation' },
    { icon:'🗑', text:'Files deleted after' },
  ]
  return (
    <div style={{
      display:'flex',flexWrap:'wrap',
      justifyContent:'center',
      gap:'6px 16px',
      marginTop:14,
    }}>
      {badges.map(b=>(
        <div key={b.text} style={{display:'flex',alignItems:'center',gap:5}}>
          <span style={{fontSize:'.9rem'}}>{b.icon}</span>
          <span style={{fontSize:'.78rem',color:'var(--ink-3)',fontWeight:500}}>{b.text}</span>
        </div>
      ))}
    </div>
  )
}

/* ─── First-time onboarding steps ─────────── */
function HowItWorks(){

 const steps = [
  {
    no: '1',
    title: messages.steps.oneTitle,
    detail: messages.steps.oneText
  },
  {
    no: '2',
    title: messages.steps.twoTitle,
    detail: messages.steps.twoText
  },
  {
    no: '3',
    title: messages.steps.threeTitle,
    detail: messages.steps.threeText
  }
];

  return (
    <div className="anim-up" style={{marginBottom:32}}>
      <div style={{textAlign:'center',marginBottom:18}}>
        <p style={{fontSize:'.72rem',fontWeight:700,letterSpacing:'.09em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:10}}>
          How it works
        </p>
        <p style={{fontSize:'1.1rem',fontWeight:700,color:'var(--ink)',lineHeight:1.4,maxWidth:520,margin:'0 auto'}}>
          A simple, secure path from upload to clear next steps.
        </p>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))',gap:12}}>
        {steps.map(step=> (
          <div key={step.title} className="card" style={{padding:'20px',minHeight:150,display:'flex',flexDirection:'column',gap:14}}>
            <div style={{width:36,height:36,display:'grid',placeItems:'center',borderRadius:12,background:'var(--bg-subtle)',fontSize:'1rem',fontWeight:700,color:'var(--ink)'}}>{step.no}</div>
            <div>
              <p style={{fontWeight:700,fontSize:'1rem',color:'var(--ink)',marginBottom:8}}>{step.title}</p>
              <p style={{fontSize:'.92rem',color:'var(--ink-2)',lineHeight:1.6}}>{step.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Upload zone ────────────────────────── */
function UploadZone({ onFile, onText }: {
  onFile:(f:File)=>void
  onText:(t:string)=>void
}) {
  const [tab,      setTab]      = useState<'photo'|'paste'>('photo')
  const [drag,     setDrag]     = useState(false)
  const [pasted,   setPasted]   = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((e:React.DragEvent)=>{
    e.preventDefault(); setDrag(false)
    const f=e.dataTransfer.files[0]; if(f) onFile(f)
  },[onFile])

  function openCamera() {
    const inp=document.createElement('input')
    inp.type='file'; inp.accept='image/*'; inp.capture='environment'
    inp.onchange=e=>{const f=(e.target as HTMLInputElement).files?.[0]; if(f) onFile(f)}
    inp.click()
  }

  return (
    <div>
      {/* Tab toggle */}
      <div style={{
        display:'grid',gridTemplateColumns:'1fr 1fr',
        gap:3,padding:3,background:'var(--bg-subtle)',
        borderRadius:13,marginBottom:12,
      }}>
        {([
          {id:'photo', icon:<Camera size={15}/>, label:'Photo or PDF'},
          {id:'paste', icon:<ClipboardPaste size={15}/>, label:'Paste text'},
        ] as const).map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)}
            style={{
              display:'flex',alignItems:'center',justifyContent:'center',
              gap:6,padding:'11px 8px',borderRadius:10,border:'none',
              background:tab===t.id?'var(--bg-card)':'transparent',
              color:tab===t.id?'var(--ink)':'var(--ink-3)',
              fontWeight:tab===t.id?700:500,
              fontSize:'.88rem',cursor:'pointer',fontFamily:'inherit',
              boxShadow:tab===t.id?'var(--sh-sm)':'none',
              transition:'.15s',
            }}>
            {t.icon}{t.label}
          </button>
        ))}
      </div>

      {tab==='photo'&&(
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          {/* Primary CTA — camera */}
          <button onClick={openCamera}
            style={{
              display:'flex',alignItems:'center',justifyContent:'center',
              gap:10,height:64,width:'100%',maxWidth:340,margin:'0 auto',
              background:'var(--ink)',color:'var(--bg)',
              border:'none',borderRadius:18,
              fontSize:'1.05rem',fontWeight:700,fontFamily:'inherit',
              cursor:'pointer',letterSpacing:'-.01em',
              boxShadow:'0 4px 20px rgba(30,27,22,.18)',
              transition:'opacity .12s,transform .12s',
            }}
            onMouseOver={e=>{e.currentTarget.style.opacity='.87'}}
            onMouseOut={e=>{e.currentTarget.style.opacity='1'}}
            onMouseDown={e=>{e.currentTarget.style.transform='scale(.97)'}}
            onMouseUp={e=>{e.currentTarget.style.transform='scale(1)'}}
          >
            <Camera size={21} style={{color:'var(--gold)',flexShrink:0}}/>
            📸 {messages.upload.photo}
          </button>

          {/* Secondary — upload file */}
          <div
            onDragOver={e=>{e.preventDefault();setDrag(true)}}
            onDragLeave={()=>setDrag(false)}
            onDrop={onDrop}
            onClick={()=>fileRef.current?.click()}
            role="button" tabIndex={0} aria-label="Upload file"
            onKeyDown={e=>e.key==='Enter'&&fileRef.current?.click()}
            style={{
              display:'flex',alignItems:'center',justifyContent:'center',
              gap:8,height:48,
              border:`2px dashed ${drag?'var(--gold)':'var(--rim)'}`,
              borderRadius:12,
              background:drag?'var(--gold-3)':'transparent',
              cursor:'pointer',transition:'.15s',
              fontSize:'.88rem',fontWeight:500,color:'var(--ink-3)',
            }}
          >
            <FileUp size={16}/>
            {messages.upload.upload}
          </div>
          <input ref={fileRef} type="file"
            accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,.heic,image/*"
            capture="environment"
            style={{display:'none'}}
            onChange={e=>e.target.files?.[0]&&onFile(e.target.files[0])}/>
        </div>
      )}

      {tab==='paste'&&(
        <div style={{display:'flex',flexDirection:'column',gap:8}}>
          <textarea
            value={pasted} onChange={e=>setPasted(e.target.value)}
            rows={6}
            placeholder="Paste your email or letter here…&#10;&#10;German, English, Turkish, Serbian — any language."
            style={{
              width:'100%',padding:'15px 16px',
              background:'var(--bg-card)',
              border:'2px solid var(--rim)',borderRadius:14,
              fontFamily:'inherit',fontSize:'.95rem',
              color:'var(--ink)',lineHeight:1.65,
              outline:'none',resize:'none',transition:'border-color .15s',
            }}
            onFocus={e=>{e.target.style.borderColor='var(--gold)'}}
            onBlur={e=>{e.target.style.borderColor='var(--rim)'}}
          />
          <button
            onClick={()=>pasted.trim()&&onText(pasted.trim())}
            disabled={!pasted.trim()}
            style={{
              height:58,width:'100%',maxWidth:340,margin:'0 auto',
              display:'flex',alignItems:'center',justifyContent:'center',
              background:pasted.trim()?'var(--ink)':'var(--bg-subtle)',
              color:pasted.trim()?'var(--bg)':'var(--ink-3)',
              border:'none',borderRadius:16,
              fontSize:'1rem',fontWeight:700,fontFamily:'inherit',
              cursor:pasted.trim()?'pointer':'not-allowed',
              transition:'.15s',
            }}
          >
            Explain this to me →
          </button>
        </div>
      )}

      <TrustRow/>
    </div>
  )
}

/* ─── Example result card ────────────────── */
function ExampleResult({visible}:{visible:boolean}) {
  if(!visible) return null
  return (
    <div className="anim-slide" style={{marginTop:8}}>
      <div style={{
        borderRadius:'14px 14px 0 0',padding:'14px 16px',
        background:'var(--bg-subtle)',
        border:'1.5px solid var(--rim-2)',borderBottom:'none',
      }}>
        <p style={{fontSize:'.7rem',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:8}}>
          📬 Original letter (German)
        </p>
        <p style={{fontSize:'.85rem',color:'var(--ink-2)',lineHeight:1.65,fontStyle:'italic'}}>
          "Betreff: Letzte Mahnung — Zahlung überfällig. Der offene Betrag von €238,50 ist binnen 7 Tagen zu überweisen, da wir sonst rechtliche Schritte einleiten."
        </p>
      </div>

      <div style={{
        border:'1.5px solid var(--rim-2)',borderTop:'none',
        borderRadius:'0 0 14px 14px',background:'var(--bg-card)',overflow:'hidden',
      }}>
        <div style={{
          padding:'14px 16px',
          background:'var(--orange-bg,#FFF5EB)',
          borderBottom:'1.5px solid var(--orange-rim,#F0A860)',
          display:'flex',alignItems:'flex-start',gap:10,
        }}>
          <span style={{fontSize:'1.6rem',lineHeight:1,flexShrink:0}}>🔶</span>
          <div>
            <p style={{fontWeight:800,fontSize:'.95rem',color:'var(--orange,#A04800)',marginBottom:4}}>
              Action required within 7 days
            </p>
            <p style={{fontSize:'.88rem',color:'var(--ink)',lineHeight:1.55}}>
              This is a <strong>final payment warning</strong>. You owe €238.50. They will take legal action if you don't pay.
            </p>
          </div>
        </div>
        <div style={{padding:'14px 16px',display:'flex',alignItems:'flex-start',gap:10}}>
          <span style={{fontSize:'1.3rem',lineHeight:1,flexShrink:0,marginTop:2}}>✅</span>
          <div>
            <p style={{fontSize:'.7rem',fontWeight:700,letterSpacing:'.07em',textTransform:'uppercase',color:'var(--ok,#2E7D52)',marginBottom:5}}>
              What to do
            </p>
            <p style={{fontSize:'.88rem',color:'var(--ink)',lineHeight:1.55}}>
              Pay €238.50 asap. Can't pay full amount? Call them today to arrange instalments.
            </p>
          </div>
        </div>
        <div style={{padding:'0 16px 14px'}}>
          <div style={{
            padding:'11px 14px',borderRadius:10,textAlign:'center',
            background:'var(--bg-subtle)',border:'1.5px dashed var(--rim)',
            fontSize:'.82rem',color:'var(--ink-3)',fontWeight:500,
          }}>
            ✍️ "Write a professional reply for me in German" →
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────
   PAGE
───────────────────────────────────────── */
export default function Page() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const uploadTimer = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      if (uploadTimer.current) window.clearTimeout(uploadTimer.current)
    }
  }, [previewUrl])

  function handleFile(file:File) {
    if (uploading) return
    setUploadError('')
    setSelectedFile(file)
    setUploading(true)
    setUploadProgress(8)
    const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    setPreviewUrl(preview)

    const reader = new FileReader()
    reader.onload = e => {
      const value = e.target?.result
      if (typeof value !== 'string') {
        setUploadError('Could not read this file. Please try another one.')
        setUploading(false)
        setSelectedFile(null)
        setPreviewUrl(null)
        return
      }

      const progressSteps = [24, 48, 72, 94, 100]
      let step = 0
      const advance = () => {
        setUploadProgress(progressSteps[step] || 100)
        step += 1
        if (step <= progressSteps.length) {
          uploadTimer.current = window.setTimeout(advance, 170)
        }
      }
      advance()

      uploadTimer.current = window.setTimeout(() => {
        if (file.type === 'text/plain') {
          sessionStorage.setItem('kp_input', JSON.stringify({ text: value, type: 'text' }))
        } else {
          sessionStorage.setItem('kp_file_data', value)
          sessionStorage.setItem('kp_file_type', file.type)
          sessionStorage.setItem('kp_input', JSON.stringify({ text: `[FILE:${file.name}]`, type: 'file', filename: file.name }))
        }
        setUploading(false)
        router.push('/check')
      }, 1100)
    }

    reader.onerror = () => {
      setUploadError('Could not read this file. Please try again.')
      setUploading(false)
      setSelectedFile(null)
      setPreviewUrl(null)
    }

    if (file.type === 'text/plain') reader.readAsText(file)
    else reader.readAsDataURL(file)
  }

  function handleText(t:string) {
    if (uploading) return
    sessionStorage.setItem('kp_input',JSON.stringify({text:t,type:'text'}))
    router.push('/check')
  }

  return (
    <div style={{minHeight:'100dvh',background:'var(--bg)'}}>
      <Nav/>

      <div style={{maxWidth:520,margin:'0 auto',padding:'0 18px 80px'}}>

        {/* ══ HERO ══════════════════════════════ */}
        <div style={{paddingTop:32,marginBottom:24,textAlign:'center'}}>
          <p style={{fontSize:'.78rem',fontWeight:700,letterSpacing:'.09em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:12}}>
            Official letters made easy
          </p>
          <h1 className="anim-up t-hero" style={{marginBottom:18,color:'var(--ink)'}}>
            {messages.hero.title}
          </h1>
          <p className="anim-up t-body" style={{color:'var(--ink-2)',lineHeight:1.75,maxWidth:520,margin:'0 auto 20px'}}>
            {messages.hero.subtitle}
          </p>
          <div style={{display:'flex',flexWrap:'wrap',justifyContent:'center',gap:10,margin:'0 auto',maxWidth:520}}>
            {[
  messages.badges.private,
  messages.badges.signup,
  messages.badges.eu
].map((label) => (
  <span
    key={label}
    style={{
      padding:'10px 14px',
      borderRadius:999,
      background:'var(--bg-card)',
      border:'1.5px solid var(--rim)',
      fontSize:'.82rem',
      color:'var(--ink-2)'
    }}
  >
    {label}
  </span>
))}
              
            
          </div>
        </div>

        {/* ══ UPLOAD — the whole point ══════════ */}
        <div className="anim-up card" style={{animationDelay:'.18s',marginBottom:28,padding:24}}>
          <div style={{display:'flex',flexWrap:'wrap',justifyContent:'space-between',gap:16,marginBottom:24}}>
            <div style={{flex:'1 1 260px',minWidth:0}}>
              <p style={{fontSize:'.78rem',fontWeight:700,letterSpacing:'.09em',textTransform:'uppercase',color:'var(--ink-3)',marginBottom:10}}>
                Upload your official letter
              </p>
              <p style={{fontSize:'1rem',color:'var(--ink-2)',lineHeight:1.75}}>
                {messages.hero.subtitle}
              </p>
            </div>
            <div style={{flex:'0 0 190px',padding:'16px',borderRadius:'22px',background:'var(--bg-subtle)',border:'1.5px solid var(--rim-2)',minWidth:0}}>
              <p style={{fontSize:'.78rem',fontWeight:700,color:'var(--ink-3)',marginBottom:10}}>Privacy you can trust</p>
              <div style={{display:'grid',gap:12}}>
                <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                  <span style={{fontSize:'1.2rem',lineHeight:1}}>🔒</span>
                  <p style={{fontSize:'.92rem',color:'var(--ink-2)',lineHeight:1.6}}>
                    Analysed once and removed right after. No sharing.
                  </p>
                </div>
                <div style={{display:'flex',alignItems:'flex-start',gap:10}}>
                  <span style={{fontSize:'1.2rem',lineHeight:1}}>🛡</span>
                  <p style={{fontSize:'.92rem',color:'var(--ink-2)',lineHeight:1.6}}>
                    EU servers, no humans read your letter, no hidden storage.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <UploadZone onFile={handleFile} onText={handleText}/>

          {selectedFile && (
            <div className="anim-up d2" style={{marginTop:24, padding:'18px', borderRadius:'20px', background:'var(--bg-card)', border:'1.5px solid var(--rim)', boxShadow:'var(--sh-sm)'}}>
              <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                <div style={{width:52,height:52,display:'grid',placeItems:'center',borderRadius:16,background:'var(--gold-4)',color:'var(--ink)'}}>
                  <span style={{fontSize:'1.4rem'}}>📄</span>
                </div>
                <div style={{flex:'1 1 220px',minWidth:0}}>
                  <p style={{fontWeight:700,color:'var(--ink)',fontSize:'1rem',marginBottom:4,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{selectedFile.name}</p>
                  <p style={{fontSize:'.85rem',color:'var(--ink-3)',lineHeight:1.6}}>{Math.round(selectedFile.size / 1024)} KB · {selectedFile.type || 'file'}</p>
                </div>
                <button onClick={() => {
                    setSelectedFile(null)
                    setPreviewUrl(null)
                    setUploadProgress(0)
                    setUploading(false)
                    sessionStorage.removeItem('kp_file_data')
                    sessionStorage.removeItem('kp_file_type')
                  }}
                  className="btn btn-ghost btn-sm"
                >Change file</button>
              </div>
              <div style={{marginTop:18}}>
                <div style={{height:10,borderRadius:999,background:'var(--rim)',overflow:'hidden'}}>
                  <div style={{width:`${uploadProgress}%`,height:'100%',background:'linear-gradient(90deg,#f5c46b,#d7a741)',transition:'width .3s ease'}} />
                </div>
                <p style={{marginTop:10,fontSize:'.85rem',color:'var(--ink-3)'}}>
                  {uploading ? `Uploading… ${uploadProgress}%` : 'Ready to continue to analysis.'}
                </p>
              </div>
            </div>
          )}
        </div>

        <HowItWorks />

        <div className="anim-up" style={{animationDelay:'.38s'}}>
          <div style={{
            padding:'28px 22px',
            background:'var(--ink)',borderRadius:22,
            textAlign:'center',
          }}>
            <p style={{
              fontFamily:'Instrument Serif,serif',
              fontSize:'clamp(1.35rem,4vw,1.75rem)',
              color:'var(--bg)',marginBottom:7,lineHeight:1.2,
            }}>
              Photograph your letter.<br/>Understand it in seconds.
            </p>
            <p style={{fontSize:'.85rem',color:'rgba(240,237,228,.45)',marginBottom:20,lineHeight:1.55}}>
              No account needed. Free to start.
            </p>
            <button
              onClick={()=>{
                const inp=document.createElement('input')
                inp.type='file';inp.accept='image/*';inp.capture='environment'
                inp.onchange=e=>{const f=(e.target as HTMLInputElement).files?.[0];if(f) handleFile(f)}
                inp.click()
              }}
              style={{
                width:'100%',maxWidth:320,height:64,
                display:'flex',alignItems:'center',justifyContent:'center',
                gap:10,margin:'0 auto',
                background:'var(--gold)',color:'#1E1B16',
                border:'none',borderRadius:17,
                fontSize:'1.05rem',fontWeight:800,fontFamily:'inherit',
                cursor:'pointer',
                boxShadow:'0 4px 22px rgba(200,168,74,.38)',
                transition:'background .14s,transform .12s',
              }}
              onMouseOver={e=>{e.currentTarget.style.background='var(--gold-2)'}}
              onMouseOut={e=>{e.currentTarget.style.background='var(--gold)'}}
              onMouseDown={e=>{e.currentTarget.style.transform='scale(.97)'}}
              onMouseUp={e=>{e.currentTarget.style.transform='scale(1)'}}
            >
              <Camera size={20}/>📸 Take photo of your letter
            </button>
            <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:14}}>
              {[['✓','No signup'],['🔒','100% private'],['⚡','Free to start']].map(([ic,tx])=>(
                <div key={tx} style={{display:'flex',alignItems:'center',gap:4}}>
                  <span style={{fontSize:'.82rem'}}>{ic}</span>
                  <span style={{fontSize:'.75rem',color:'rgba(240,237,228,.4)',fontWeight:500}}>{tx}</span>
                </div>
              ))}
            </div>
          </div>

          <p style={{textAlign:'center',marginTop:16,fontSize:'.8rem',color:'var(--ink-3)',lineHeight:1.7}}>
            Free · Personal €9/mo · Family €19/mo ·{' '}
            <Link href="/register" style={{color:'var(--gold-4)',textDecoration:'none',fontWeight:600}}>
              Create account →
            </Link>
          </p>
        </div>
        <div className="anim-up" style={{animationDelay:'.38s'}}>
          <div style={{
            padding:'28px 22px',
            background:'var(--ink)',borderRadius:22,
            textAlign:'center',
          }}>
            <p style={{
              fontFamily:'Instrument Serif,serif',
              fontSize:'clamp(1.35rem,4vw,1.75rem)',
              color:'var(--bg)',marginBottom:7,lineHeight:1.2,
            }}>
              Photograph your letter.<br/>Understand it in seconds.
            </p>
            <p style={{fontSize:'.85rem',color:'rgba(240,237,228,.45)',marginBottom:20,lineHeight:1.55}}>
              No account needed. Free to start.
            </p>
            <button
              onClick={()=>{
                const inp=document.createElement('input')
                inp.type='file';inp.accept='image/*';inp.capture='environment'
                inp.onchange=e=>{const f=(e.target as HTMLInputElement).files?.[0];if(f) handleFile(f)}
                inp.click()
              }}
              style={{
                width:'100%',maxWidth:320,height:64,
                display:'flex',alignItems:'center',justifyContent:'center',
                gap:10,margin:'0 auto',
                background:'var(--gold)',color:'#1E1B16',
                border:'none',borderRadius:17,
                fontSize:'1.05rem',fontWeight:800,fontFamily:'inherit',
                cursor:'pointer',
                boxShadow:'0 4px 22px rgba(200,168,74,.38)',
                transition:'background .14s,transform .12s',
              }}
              onMouseOver={e=>{e.currentTarget.style.background='var(--gold-2)'}}
              onMouseOut={e=>{e.currentTarget.style.background='var(--gold)'}}
              onMouseDown={e=>{e.currentTarget.style.transform='scale(.97)'}}
              onMouseUp={e=>{e.currentTarget.style.transform='scale(1)'}}
            >
              <Camera size={20}/>📸 {messages.upload.photo}
            </button>
            <div style={{display:'flex',justifyContent:'center',gap:16,marginTop:14}}>
              {[['✓','No signup'],['🔒','100% private'],['⚡','Free to start']].map(([ic,tx])=>(
                <div key={tx} style={{display:'flex',alignItems:'center',gap:4}}>
                  <span style={{fontSize:'.82rem'}}>{ic}</span>
                  <span style={{fontSize:'.75rem',color:'rgba(240,237,228,.4)',fontWeight:500}}>{tx}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing footnote */}
          <p style={{textAlign:'center',marginTop:16,fontSize:'.8rem',color:'var(--ink-3)',lineHeight:1.7}}>
            Free · Personal €9/mo · Family €19/mo ·{' '}
            <Link href="/register" style={{color:'var(--gold-4)',textDecoration:'none',fontWeight:600}}>
              Create account →
            </Link>
          </p>
        </div>

      </div>

      <footer style={{borderTop:'1px solid var(--rim-2)',padding:'20px',textAlign:'center'}}>
        <p style={{fontSize:'.78rem',color:'var(--ink-3)',lineHeight:1.8}}>
          © {new Date().getFullYear()} KontaktPilotAI &nbsp;·&nbsp;
          <a href="/privacy" style={{color:'inherit',textDecoration:'none'}}>Privacy</a> &nbsp;·&nbsp;
          <a href="/terms" style={{color:'inherit',textDecoration:'none'}}>Terms</a> &nbsp;·&nbsp;
          <a href="mailto:hello@kontaktpilot.ai" style={{color:'inherit',textDecoration:'none'}}>Contact</a>
          <br/>🔒 Documents deleted after analysis · GDPR · EU servers
        </p>
      </footer>
    </div>
  )
}



