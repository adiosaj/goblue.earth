# Quick Setup Guide for Testing

## Prerequisites

1. **Install Node.js** (if not already installed)
   - Download from: https://nodejs.org/
   - Install LTS version (v20 or v18)
   - This will also install `npm`

2. **Verify Installation**
   ```powershell
   node --version
   npm --version
   ```

## Setup Steps

### 1. Install Dependencies
```powershell
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SITE_NAME="GYC Skills Pipeline"
ADMIN_PASSWORD="test123"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

**For Testing Without Supabase:**
You can test the UI flow without a database by temporarily modifying the code, but full functionality requires Supabase.

### 3. Set Up Supabase (Required for Full Testing)

1. Go to https://supabase.com and create a free account
2. Create a new project
3. Go to SQL Editor and run the contents of `supabase/schema.sql`
4. Go to Settings > API and copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. Run Development Server

```powershell
npm run dev
```

The app will be available at: **http://localhost:3000**

## Testing Checklist

- [ ] Landing page loads (`/`)
- [ ] "Start Mission" button works
- [ ] Quiz flow progresses through all 9 steps
- [ ] Can select answers for each scenario
- [ ] Archetype is calculated and displayed
- [ ] Success page shows results
- [ ] Admin page requires password (`/admin`)
- [ ] Admin can view entries (after submitting quiz)
- [ ] CSV export works

## Quick Test Without Database

To test the UI/UX flow without database setup:

1. Comment out the Supabase insert in `app/mission/page.tsx` (around line 200)
2. Still calculate scores and show archetype
3. Skip the database save step

## Troubleshooting

**Port 3000 already in use:**
```powershell
npm run dev -- -p 3001
```

**TypeScript errors:**
```powershell
npm run build
```

**Supabase connection issues:**
- Check your `.env.local` file has correct values
- Verify Supabase project is active
- Check browser console for connection errors

