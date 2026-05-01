# Quick Start - Update Existing Deployment

## For Existing Deployments

If you already have Welfare Flow running, follow these steps to update:

### Step 1: Update Database (2 minutes)

1. Go to your Supabase Dashboard
2. Click "SQL Editor" in sidebar
3. Click "New query"
4. Open `RUN_IN_SQL_EDITOR.sql` from this package
5. Copy all content and paste into SQL Editor
6. Click "Run" (or Ctrl+Enter)
7. Wait for "Success. No rows returned"

### Step 2: Deploy Frontend (3 minutes)

**Option A: Vercel**
```bash
cd frontend
vercel --prod
```

**Option B: Netlify**
```bash
cd frontend
netlify deploy --prod --dir=.
```

**Option C: Manual Upload**
- Upload all files from `frontend/` folder to your hosting

### Done!

Your app is now updated with:
- ✅ Defaulters page in admin
- ✅ Fixed KES currency
- ✅ Mobile dashboard improvements
- ✅ All latest features

---

## For New Deployments

If this is your first time deploying Welfare Flow:

### Prerequisites
- Supabase account
- Vercel or Netlify account
- Node.js 18+
- Supabase CLI: `npm install -g supabase`

### Step 1: Create Supabase Project (5 min)

1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Fill in project details
4. Wait for initialization
5. Copy Project URL and anon key from Settings > API

### Step 2: Deploy Database (5 min)

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run all migrations
supabase db push
```

### Step 3: Deploy Edge Functions (10 min)

Set environment variables in Supabase Dashboard > Edge Functions > Secrets:
- `OPENAI_API_KEY` - For AI assistant
- `AFRICASTALKING_API_KEY` - For SMS
- `AFRICASTALKING_USERNAME` - For SMS

Deploy functions:
```bash
# Windows
.\deploy-functions.ps1

# Linux/Mac
bash deploy-functions.sh
```

### Step 4: Deploy Frontend (5 min)

Create `.env` in `frontend/` folder:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Deploy:
```bash
cd frontend
vercel --prod
```

### Step 5: Create Admin User (2 min)

1. Open your deployed app
2. Sign up with your email
3. Verify email
4. In Supabase Dashboard > Table Editor > `profiles`
5. Find your user and set `role` = `admin`
6. Log out and log back in

### Done!

Your Welfare Flow app is now live!

---

**Estimated Time:**
- Update existing: 5 minutes
- New deployment: 30 minutes
