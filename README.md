# KontaktPilotAI

Calm AI assistant that helps people understand official letters, emails, bills and documents.

**Built for:** older people, immigrants, anyone stressed by official communication.

**One flow:** Upload letter → AI explains simply → Get a reply.

---

## Deploy in 4 steps

### 1. Run locally

```bash
git clone https://github.com/YOUR_USERNAME/kontaktpilot-ai
cd kontaktpilot-ai
cp .env.example .env.local
# Fill in keys (see steps 2+3)
npm install
npm run dev
# Open http://localhost:3000
```

### 2. Set up Supabase

1. Go to **supabase.com** → Create new project → Region: **eu-central-1** (Frankfurt, GDPR)
2. Go to **SQL Editor** → paste `supabase-schema.sql` → Run
3. Go to **Settings → API** → copy `Project URL` and `anon public` key
4. Paste into `.env.local`

### 3. Get OpenAI key

1. **platform.openai.com** → API Keys → Create new key
2. Add $10 credit (lasts ~10,000 uses with gpt-4o-mini)
3. Paste into `.env.local` as `OPENAI_API_KEY`

### 4. Deploy to Vercel

1. Push to GitHub
2. **vercel.com** → New Project → Import your repo
3. Add all 4 environment variables from `.env.local`
4. Deploy — live in 2 minutes

**Domain:** Vercel → Settings → Domains → add your domain → copy 2 DNS records to your registrar.

---

## App structure

```
app/
  page.tsx              Landing page with upload above the fold
  check/page.tsx        Upload/paste page
  result/page.tsx       Explanation results with status cards
  login/page.tsx
  register/page.tsx
  api/
    explain/route.ts    Main AI analysis (supports images + text)
    ai/route.ts         Reply / translate helpers

components/
  ThemeProvider.tsx

lib/supabase.ts
hooks/useUser.ts
supabase-schema.sql
```

---

## Design principles

- **18px base font** — readable for older eyes
- **60px minimum button height** — easy touch targets
- **Single column, max 600px** — mobile-first always
- **No sidebar, no dashboard** — one action at a time
- **Warm off-white backgrounds** — never clinical
- **Color-coded status cards** — instant emotional clarity
- **AI tone: calm human** — never robotic or legal

---

## Status card logic

| Color | Urgency | When to use |
|-------|---------|-------------|
| 🟢 Green | none/low | No action needed |
| 🟡 Yellow | medium | Worth attention, not urgent |
| 🟠 Orange | high | Action required within days |
| 🔴 Red | scam | Possible fraud or serious issue |
