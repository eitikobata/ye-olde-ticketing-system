# 🏰 The Kingdom's Complaints Office

> *Dear Peasan— I mean, dear kinsman! Welcome. Please, fill the small form below.*

A fantasy-themed ticket management system built to demonstrate real-world **CX Ops / Support Ops / automation engineering** skills — AI-driven triage, SLA tracking, Scrumban board, and automated notifications — wrapped in the bureaucratic absurdity of a medieval complaints office that takes 350 years to resolve a critical incident.

**Live demo:**
- 📜 File a complaint: [tickets.eitikobata.com](https://tickets.eitikobata.com)
- ⚖️ View the ledger (Scrumban board): [tickets.eitikobata.com/dashboard](https://tickets.eitikobata.com/dashboard)

---

## What this project demonstrates

This isn't just a themed toy — every piece maps to a real Support Ops / automation engineering responsibility:

| Feature | Real-world equivalent |
|---|---|
| AI-powered urgency triage (Gemini) | Automated ticket classification & prioritization |
| SLA deadline calculation per urgency tier | SLA management & escalation logic |
| Scrumban board (To Do / Investigating / Done) | Hybrid Kanban+Scrum workflow management |
| Automated confirmation emails (Resend) | Customer communication automation |
| Live-updating dashboard (Supabase Realtime) | Operational visibility without manual refresh |
| Row Level Security policies | Data access control / least-privilege design |
| Self-healing seed data reset (scheduled n8n job) | Demo environment reliability / operational resilience |

## Tech stack

- **Frontend**: Next.js (static export), TypeScript, deployed via EasyPanel/Nixpacks
- **Backend / Database**: Supabase (self-hosted) — Postgres, Realtime, Row Level Security
- **Automation**: n8n — webhook intake, AI triage, SLA logic, email dispatch, scheduled self-heal
- **AI**: Google Gemini (`gemini-flash-lite-latest`) for structured urgency/category classification
- **Email**: Resend (transactional email API, custom domain)
- **Infrastructure**: Self-hosted on a Hostinger VPS via EasyPanel (Docker/Traefik)

## Architecture

```
Complaint Form (Next.js)
        │
        ▼
  n8n Webhook Trigger
        │
        ▼
  Gemini AI — classifies urgency + category
        │
        ▼
  SLA deadline calculated (urgency-based)
        │
        ▼
  Supabase (Postgres) — ticket stored, RLS enforced
        │
        ├──▶ Resend — confirmation email dispatched
        │
        └──▶ Dashboard (Next.js + Supabase Realtime)
             updates live, no refresh needed
```

A separate scheduled n8n workflow resets the dataset back to its original 25 seeded tickets every 12 hours, keeping the public demo clean and protecting the free-tier API quotas (Gemini, Resend) from being exhausted by visitors testing the form.

## Local development

```bash
git clone https://github.com/eitikobata/ye-olde-ticketing-system.git
cd ye-olde-ticketing-system
npm install
```

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_PUBLIC_N8N_WEBHOOK_URL=your-n8n-production-webhook-url
```

```bash
npm run dev
```

Visit `http://localhost:3000` for the complaint form, and `http://localhost:3000/dashboard` for the board.

## Database schema

Two tables, RLS enabled on both:

- **`categories`** — lookup table (`monster_invasion`, `bureaucracy`, `broken_item`, `magic_malfunction`, `other`)
- **`tickets`** — `title`, `description`, `submitter_name`, `submitter_email`, `urgency`, `status`, `sla_deadline`, `category_id`, plus reserved fields (`sprint_id`, `story_points`) for future Scrumban sprint tracking.

Public (`anon`) access is read-only + insert-only on tickets — no update/delete, so only the automation layer (via `service_role`) can change ticket status. This mirrors a real least-privilege access pattern.

## Credits

Built by [Eiti Kobata](https://eitikobata.com) as part of a CX Ops / automation engineering portfolio. Companion project: [The Questionable Magic Items Shop](https://mshop.eitikobata.com).

---

*Side effects of filing a complaint may include: a strongly worded response, a 200-year wait time, or nothing at all.*