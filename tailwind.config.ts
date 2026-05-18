import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT:'#F6F3EE', card:'#FFFFFF', raised:'#FFFFFF', subtle:'#EDE9E0', deep:'#E4DFD4' },
        ink: { DEFAULT:'#1E1B16', '2':'#4A4640', '3':'#8A8680', '4':'#C4BFB8' },
        gold: { DEFAULT:'#C8A84A', '2':'#E8CC7A', '3':'#FBF6E6', '4':'#9A7C2C' },
        rim: { DEFAULT:'#DDD8CF', '2':'#EAE6DF' },
        ok:   { DEFAULT:'#2E7D52', bg:'#EDF7F2', rim:'#A8D8BC' },
        warn: { DEFAULT:'#8A6000', bg:'#FFFBEB', rim:'#F0D080' },
        alert:{ DEFAULT:'#A04800', bg:'#FFF5EB', rim:'#F0A860' },
        danger:{ DEFAULT:'#9A2828', bg:'#FEF2F2', rim:'#F0A0A0' },
      },
      fontFamily: {
        sans:  ['DM Sans','system-ui','-apple-system','sans-serif'],
        serif: ['Instrument Serif','Georgia','serif'],
      },
      fontSize: {
        '2xs': ['.7rem',   {lineHeight:'1.1rem'}],
        xs:    ['.82rem',  {lineHeight:'1.25rem'}],
        sm:    ['.9rem',   {lineHeight:'1.5rem'}],
        base:  ['1rem',    {lineHeight:'1.65rem'}],
        lg:    ['1.1rem',  {lineHeight:'1.6rem'}],
        xl:    ['1.25rem', {lineHeight:'1.5rem'}],
        '2xl': ['1.5rem',  {lineHeight:'1.3rem'}],
        '3xl': ['2rem',    {lineHeight:'1.2rem'}],
        '4xl': ['2.5rem',  {lineHeight:'1.1rem'}],
        '5xl': ['3.25rem', {lineHeight:'1.05rem'}],
      },
      borderRadius: {
        sm:'10px', DEFAULT:'16px', md:'20px', lg:'28px', xl:'36px', '2xl':'48px', full:'9999px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(30,27,22,.06),0 1px 2px rgba(30,27,22,.04)',
        md: '0 4px 16px rgba(30,27,22,.08),0 2px 4px rgba(30,27,22,.04)',
        lg: '0 8px 32px rgba(30,27,22,.10),0 4px 8px rgba(30,27,22,.05)',
        xl: '0 16px 48px rgba(30,27,22,.12),0 8px 16px rgba(30,27,22,.06)',
        gold: '0 0 0 4px rgba(200,168,74,.18)',
      },
      animation: {
        'fade-up':  '_fadeUp .6s cubic-bezier(.22,1,.36,1) both',
        'fade-in':  '_fadeIn .45s ease both',
        'slide-up': '_slideUp .4s cubic-bezier(.22,1,.36,1) both',
        'spin':     '_spin 1s linear infinite',
        'breathe':  '_breathe 3s ease-in-out infinite',
        'shimmer':  '_shimmer 3.5s linear infinite',
        'pulse':    '_pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
export default config
