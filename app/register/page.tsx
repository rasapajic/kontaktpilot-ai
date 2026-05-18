'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const LANGS = ['English','Deutsch','Srpski','Türkçe','Bosanski','Shqip','Română','العربية']

export default function RegisterPage() {
  const router = useRouter()
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [pass,setPass]=useState('')
  const [lang,setLang]=useState('English')
  const [loading,setLoading]=useState(false)
  const [error,setError]=useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(''); setLoading(true)
    try {
      const { error } = await createClient().auth.signUp({
        email, password: pass,
        options: { data: { full_name: name, preferred_language: lang } },
      })
      if (error) throw error
      router.push('/check')
    } catch (err: any) { setError(err.message || 'Could not create account.') }
    finally             { setLoading(false) }
  }

  async function google() {
    await createClient().auth.signInWithOAuth({ provider:'google', options:{ redirectTo:`${location.origin}/check` } })
  }

  return (
    <div style={{ minHeight:'100dvh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'var(--bg)', padding:'24px 20px' }}>
      <Link href="/" style={{ display:'flex', alignItems:'center', gap:10, marginBottom:36, textDecoration:'none' }}>
        <div style={{ width:42, height:42, background:'var(--ink)', borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ fontFamily:'Instrument Serif,serif', fontStyle:'italic', fontSize:'1.3rem', color:'var(--gold)' }}>K</span>
        </div>
        <span style={{ fontSize:'1.1rem', fontWeight:700, color:'var(--ink)' }}>Kontakt<span style={{ color:'var(--gold)' }}>AI</span></span>
      </Link>

      <div style={{ width:'100%', maxWidth:420 }}>
        <h1 className="t-section" style={{ color:'var(--ink)', textAlign:'center', marginBottom:6 }}>Create your account.</h1>
        <p style={{ textAlign:'center', color:'var(--ink-2)', marginBottom:28, fontSize:'1rem' }}>Free to start. No credit card needed.</p>

        <div className="card" style={{ padding:'32px 28px' }}>
          {error && (
            <div className="status-red" style={{ borderRadius:'var(--r)', padding:'14px 16px', marginBottom:20 }}>
              <p style={{ color:'var(--red)', fontSize:'.95rem' }}>{error}</p>
            </div>
          )}
          <form onSubmit={submit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div>
              <label style={{ display:'block', fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Your name</label>
              <input type="text" required value={name} onChange={e=>setName(e.target.value)} placeholder="Your full name" className="input" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Email address</label>
              <input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" className="input" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Password (min. 8 characters)</label>
              <input type="password" required minLength={8} value={pass} onChange={e=>setPass(e.target.value)} placeholder="Choose a password" className="input" />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'.78rem', fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'var(--ink-3)', marginBottom:8 }}>Your language</label>
              <select value={lang} onChange={e=>setLang(e.target.value)} className="input">
                {LANGS.map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ marginTop:4 }}>
              {loading ? 'Creating account…' : 'Create free account →'}
            </button>
          </form>

          <div style={{ display:'flex', alignItems:'center', gap:12, margin:'20px 0' }}>
            <div style={{ flex:1, height:1, background:'var(--rim-2)' }} />
            <span style={{ fontSize:'.88rem', color:'var(--ink-3)' }}>or</span>
            <div style={{ flex:1, height:1, background:'var(--rim-2)' }} />
          </div>

          <button onClick={google} className="btn btn-outline btn-full">
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>
        </div>
        <p style={{ textAlign:'center', marginTop:20, fontSize:'.95rem', color:'var(--ink-2)' }}>
          Already have an account? <Link href="/login" style={{ color:'var(--ink)', fontWeight:600, textDecoration:'none' }}>Sign in →</Link>
        </p>
        <p style={{ textAlign:'center', marginTop:10, fontSize:'.8rem', color:'var(--ink-3)' }}>
          By signing up you agree to our <a href="/terms" style={{ textDecoration:'underline', color:'inherit' }}>Terms</a> and <a href="/privacy" style={{ textDecoration:'underline', color:'inherit' }}>Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}
