# Testing Without Database Setup

You can test the full UI/UX flow without setting up Supabase first!

## Quick Test Steps

1. **Install Node.js** (if needed)
   - Download: https://nodejs.org/

2. **Install Dependencies**
   ```powershell
   npm install
   ```

3. **Create Minimal .env.local**
   ```env
   NEXT_PUBLIC_SITE_NAME="GYC Skills Pipeline"
   ADMIN_PASSWORD="test123"
   ```

   (Leave Supabase vars empty - the app will work in test mode)

4. **Run Dev Server**
   ```powershell
   npm run dev
   ```

5. **Test the Flow**
   - Go to http://localhost:3000
   - Click "Start Mission"
   - Complete all 9 steps
   - See your archetype result
   - Check browser console to see entry data (in test mode)

## What Works in Test Mode

✅ All UI/UX flows
✅ Quiz progression
✅ Scoring calculations
✅ Archetype determination
✅ Tier assignment (calculated but not saved)
✅ Success page with results
✅ Admin page UI (password: "test123")

## What Doesn't Work in Test Mode

❌ Data persistence (entries not saved)
❌ Admin viewing actual entries
❌ CSV export (no data to export)

## To Enable Full Functionality

Set up Supabase and add to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

Then run `supabase/schema.sql` in your Supabase SQL editor.

