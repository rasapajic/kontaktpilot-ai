import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

export const metadata: Metadata = {
  title: 'KontaktPilotAI — Understand official letters without stress',
  description: 'Upload any official letter, email, or bill. We explain it simply, tell you what to do, and help you reply. In your language. Private and secure.',
  keywords: 'official letter help, understand German letter, email assistant, immigrant help, document translator',
  openGraph: {
    title: 'KontaktPilotAI — Understand official letters without stress',
    description: 'Upload a letter. We explain it simply. You know what to do.',
    type: 'website',
    locale: 'en_EU',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{__html:`(function(){var t=localStorage.getItem('kp-t')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme:dark)').matches);if(d)document.documentElement.classList.add('dark')})()` }} />
      </head>
      <body><ThemeProvider>{children}</ThemeProvider></body>
    </html>
  )
}
