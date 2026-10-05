# Chronolyte — Lead Capture + Admin + SEO (Vercel + Neon)

Your entire site now runs on **Vercel (frontend + serverless API)** with **Neon Postgres** as the database. No Cloudflare.

## What was built

### 1. Lead Capture System (`src/components/LeadCaptureForm.tsx`)
A 3-step form at the top of the homepage:
- **Step 1 — "What do you want to build?"** — required choice (Website / SaaS / AI Automation / App / Custom AI Tool / Other)
- **Step 2 — "Tell us about it"** — optional project brief with Skip button
- **Step 3 — Contact details** — name*, email*, phone/WhatsApp, company, budget chips → saves to the admin panel with a reference number (`LD-YYYY-NNNN`) and shows a success screen

Anti-spam: honeypot field + per-IP rate limiting. The contact page and pricing-page intake forms also feed the same leads table.

### 2. Fully Working Admin Panel (`/admin`)
Default login: **admin / admin123** (change via Admin → Settings, or set `ADMIN_USERNAME` / `ADMIN_PASSWORD` env vars before first launch).

| Page | What it does now |
|---|---|
| Dashboard | Live stats from the database: leads, sources, pipeline, activity |
| Leads | All captured leads — view, edit, status/pipeline, search, filters, **CSV export** |
| Project Requests | Pricing-page intake flow with quotes, payment status, activity log |
| Projects / Services / Pricing / Testimonials | All persist to the database (no more localStorage) |
| Content, Blogs, Site Settings, Settings | Edit homepage, FAQs, pages, blog posts, users, branding — all saved |

### 3. Extensive SEO (Google + AI answer engines)
- Per-route titles/descriptions/keywords, canonical URLs, Open Graph + Twitter cards
- Rich JSON-LD: `ProfessionalService`, `WebSite`, `Service` catalog, `FAQPage`, `BreadcrumbList`, `BlogPosting`, `ItemList`
- Every main route **prerendered** to static HTML at build time (`scripts/build-seo.mjs`), blog posts included
- `sitemap.xml` (auto-includes published blog posts), `robots.txt` (welcomes GPTBot, ClaudeBot, PerplexityBot, etc.), and `llms.txt` so LLMs can extract and **recommend** Chronolyte
- Social share image: `public/og-image.png`
- 3 seeded SEO blog posts targeting "hire web developer", "fiverr alternative", "SaaS development cost" searches — manage/add more in Admin → Blogs

## Deploy to Vercel + Neon

### Step 1 — Create the Neon database
1. Sign up at [neon.tech](https://neon.tech) → create a project
2. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require`)

### Step 2 — Import to Vercel
1. Push this repo to GitHub, then "Add New Project" on [vercel.com](https://vercel.com)
2. Framework preset: **Vite** (build `npm run build`, output `dist` — already configured in `vercel.json`)
3. Add environment variables:

| Variable | Value | Required |
|---|---|---|
| `DATABASE_URL` | your Neon connection string | **Yes** |
| `SITE_URL` | `https://yourdomain.com` (enables correct canonical/OG/sitemap URLs) | Recommended |
| `ADMIN_USERNAME` | your admin login | First run only |
| `ADMIN_PASSWORD` | your admin password | First run only |
| `ADMIN_EMAIL` | your email | Optional |

The database schema is created automatically on the first API request. The default content (homepage, pricing, FAQs, blog posts, portfolio) seeds itself — your UI stays exactly as designed. Production lead capture requires `DATABASE_URL`: if it is missing, the API now returns a clear 503 instead of reporting success while storing leads in Vercel's per-instance temporary filesystem.

### Step 3 — Domains & search engines
1. Add your custom domain in Vercel → Settings → Domains
2. Visit Google Search Console → submit `https://yourdomain.com/sitemap.xml`
3. Bing Webmaster Tools → import from Search Console
4. Social previews (WhatsApp/X/LinkedIn) are automatic via `og-image.png`

## Local development

```bash
npm install
npm run dev:all     # Vite (5173) + API server (8787) with JSON-file store
```

No database needed locally — data persists to `data/chronolyte.json`. To test against Neon locally: `DATABASE_URL="postgres://..." npm run start`.

Admin panel: `http://localhost:5173/admin` (proxied to the API server).

## API surface (both styles supported)

All endpoints exist in clean form (`/api/leads`) and legacy form (`/backend/api/leads.php`) so every existing frontend call works unchanged:

`/api/auth` · `/api/leads` (+`/export` CSV) · `/api/project-requests` · `/api/settings` · `/api/faqs` · `/api/snippets` · `/api/pages` · `/api/pricing` · `/api/blogs` · `/api/projects` · `/api/project-videos` · `/api/testimonials` · `/api/services` · `/api/upload` · `/api/form-settings` · `/api/stats/dashboard` · `/api/health`
