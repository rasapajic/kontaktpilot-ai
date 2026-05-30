'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, FileUp, Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from '@/components/ThemeProvider'

/* ── Prijevodi ──────────────────────────────────────────── */
const T: Record<string, Record<string, string>> = {
  de: {
    nav_letters:  'Meine Briefe',
    hero_title:   'Verstehen Sie diesen Brief nicht?',
    hero_sub:     'Fotografieren Sie ihn und erhalten Sie eine einfache Erklärung. Strafen, Rechnungen, Mahnungen, E-Mails und Behördenbriefe — einfach erklärt.',
    trust:        '🛡 Privat · Kein Konto · Kostenlos',
    photo:        'Foto aufnehmen',
    upload:       'Datei hochladen',
    paste_ph:     'Fügen Sie Ihren Brief, Ihre E-Mail oder Ihren Text hier ein…',
    explain:      'Erklären Sie mir das →',
    trust1:       'Nur für Sie sichtbar',
    trust2:       'Erklärung in Sekunden',
    trust3:       'Jede Sprache',
    section_who:  'Für echte Menschen,\nnicht für Technik-Experten.',
    who_sub:      'Wenn offizielle Briefe Sie stressen, ist das für Sie.',
    f1_title:     'Für ältere Erwachsene',
    f1_desc:      'Große, klare Schrift. Einfache Worte. Schritt für Schritt. Kein Fachjargon.',
    f2_title:     'Für Einwanderer und Expats',
    f2_desc:      'Österreichische und europäische Behördenpost erklärt — in Ihrer Sprache.',
    f3_title:     'Für alle, die von Papierkram überfordert sind',
    f3_desc:      'Wir erklären auch die kompliziertesten Briefe einfach und klar.',
    steps_title:  'Drei Schritte. Das ist alles.',
    s1_title:     'Brief hochladen',
    s1_desc:      'Foto, Datei oder Text einfügen. Jede Sprache, jedes Format.',
    s2_title:     'Wir erklären es einfach',
    s2_desc:      'Sie sehen genau, was der Brief bedeutet, wie dringend er ist und was zu tun ist.',
    s3_title:     'Sicher handeln',
    s3_desc:      'Antwort kopieren, Erinnerung setzen oder Erklärung mit der Familie teilen.',
    types_title:  'Wir verstehen alle Arten von offiziellen Briefen.',
    types_sub:    'Von Strafzetteln bis zu Gerichtsbriefen — einfach erklärt.',
    cta_title:    'Bereit, Ihren Brief zu verstehen?',
    cta_sub:      'Kostenlos. Kein Konto. Keine Anmeldung. Privat.',
    cta_btn:      'Jetzt starten — kostenlos',
    deleted:      '🔒 Ihr Brief wird nach der Analyse gelöscht. Nichts wird gespeichert.',
    privacy:      'Datenschutz',
    terms:        'Nutzungsbedingungen',
    contact:      'Kontakt',
  },
  sr: {
    nav_letters:  'Moja pisma',
    hero_title:   'Ne razumete dokument koji ste dobili?',
    hero_sub:     'Fotografišite ga i dobijte jednostavno objašnjenje. Kazne, računi, opomene, emailovi i službena pisma — objašnjeni jednostavno.',
    trust:        '🛡 Privatno · Bez naloga · Besplatno',
    photo:        'Fotografišite pismo',
    upload:       'Otpremite fajl',
    paste_ph:     'Nalepite vaše pismo, email ili tekst ovde…',
    explain:      'Objasnite mi ovo →',
    trust1:       'Samo vi to vidite',
    trust2:       'Objašnjenje za sekunde',
    trust3:       'Svaki jezik',
    section_who:  'Za prave ljude,\nne za tehničke stručnjake.',
    who_sub:      'Ako vas zvanična pisma stresiraju, ovo je za vas.',
    f1_title:     'Za starije odrasle',
    f1_desc:      'Veliki, jasni tekst. Jednostavne reči. Korak po korak. Bez tehničkog žargona.',
    f2_title:     'Za imigrante i ekspate',
    f2_desc:      'Austrijska i evropska birokratija objašnjena — na vašem jeziku.',
    f3_title:     'Za sve koje preopterećuje papirologija',
    f3_desc:      'Razlažemo čak i najkomplikovanija pisma na jednostavne korake.',
    steps_title:  'Tri koraka. To je sve.',
    s1_title:     'Otpremite pismo',
    s1_desc:      'Foto, PDF ili tekst. Bilo koji jezik, bilo koji format.',
    s2_title:     'Mi objašnjavamo jednostavno',
    s2_desc:      'Vidite tačno šta pismo znači, koliko je hitno i šta treba uraditi.',
    s3_title:     'Delujte sa sigurnošću',
    s3_desc:      'Kopirajte odgovor, postavite podsetnik ili podelite objašnjenje sa porodicom.',
    types_title:  'Razumemo sve vrste zvaničnih pisama.',
    types_sub:    'Od kazni za parkiranje do sudskih pisama — objašnjeno jednostavno.',
    cta_title:    'Spremni da razumete vaše pismo?',
    cta_sub:      'Besplatno. Bez naloga. Bez registracije. Privatno.',
    cta_btn:      'Počnite — besplatno',
    deleted:      '🔒 Vaše pismo se briše nakon analize. Ništa se ne čuva.',
    privacy:      'Privatnost',
    terms:        'Uslovi',
    contact:      'Kontakt',
  },
  tr: {
    nav_letters:  'Mektuplarım',
    hero_title:   'Bu mektubu anlamıyor musunuz?',
    hero_sub:     'Fotoğrafını çekin ve basit bir açıklama alın. Cezalar, faturalar, ihtarlar, e-postalar ve resmi mektuplar — basitçe açıklanır.',
    trust:        '🛡 Gizli · Hesap gerekmez · Ücretsiz',
    photo:        'Fotoğraf çek',
    upload:       'Dosya yükle',
    paste_ph:     'Mektubunuzu, e-postanızı veya metni buraya yapıştırın…',
    explain:      'Bunu bana açıkla →',
    trust1:       'Sadece siz görürsünüz',
    trust2:       'Saniyeler içinde açıklama',
    trust3:       'Her dil',
    section_who:  'Gerçek insanlar için,\nteknik uzmanlar için değil.',
    who_sub:      'Resmi mektuplar sizi strese sokuyorsa, bu sizin için.',
    f1_title:     'Yaşlı yetişkinler için',
    f1_desc:      'Büyük, net yazı. Basit kelimeler. Adım adım rehberlik. Teknik jargon yok.',
    f2_title:     'Göçmenler ve expatlar için',
    f2_desc:      'Avusturya ve Avrupa bürokrasisi — kendi dilinizde açıklandı.',
    f3_title:     'Evrak işlerinden bunalan herkes için',
    f3_desc:      'En karmaşık mektupları bile basit, uygulanabilir adımlara böleriz.',
    steps_title:  'Üç adım. Hepsi bu kadar.',
    s1_title:     'Mektubu yükle',
    s1_desc:      'Fotoğraf, PDF veya metin. Her dil, her format.',
    s2_title:     'Basitçe açıklıyoruz',
    s2_desc:      'Mektubun ne anlama geldiğini, ne kadar acil olduğunu ve ne yapmanız gerektiğini görürsünüz.',
    s3_title:     'Güvenle hareket et',
    s3_desc:      'Profesyonel bir yanıt kopyalayın, hatırlatıcı ayarlayın veya aileyle paylaşın.',
    types_title:  'Her türlü resmi mektubu anlıyoruz.',
    types_sub:    'Park cezalarından mahkeme bildirimlerine — basitçe açıklandı.',
    cta_title:    'Mektubunuzu anlamaya hazır mısınız?',
    cta_sub:      'Ücretsiz. Hesap yok. Kayıt yok. Gizli.',
    cta_btn:      'Başla — ücretsiz',
    deleted:      '🔒 Mektubunuz analizden sonra silinir. Hiçbir şey saklanmaz.',
    privacy:      'Gizlilik',
    terms:        'Koşullar',
    contact:      'İletişim',
  },
  pl: {
    nav_letters:  'Moje listy',
    hero_title:   'Nie rozumiesz tego pisma?',
    hero_sub:     'Zrób zdjęcie i uzyskaj proste wyjaśnienie. Mandaty, rachunki, upomnienia, e-maile i urzędowe pisma — wyjaśnione prosto.',
    trust:        '🛡 Prywatnie · Bez konta · Bezpłatnie',
    photo:        'Zrób zdjęcie',
    upload:       'Prześlij plik',
    paste_ph:     'Wklej swój list, e-mail lub tekst tutaj…',
    explain:      'Wyjaśnij mi to →',
    trust1:       'Tylko ty to widzisz',
    trust2:       'Wyjaśnienie w sekundy',
    trust3:       'Każdy język',
    section_who:  'Dla prawdziwych ludzi,\nnie dla ekspertów technicznych.',
    who_sub:      'Jeśli oficjalne pisma cię stresują, to jest dla ciebie.',
    f1_title:     'Dla starszych dorosłych',
    f1_desc:      'Duży, czytelny tekst. Proste słowa. Krok po kroku. Zero żargonu.',
    f2_title:     'Dla imigrantów i ekspatów',
    f2_desc:      'Austriacka i europejska biurokracja wyjaśniona — w twoim języku.',
    f3_title:     'Dla każdego przytłoczonego papierologią',
    f3_desc:      'Rozkładamy nawet najbardziej skomplikowane pisma na proste kroki.',
    steps_title:  'Trzy kroki. To wszystko.',
    s1_title:     'Prześlij pismo',
    s1_desc:      'Zdjęcie, PDF lub tekst. Każdy język, każdy format.',
    s2_title:     'Wyjaśniamy prosto',
    s2_desc:      'Widzisz dokładnie, co pismo oznacza, jak pilne jest i co zrobić.',
    s3_title:     'Działaj pewnie',
    s3_desc:      'Skopiuj odpowiedź, ustaw przypomnienie lub udostępnij rodzinie.',
    types_title:  'Rozumiemy wszystkie rodzaje oficjalnych pism.',
    types_sub:    'Od mandatów po pisma sądowe — wyjaśnione prosto.',
    cta_title:    'Gotowy zrozumieć swoje pismo?',
    cta_sub:      'Bezpłatnie. Bez konta. Bez rejestracji. Prywatnie.',
    cta_btn:      'Zacznij — bezpłatnie',
    deleted:      '🔒 Twoje pismo jest usuwane po analizie. Nic nie jest przechowywane.',
    privacy:      'Prywatność',
    terms:        'Warunki',
    contact:      'Kontakt',
  },
  uk: {
    nav_letters:  'Мої листи',
    hero_title:   'Не розумієте цього листа?',
    hero_sub:     'Сфотографуйте його й отримайте просте пояснення. Штрафи, рахунки, нагадування, листи від органів влади — пояснено просто.',
    trust:        '🛡 Приватно · Без облікового запису · Безкоштовно',
    photo:        'Зробити фото',
    upload:       'Завантажити файл',
    paste_ph:     'Вставте свій лист, електронний лист або текст тут…',
    explain:      'Поясніть мені це →',
    trust1:       'Тільки ви бачите',
    trust2:       'Пояснення за секунди',
    trust3:       'Будь-яка мова',
    section_who:  'Для справжніх людей,\nне для технічних експертів.',
    who_sub:      'Якщо офіційні листи вас стресують, це для вас.',
    f1_title:     'Для людей старшого віку',
    f1_desc:      'Великий, чіткий текст. Прості слова. Покроково. Без технічного жаргону.',
    f2_title:     'Для іммігрантів та експатів',
    f2_desc:      'Австрійська та європейська бюрократія пояснена — вашою мовою.',
    f3_title:     'Для всіх, кого перевантажує паперова робота',
    f3_desc:      'Ми розбиваємо навіть найскладніші листи на прості кроки.',
    steps_title:  'Три кроки. Це все.',
    s1_title:     'Завантажте лист',
    s1_desc:      'Фото, PDF або текст. Будь-яка мова, будь-який формат.',
    s2_title:     'Ми пояснимо просто',
    s2_desc:      'Ви побачите, що означає лист, наскільки він терміновий і що робити.',
    s3_title:     'Дійте впевнено',
    s3_desc:      'Скопіюйте відповідь, встановіть нагадування або поділіться з родиною.',
    types_title:  'Ми розуміємо всі типи офіційних листів.',
    types_sub:    'Від штрафів за паркування до судових повісток — пояснено просто.',
    cta_title:    'Готові зрозуміти свого листа?',
    cta_sub:      'Безкоштовно. Без облікового запису. Без реєстрації. Приватно.',
    cta_btn:      'Почати — безкоштовно',
    deleted:      '🔒 Ваш лист видаляється після аналізу. Нічого не зберігається.',
    privacy:      'Конфіденційність',
    terms:        'Умови',
    contact:      'Контакт',
  },
  en: {
    nav_letters:  'My letters',
    hero_title:   "Don't understand this letter?",
    hero_sub:     'Take a photo and get a simple explanation. Fines, bills, reminders, emails and official letters — explained simply.',
    trust:        '🛡 Private · No account · Free',
    photo:        'Take a photo',
    upload:       'Upload file',
    paste_ph:     'Paste your letter, email or text here…',
    explain:      'Explain this to me →',
    trust1:       'Only you see this',
    trust2:       'Explanation in seconds',
    trust3:       'Any language',
    section_who:  'Built for real people,\nnot tech experts.',
    who_sub:      'If official letters make you anxious, this is for you.',
    f1_title:     'For older adults',
    f1_desc:      'Large, clear text. Simple words. Step by step. No technical jargon.',
    f2_title:     'For immigrants and expats',
    f2_desc:      'Austrian and European bureaucracy explained — in your language.',
    f3_title:     'For anyone overwhelmed by paperwork',
    f3_desc:      'We break down even the most complicated letters into simple steps.',
    steps_title:  'Three steps. That is all.',
    s1_title:     'Upload the letter',
    s1_desc:      'Photo, PDF or text. Any language, any format.',
    s2_title:     'We explain it simply',
    s2_desc:      'You see exactly what the letter means, how urgent it is and what to do.',
    s3_title:     'Act with confidence',
    s3_desc:      'Copy a reply, set a reminder, or share the explanation with family.',
    types_title:  'We understand all types of official letters.',
    types_sub:    'From parking fines to court notices — explained simply.',
    cta_title:    'Ready to understand your letter?',
    cta_sub:      'Free. No account. No signup. Private.',
    cta_btn:      'Start — it is free',
    deleted:      '🔒 Your letter is deleted after analysis. Nothing is stored.',
    privacy:      'Privacy',
    terms:        'Terms',
    contact:      'Contact',
  },
  ar: {
    nav_letters:  'رسائلي',
    hero_title:   'لا تفهم هذه الرسالة؟',
    hero_sub:     'التقط صورة واحصل على تفسير بسيط. الغرامات والفواتير والتذكيرات ورسائل الجهات الرسمية — شرح ببساطة.',
    trust:        '🛡 خاص · بدون حساب · مجاني',
    photo:        'التقط صورة',
    upload:       'رفع ملف',
    paste_ph:     'الصق رسالتك أو بريدك الإلكتروني أو النص هنا…',
    explain:      'اشرح لي هذا →',
    trust1:       'أنت فقط من يرى هذا',
    trust2:       'شرح في ثوانٍ',
    trust3:       'أي لغة',
    section_who:  'للناس الحقيقيين،\nليس للخبراء التقنيين.',
    who_sub:      'إذا كانت الرسائل الرسمية تسبب لك التوتر، فهذا من أجلك.',
    f1_title:     'لكبار السن',
    f1_desc:      'خط كبير وواضح. كلمات بسيطة. خطوة بخطوة. لا مصطلحات تقنية.',
    f2_title:     'للمهاجرين والمغتربين',
    f2_desc:      'البيروقراطية الأوروبية والنمساوية شرح — بلغتك.',
    f3_title:     'لكل من يشعر بالإرهاق من الأوراق',
    f3_desc:      'نحلل حتى أكثر الرسائل تعقيداً إلى خطوات بسيطة وقابلة للتنفيذ.',
    steps_title:  'ثلاث خطوات. هذا كل شيء.',
    s1_title:     'ارفع الرسالة',
    s1_desc:      'صورة أو PDF أو نص. أي لغة، أي تنسيق.',
    s2_title:     'نشرح ببساطة',
    s2_desc:      'سترى بالضبط ما تعنيه الرسالة ومدى إلحاحها وما يجب فعله.',
    s3_title:     'تصرف بثقة',
    s3_desc:      'انسخ ردًا أو اضبط تذكيرًا أو شارك التفسير مع العائلة.',
    types_title:  'نفهم جميع أنواع الرسائل الرسمية.',
    types_sub:    'من مخالفات الانتظار إلى إشعارات المحاكم — شرح ببساطة.',
    cta_title:    'هل أنت مستعد لفهم رسالتك؟',
    cta_sub:      'مجاني. بدون حساب. بدون تسجيل. خاص.',
    cta_btn:      'ابدأ — مجانًا',
    deleted:      '🔒 يتم حذف رسالتك بعد التحليل. لا يتم تخزين أي شيء.',
    privacy:      'الخصوصية',
    terms:        'الشروط',
    contact:      'اتصل بنا',
  },
}

const LANGS = [
  { code:'de', flag:'🇩🇪' },
  { code:'sr', flag:'🇷🇸' },
  { code:'tr', flag:'🇹🇷' },
  { code:'pl', flag:'🇵🇱' },
  { code:'uk', flag:'🇺🇦' },
  { code:'en', flag:'🇬🇧' },
  { code:'ar', flag:'🇸🇦' },
]

function t(lang: string, key: string): string {
  return T[lang]?.[key] ?? T['de'][key] ?? key
}

/* ════════════════════════════════════════════════
   LANDING PAGE
════════════════════════════════════════════════ */
export default function LandingPage() {
  const router = useRouter()
  const { resolved, toggle } = useTheme()
  const isDark = resolved === 'dark'

  const [lang, setLang]       = useState('de')
  const [mode, setMode]       = useState<'upload'|'paste'>('upload')
  const [pasted, setPasted]   = useState('')
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Auto-detect language on first load
  useEffect(() => {
    const bl = navigator.language?.slice(0, 2).toLowerCase()
    if (T[bl]) setLang(bl)
    else setLang('de')
  }, [])

  const isRTL = lang === 'ar'

  function handleFile(file: File) {
    const r = new FileReader()
    if (file.type === 'text/plain') {
      r.onload = e => {
        sessionStorage.setItem('kp_input', JSON.stringify({ text: e.target?.result, type: 'text' }))
        sessionStorage.setItem('kp_lang', lang)
        router.push('/check')
      }
      r.readAsText(file)
    } else {
      r.onload = e => {
        sessionStorage.setItem('kp_file_data', e.target?.result as string)
        sessionStorage.setItem('kp_file_type', file.type)
        sessionStorage.setItem('kp_input', JSON.stringify({ text: `[FILE:${file.name}]`, type: 'file', filename: file.name }))
        sessionStorage.setItem('kp_lang', lang)
        router.push('/check')
      }
      r.readAsDataURL(file)
    }
  }

  function handleText(text: string) {
    sessionStorage.setItem('kp_input', JSON.stringify({ text, type: 'text' }))
    sessionStorage.setItem('kp_lang', lang)
    router.push('/check')
  }

  function openCamera() {
    const inp = document.createElement('input')
    inp.type = 'file'; inp.accept = 'image/*'; inp.capture = 'environment'
    inp.onchange = e => { const f = (e.target as HTMLInputElement).files?.[0]; if (f) handleFile(f) }
    inp.click()
  }

  const bg  = '#F6F3EE'
  const ink = '#1C1A16'
  const ink2 = '#5C5850'
  const ink3 = '#9C9890'
  const gold = '#C8A84A'

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight: '100dvh', background: bg, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif' }}>

      {/* ── Nav ─────────────────────────────── */}
      <nav style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: 'rgba(246,243,238,.95)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(28,26,22,.08)', position: 'sticky', top: 0, zIndex: 50, gap: 12 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 34, height: 34, background: ink, borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontSize: '1.1rem', color: gold, lineHeight: 1 }}>K</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '.95rem', color: ink, letterSpacing: '-.01em' }}>
            KontaktPilot<span style={{ color: gold }}>AI</span>
          </span>
        </div>

        {/* Language flags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'nowrap', overflowX: 'auto' }}>
          {LANGS.map(l => (
            <button key={l.code} onClick={() => setLang(l.code)} title={l.code.toUpperCase()}
              style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: lang === l.code ? 'rgba(200,168,74,.15)' : 'transparent', border: lang === l.code ? '1.5px solid rgba(200,168,74,.5)' : '1.5px solid transparent', borderRadius: 9, cursor: 'pointer', fontSize: '1.2rem', lineHeight: 1, transition: '.12s', flexShrink: 0 }}>
              {l.flag}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
          <Link href="/home" style={{ padding: '7px 12px', fontSize: '.85rem', fontWeight: 600, color: ink2, textDecoration: 'none', borderRadius: 9, background: 'rgba(28,26,22,.06)', whiteSpace: 'nowrap' }}>
            {t(lang, 'nav_letters')}
          </Link>
          <button onClick={toggle} style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', color: ink3, borderRadius: 8 }}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────── */}
      <section style={{ padding: '52px 24px 56px', maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        {/* Trust badge */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', background: 'rgba(200,168,74,.12)', borderRadius: 999, marginBottom: 24 }}>
          <span style={{ fontSize: '.85rem', fontWeight: 700, color: '#7A5800', letterSpacing: '.03em' }}>
            {t(lang, 'trust')}
          </span>
        </div>

        <h1 style={{ fontFamily: 'Georgia,"Times New Roman",serif', fontSize: 'clamp(2.2rem,6vw,3.6rem)', fontWeight: 400, lineHeight: 1.1, letterSpacing: '-.025em', color: ink, marginBottom: 20 }}>
          {t(lang, 'hero_title')}
        </h1>

        <p style={{ fontSize: 'clamp(1.05rem,2.5vw,1.25rem)', color: ink2, lineHeight: 1.7, maxWidth: 520, margin: '0 auto 40px' }}>
          {t(lang, 'hero_sub')}
        </p>

        {/* Upload area */}
        <div style={{ width: '100%', maxWidth: 560, margin: '0 auto' }}>
          {/* Mode pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
            {([['upload', '📎'], ['paste', '📋']] as const).map(([id, ic]) => (
              <button key={id} onClick={() => setMode(id)}
                style={{ padding: '10px 20px', borderRadius: 999, border: 'none', background: mode === id ? ink : 'rgba(28,26,22,.07)', color: mode === id ? '#F6F3EE' : ink2, fontWeight: mode === id ? 700 : 500, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', transition: '.14s' }}>
                {ic}  {id === 'upload' ? t(lang, 'upload') : t(lang, 'paste_ph').slice(0, 12) + '…'}
              </button>
            ))}
          </div>

          {mode === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={openCamera}
                style={{ width: '100%', height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, background: ink, color: '#F6F3EE', border: 'none', borderRadius: 20, fontSize: '1.15rem', fontWeight: 800, fontFamily: 'inherit', cursor: 'pointer', boxShadow: '0 4px 20px rgba(28,26,22,.18)', WebkitTapHighlightColor: 'transparent' }}
                onTouchStart={e => e.currentTarget.style.opacity = '.85'}
                onTouchEnd={e => e.currentTarget.style.opacity = '1'}>
                <Camera size={26} style={{ color: gold, flexShrink: 0 }} />
                {t(lang, 'photo')}
              </button>
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
                onClick={() => fileRef.current?.click()}
                role="button" tabIndex={0}
                style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, border: `2px dashed ${dragging ? gold : 'rgba(28,26,22,.18)'}`, borderRadius: 16, background: dragging ? 'rgba(200,168,74,.05)' : 'transparent', cursor: 'pointer', color: ink2, fontSize: '1rem', fontWeight: 500, transition: '.14s' }}>
                <FileUp size={18} /> {t(lang, 'upload')}
                <input ref={fileRef} type="file" accept=".pdf,.txt,.png,.jpg,.jpeg,.webp,.heic,image/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
              </div>
            </div>
          )}

          {mode === 'paste' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <textarea value={pasted} onChange={e => setPasted(e.target.value)} rows={6}
                placeholder={t(lang, 'paste_ph')}
                style={{ width: '100%', padding: '18px 20px', background: 'rgba(255,255,255,.9)', border: '2px solid rgba(28,26,22,.15)', borderRadius: 16, fontFamily: 'inherit', fontSize: '1.05rem', color: ink, lineHeight: 1.7, outline: 'none', resize: 'none', boxSizing: 'border-box' as const, transition: 'border-color .15s', direction: 'ltr' }}
                onFocus={e => e.target.style.borderColor = gold}
                onBlur={e => e.target.style.borderColor = 'rgba(28,26,22,.15)'} />
              <button onClick={() => pasted.trim() && handleText(pasted.trim())} disabled={!pasted.trim()}
                style={{ width: '100%', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', background: pasted.trim() ? ink : 'rgba(28,26,22,.1)', color: pasted.trim() ? '#F6F3EE' : ink3, border: 'none', borderRadius: 16, fontSize: '1.1rem', fontWeight: 800, fontFamily: 'inherit', cursor: pasted.trim() ? 'pointer' : 'not-allowed', transition: '.15s' }}>
                {t(lang, 'explain')}
              </button>
            </div>
          )}

          {/* Trust strip */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px 20px', marginTop: 18 }}>
            {[['🔒', 'trust1'], ['⚡', 'trust2'], ['🌍', 'trust3']].map(([ic, key]) => (
              <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: '1rem' }}>{ic}</span>
                <span style={{ fontSize: '.88rem', color: ink2, fontWeight: 500 }}>{t(lang, key)}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who is this for ─────────────────── */}
      <section style={{ background: '#fff', padding: '56px 24px', borderTop: '1px solid rgba(28,26,22,.07)' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 400, color: ink, textAlign: 'center', lineHeight: 1.2, letterSpacing: '-.02em', marginBottom: 12, whiteSpace: 'pre-line' }}>
            {t(lang, 'section_who')}
          </h2>
          <p style={{ textAlign: 'center', fontSize: '1.05rem', color: ink2, maxWidth: 420, margin: '0 auto 40px', lineHeight: 1.65 }}>
            {t(lang, 'who_sub')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {[['👵', 'f1_title', 'f1_desc'], ['🌍', 'f2_title', 'f2_desc'], ['😰', 'f3_title', 'f3_desc']].map(([icon, title, desc]) => (
              <div key={title} style={{ display: 'flex', alignItems: 'flex-start', gap: 18 }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, flexShrink: 0, background: 'rgba(200,168,74,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                  {icon}
                </div>
                <div>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, color: ink, marginBottom: 4 }}>{t(lang, title)}</p>
                  <p style={{ fontSize: '.95rem', color: ink2, lineHeight: 1.6 }}>{t(lang, desc)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Steps ───────────────────────────── */}
      <section style={{ padding: '56px 24px', maxWidth: 680, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.5rem,4vw,2.2rem)', fontWeight: 400, color: ink, textAlign: 'center', lineHeight: 1.2, letterSpacing: '-.02em', marginBottom: 40 }}>
          {t(lang, 'steps_title')}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[['1', '📸', 's1_title', 's1_desc'], ['2', '✨', 's2_title', 's2_desc'], ['3', '✅', 's3_title', 's3_desc']].map(([n, ic, title, desc], i) => (
            <div key={n} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, paddingBottom: i < 2 ? 28 : 0, marginBottom: i < 2 ? 28 : 0, borderBottom: i < 2 ? '1px solid rgba(28,26,22,.07)' : 'none' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, background: ink, color: gold, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Georgia,serif', fontSize: '1.3rem', fontWeight: 400 }}>
                {n}
              </div>
              <div>
                <p style={{ fontSize: '1.15rem', fontWeight: 700, color: ink, marginBottom: 5 }}>{ic} {t(lang, title)}</p>
                <p style={{ fontSize: '1rem', color: ink2, lineHeight: 1.65 }}>{t(lang, desc)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Letter types ────────────────────── */}
      <section style={{ background: ink, padding: '56px 24px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.5rem,4vw,2.1rem)', fontWeight: 400, color: 'rgba(242,237,228,.9)', textAlign: 'center', lineHeight: 1.2, letterSpacing: '-.02em', marginBottom: 8 }}>
            {t(lang, 'types_title')}
          </h2>
          <p style={{ textAlign: 'center', fontSize: '1rem', color: 'rgba(242,237,228,.5)', marginBottom: 36, lineHeight: 1.6 }}>
            {t(lang, 'types_sub')}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 10 }}>
            {[['👮', 'Parking fines'], ['🏛', 'Tax notices'], ['⚖️', 'Debt collectors'], ['🏥', 'Insurance'], ['📻', 'Broadcasting fees'], ['🏠', 'Rent & housing'], ['💼', 'AMS / Job centre'], ['📡', 'Telecom bills'], ['⚠️', 'Scam detection'], ['⚖️', 'Court letters']].map(([ic, lbl]) => (
              <div key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(255,255,255,.05)', borderRadius: 12, border: '1px solid rgba(255,255,255,.08)' }}>
                <span style={{ fontSize: '1.3rem', lineHeight: 1 }}>{ic}</span>
                <span style={{ fontSize: '.88rem', color: 'rgba(242,237,228,.75)', fontWeight: 500 }}>{lbl}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────── */}
      <section style={{ padding: '64px 24px 80px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Georgia,serif', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 400, color: ink, lineHeight: 1.2, letterSpacing: '-.02em', marginBottom: 16 }}>
          {t(lang, 'cta_title')}
        </h2>
        <p style={{ fontSize: '1.05rem', color: ink2, marginBottom: 32, lineHeight: 1.6 }}>
          {t(lang, 'cta_sub')}
        </p>
        <button onClick={() => router.push('/check')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '18px 36px', background: ink, color: '#F6F3EE', border: 'none', borderRadius: 16, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-.01em', boxShadow: '0 4px 20px rgba(28,26,22,.18)', cursor: 'pointer', fontFamily: 'inherit', WebkitTapHighlightColor: 'transparent' }}>
          <Camera size={22} style={{ color: gold }} />
          {t(lang, 'cta_btn')}
        </button>
        <p style={{ marginTop: 20, fontSize: '.82rem', color: ink3 }}>
          {t(lang, 'deleted')}
        </p>
      </section>

      {/* ── Footer ──────────────────────────── */}
      <footer style={{ borderTop: '1px solid rgba(28,26,22,.08)', padding: '28px 24px 40px' }}>
        <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, background: ink, borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: 'Georgia,serif', fontStyle: 'italic', fontSize: '.9rem', color: gold }}>K</span>
            </div>
            <span style={{ fontWeight: 700, fontSize: '.9rem', color: ink }}>KontaktPilot<span style={{ color: gold }}>AI</span></span>
          </div>
          <p style={{ fontSize: '.8rem', color: ink3 }}>
            <a href="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>{t(lang, 'privacy')}</a>
            {' · '}
            <a href="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>{t(lang, 'terms')}</a>
            {' · '}
            <a href="mailto:hello@kontaktpilot.ai" style={{ color: 'inherit', textDecoration: 'none' }}>{t(lang, 'contact')}</a>
          </p>
        </div>
      </footer>

    </div>
  )
}
