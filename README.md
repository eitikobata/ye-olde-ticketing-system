# 🏰 The Kingdom's Complaints Office

> *Dear Peasan— I mean, dear kinsman! Welcome. Please, fill the small form below.*

A fantasy-themed ticket management system built to demonstrate real-world **CX Ops / Support Ops / automation engineering** skills — AI-driven triage, SLA tracking, Scrumban board, and automated notifications — wrapped in the bureaucratic absurdity of a medieval complaints office that takes 350 years to resolve a critical incident.

**Live demo:**
- 📜 File a complaint: [correio.eitikobata.com](https://correio.eitikobata.com)
- ⚖️ View the ledger (Scrumban board): [correio.eitikobata.com/dashboard](https://correio.eitikobata.com/dashboard)

---

## What this project demonstrates

This isn't just a themed toy — every piece maps to a real Support Ops / automation engineering responsibility:

| Feature | Real-world equivalent |
|---|---|
| AI-powered urgency triage (Gemini) | Automated ticket classification & prioritization |
| SLA deadline calculation per urgency tier | SLA management & escalation logic |
| Scrumban board (To Do / Investigating / Done) | Hybrid Kanban+Scrum workflow management |
| Automated confirmation emails (Resend) | Customer communication automation |
| Parameterized SQL on every write | SQL injection prevention / secure query design |
| Live-polling dashboard | Operational visibility without manual refresh |
| Self-healing seed data reset (scheduled n8n job) | Demo environment reliability / operational resilience |

## Tech stack

- **Frontend**: Next.js (static export), TypeScript, deployed via EasyPanel/Nixpacks
- **Database**: PostgreSQL (self-hosted, shared instance) — no BaaS layer, all access goes through the automation layer
- **Automation**: n8n — webhook intake, AI triage, SLA logic, parameterized SQL writes, ticket listing endpoint, scheduled self-heal
- **AI**: Google Gemini (`gemini-flash-lite-latest`) for structured urgency/category classification
- **Email**: Resend (transactional email API, custom domain)
- **Infrastructure**: Self-hosted on a Hostinger VPS via EasyPanel (Docker/Traefik)

## Architecture

```
Complaint Form (Next.js)
        │
        ▼
  n8n Webhook Trigger (POST)
        │
        ▼
  Gemini AI — classifies urgency + category
        │
        ▼
  SLA deadline calculated (urgency-based)
        │
        ▼
  Postgres — ticket inserted via parameterized query
        │
        ├──▶ Resend — confirmation email dispatched
        │
        └──▶ n8n Webhook (GET) — returns all tickets as JSON
                     │
                     ▼
             Dashboard (Next.js)
             polls every 5s, no backend framework needed
```

A separate scheduled n8n workflow resets the dataset back to its original 25 seeded tickets every 12 hours, keeping the public demo clean and protecting the free-tier API quotas (Gemini, Resend) from being exhausted by visitors testing the form.

**Why no BaaS (Supabase/Directus/etc.)?** This project started on self-hosted Supabase, but was deliberately migrated to plain Postgres + n8n: the dataset is small, access patterns are simple (public read + public insert, no user auth), and n8n already owns all the business logic. Running a 12-container BaaS stack for two tables was infrastructure overhead without a matching benefit — a good example of right-sizing the stack to the actual requirement rather than defaulting to the trendiest tool.

## Local development

```bash
git clone https://github.com/eitikobata/ye-olde-ticketing-system.git
cd ye-olde-ticketing-system
npm install
```

Create a `.env.local` file in the project root:

```
NEXT_PUBLIC_N8N_WEBHOOK_URL=your-n8n-production-webhook-url-for-submitting-tickets
NEXT_PUBLIC_N8N_TICKETS_URL=your-n8n-production-webhook-url-for-listing-tickets
```

```bash
npm run dev
```

Visit `http://localhost:3000` for the complaint form, and `http://localhost:3000/dashboard` for the board.

## Database schema

Two tables, plain PostgreSQL, no ORM:

```sql
create extension if not exists pgcrypto;

create table categories (
  id smallserial primary key,
  slug text unique not null,
  label text not null
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  category_id smallint references categories(id),
  title text not null,
  description text not null,
  submitter_name text not null,
  submitter_email text,
  urgency text not null check (urgency in ('low', 'medium', 'high', 'critical')),
  status text not null default 'to_do' check (status in ('to_do', 'investigating', 'done')),
  sla_deadline timestamptz,
  fake_wait_years int,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
```

All writes from the public form go through n8n using parameterized queries (`$1, $2...`), never string-concatenated SQL — since `title`/`description`/`submitter_name` are free text from an untrusted public form, this is a deliberate SQL-injection safeguard, not an afterthought.

## Credits

Built by [Eiti Kobata](https://eitikobata.com) as part of a CX Ops / automation engineering portfolio. Companion project: [The Questionable Magic Items Shop](https://mshop.eitikobata.com).

---

*Side effects of filing a complaint may include: a strongly worded response, a 200-year wait time, or nothing at all.*