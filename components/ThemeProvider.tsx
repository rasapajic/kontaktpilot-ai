'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

type T = 'light'|'dark'|'system'
const Ctx = createContext<{theme:T;resolved:'light'|'dark';set:(t:T)=>void;toggle:()=>void}>
  ({theme:'system',resolved:'light',set:()=>{},toggle:()=>{}})

export function ThemeProvider({children}:{children:ReactNode}) {
  const [t,setT]=useState<T>('system')
  const [r,setR]=useState<'light'|'dark'>('light')

  function apply(v:T) {
    const dark=v==='dark'||(v==='system'&&typeof window!=='undefined'&&window.matchMedia('(prefers-color-scheme:dark)').matches)
    document.documentElement.classList.toggle('dark',dark)
    setR(dark?'dark':'light')
  }

  useEffect(()=>{
    const s=(localStorage.getItem('kp-t') as T)||'system'
    setT(s); apply(s)
  },[])

  useEffect(()=>{
    if(t!=='system') return
    const mq=window.matchMedia('(prefers-color-scheme:dark)')
    const h=()=>apply('system')
    mq.addEventListener('change',h)
    return()=>mq.removeEventListener('change',h)
  },[t])

  function set(v:T){setT(v);localStorage.setItem('kp-t',v);apply(v)}
  function toggle(){set(r==='dark'?'light':'dark')}

  return <Ctx.Provider value={{theme:t,resolved:r,set,toggle}}>{children}</Ctx.Provider>
}
export const useTheme=()=>useContext(Ctx)
