'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface Profile {
  id: string; email: string; full_name?: string
  plan: 'free'|'personal'|'family'
  uses_this_month: number; uses_limit: number
  language: string
}

export function useUser() {
  const [user,setUser]=useState<User|null>(null)
  const [profile,setProfile]=useState<Profile|null>(null)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    const sb=createClient()
    const load=async()=>{
      try{
        const {data:{user}}=await sb.auth.getUser()
        setUser(user)
        if(user){const{data}=await sb.from('profiles').select('*').eq('id',user.id).single();setProfile(data)}
      }finally{setLoading(false)}
    }
    load()
    const{data:{subscription}}=sb.auth.onAuthStateChange(async(_,s)=>{
      setUser(s?.user??null)
      if(!s?.user){setProfile(null);setLoading(false)}
      else{const{data}=await sb.from('profiles').select('*').eq('id',s.user.id).single();setProfile(data);setLoading(false)}
    })
    return()=>subscription.unsubscribe()
  },[])

  return{user,profile,loading}
}
