# GYC Champ Signal Mapper

A gamified quiz application that classifies users into Builder/Translator/Architect archetypes and assigns hidden tiers for the GYC Skills Pipeline.

## Features

- **5-Scenario Quiz Flow**: Interactive multi-step wizard (8-10 minutes)
- **Archetype Classification**: Builder, Translator, Architect (or hybrid)
- **Hidden Tier System**: Tier 1, Tier 2, or Open Network (admin-only visibility)
- **Solar-Punk Design**: Dark theme with green gradients and gold highlights
- **Admin Dashboard**: Password-protected view with CSV export
- **Database Integration**: Supabase PostgreSQL backend

## Tech Stack

- **Next.js 14+** (App Router)
- **TypeScript**
- **TailwindCSS**
- **Supabase** (PostgreSQL)
- **React Hooks** for state management

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Get your project URL and anon key from Settings > API

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SITE_NAME="GYC Skills Pipeline"
ADMIN_PASSWORD="your-secure-password"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm start
```

## Deployment (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SITE_NAME`
   - `ADMIN_PASSWORD` (server-side only, more secure)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

## Project Structure

```
├── app/
│   ├── page.tsx              # Landing page
│   ├── mission/
│   │   └── page.tsx          # Quiz flow (9 steps)
│   ├── success/
│   │   └── page.tsx          # Success confirmation
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   └── NetworkBackground.tsx # Animated network lines
├── lib/
│   ├── supabase.ts           # Supabase client & types
│   └── scoring.ts            # Scoring & archetype logic
├── supabase/
│   └── schema.sql            # Database schema
└── package.json
```

## Quiz Flow

1. **Identity Activation** - Initial self-identification
2. **Scenario 1** - COP Negotiation Moment
3. **Scenario 2** - GYCT Cohort Engagement
4. **Scenario 3** - Fund-of-Funds Alignment
5. **Scenario 4** - Internal Disagreement (weighted x1.5)
6. **Scenario 5** - Local Implementation
7. **Skill Signals** - Shipped work, links, projects
8. **Capacity Check** - Availability, leadership, conflict handling
9. **Archetype Reveal** - Results + identity data capture

## Scoring Logic

- Each scenario adds +1 to its mapped archetype
- Scenario 4 is weighted x1.5 (leadership maturity signal)
- Primary archetype = highest score
- Hybrid if top two scores within 0.5 difference

## Tier Assignment

**Tier 1** (Core Champs):
- Primary score >= 3.0
- Availability >= 6 hours/month
- Shipped text >= 30 chars
- Handles disagreement maturely (not "Avoid it")

**Tier 2** (Track Contributors):
- Primary score >= 2.0
- Availability >= 4 hours/month

**Open Network**: Everyone else

## Admin Access

Navigate to `/admin` and enter the password set in `ADMIN_PASSWORD` (or `NEXT_PUBLIC_ADMIN_PASSWORD` as fallback).

Features:
- View all entries
- Filter by archetype
- View detailed entry information (including scores and tier)
- Export to CSV

## Security Notes

- Admin authentication uses a server-side API route (`/api/admin/auth`) that checks against `ADMIN_PASSWORD` env var
- For enhanced security in production, consider:
  - Supabase RLS policies with service role key for admin operations
  - JWT-based admin authentication with session management
  - Rate limiting on admin routes
- RLS policies in schema allow public inserts/selects. Restrict selects in production using proper RLS policies.

## License

Private project for goblue.earth

