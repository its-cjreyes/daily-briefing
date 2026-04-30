# Briefing

A daily automated morning intelligence briefing delivered as a digest email and a dark-mode editorial web app. Claude searches the web, writes six sections of deep coverage, stores the result in Vercel KV, and emails you a digest with deep-links to the full web app.

---

## Architecture

```
Vercel Cron (7 AM ET)
  → GET /api/generate
      → Claude + web search → structured JSON
      → Vercel KV  (briefing:YYYY-MM-DD)
      → SendGrid email digest

User opens email → "Dive deeper →" link
  → /briefing/[date]?section=[slug]
      → auto-scrolls to section
      → opens chat sidebar
          → POST /api/chat (streaming)
```

---

## Prerequisites

- [Vercel](https://vercel.com) account (Hobby tier works for testing; Pro recommended for the 5-min cron timeout)
- [Anthropic API key](https://console.anthropic.com) with access to `claude-sonnet-4-6`
- [SendGrid](https://sendgrid.com) account with a verified sender email
- Node.js 20+

---

## Local development

```bash
# 1. Clone and install
npm install

# 2. Copy env vars
cp .env.example .env.local
# Fill in all values (see below)

# 3. Run the dev server
npm run dev
```

---

## Environment variables

Copy `.env.example` to `.env.local` and fill in every value:

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | From [console.anthropic.com](https://console.anthropic.com) |
| `SENDGRID_API_KEY` | From the SendGrid dashboard → Settings → API Keys |
| `SENDGRID_FROM_EMAIL` | The verified sender address (e.g. `briefing@yourdomain.com`) |
| `RECIPIENT_EMAIL` | Where the daily digest is delivered |
| `KV_URL` | Auto-set when you link a Vercel KV store (see below) |
| `KV_REST_API_URL` | Auto-set by Vercel KV |
| `KV_REST_API_TOKEN` | Auto-set by Vercel KV |
| `KV_REST_API_READ_ONLY_TOKEN` | Auto-set by Vercel KV |
| `CRON_SECRET` | A random secret — generate with `openssl rand -hex 32` |
| `APP_URL` | Your production URL, e.g. `https://your-app.vercel.app` |

---

## Anthropic setup

1. Create an account at [console.anthropic.com](https://console.anthropic.com)
2. Generate an API key under **API Keys**
3. Ensure your account has access to `claude-sonnet-4-6` and the **web search beta** (`web-search-2025-03-05`)
4. Set `ANTHROPIC_API_KEY` in your env

> **Note on web search:** The briefing generator uses Anthropic's native `web_search_20250305` tool (beta). If your account doesn't have beta access yet, the generate route will fall back to Claude's knowledge up to its training cutoff and still produce a valid briefing — it just won't include live news.

---

## SendGrid setup

1. Create a free account at [sendgrid.com](https://sendgrid.com)
2. **Verify a sender:** Go to **Settings → Sender Authentication** and verify the email address or domain you'll send from. Set this as `SENDGRID_FROM_EMAIL`.
3. Create an API key under **Settings → API Keys** with **Mail Send** permissions
4. Set `SENDGRID_API_KEY` and `RECIPIENT_EMAIL` in your env

---

## Vercel KV setup

1. In your Vercel project dashboard, go to the **Storage** tab
2. Create a new **KV** database
3. Click **Connect to Project** — Vercel automatically injects all four `KV_*` env variables
4. Pull them locally: `vercel env pull .env.local`

---

## Deploying to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (first time — follow the prompts)
vercel

# Set production env vars
vercel env add ANTHROPIC_API_KEY
vercel env add SENDGRID_API_KEY
vercel env add SENDGRID_FROM_EMAIL
vercel env add RECIPIENT_EMAIL
vercel env add CRON_SECRET
vercel env add APP_URL

# Deploy to production
vercel --prod
```

The `vercel.json` cron config schedules `/api/generate` at `0 12 * * *` (12:00 UTC = 7:00 AM ET). Vercel automatically activates it once the project is deployed.

> **Vercel Hobby vs Pro:** Hobby plan allows one cron job but caps function execution at 60 seconds. Generating a briefing with web search typically takes 60–180 seconds. **Pro plan** (or higher) is strongly recommended; it supports a `maxDuration` of 300 seconds.

---

## Triggering a test generation

You can fire the generate route manually at any time:

```bash
# Via curl (replace with your actual values)
curl "https://your-app.vercel.app/api/generate?secret=YOUR_CRON_SECRET"

# Or locally (start dev server first)
curl "http://localhost:3000/api/generate?secret=YOUR_CRON_SECRET"
```

This will:
1. Call Claude with web search to generate today's briefing
2. Store it in Vercel KV
3. Send the digest email
4. Return JSON confirming success

Then visit `http://localhost:3000/` to see the result.

---

## Project structure

```
app/
  layout.tsx                  # Root layout — fonts, global styles
  page.tsx                    # Redirects / → /briefing/[today]
  not-found.tsx               # 404 page
  globals.css                 # Tailwind + grain texture + scrollbar styles
  api/
    generate/route.ts         # Cron endpoint — generates, stores, emails
    chat/route.ts             # Streaming chat endpoint
  briefing/
    [date]/page.tsx           # Server component — fetches from KV
components/
  BriefingPageClient.tsx      # Client orchestrator — state, deep-linking
  BriefingSection.tsx         # Single section (label, headline, body, chat button)
  Masthead.tsx                # "Briefing" wordmark + date
  ChatSidebar.tsx             # Sliding chat panel with streaming responses
lib/
  types.ts                    # Shared TypeScript types
  kv.ts                       # Vercel KV read/write helpers
  anthropic.ts                # Briefing generation (agentic loop + JSON parsing)
  email.ts                    # SendGrid HTML email builder + sender
vercel.json                   # Cron schedule
```

---

## Sections

| Slug | Label |
|---|---|
| `geopolitics` | Geopolitics |
| `canadian-politics` | Canadian Politics |
| `ai-tech` | AI & Tech |
| `markets-economy` | Markets & Economy |
| `culture` | Culture |
| `deep-dive` | One Thing Worth Understanding Deeply |
