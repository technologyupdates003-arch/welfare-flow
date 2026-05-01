# Welfare Flow - Complete Deployment Guide 2026

## Package Contents

This deployment package includes:
1. **Frontend Build** - Production-ready React application
2. **Supabase Functions** - All Edge Functions
3. **Database Migrations** - All SQL migrations including latest updates
4. **Configuration Files** - Environment setup and routing

## Latest Updates Included

### April 17, 2026 Updates:
- ✅ Beneficiary request system
- ✅ News popup with read tracking
- ✅ Profile pictures for members
- ✅ Enhanced member dashboard with gradient cards
- ✅ Meeting minutes with signature upload
- ✅ AI assistant for minute writing
- ✅ Searchable attendee selection
- ✅ Beneficiary requests in admin dashboard
- ✅ Meeting minutes in downloads page
- ✅ Page reload fix (no more 404 errors)

## Deployment Steps

### Step 1: Deploy Frontend

#### Option A: Vercel (Recommended)
1. Go to https://vercel.com
2. Click "New Project"
3. Import from Git or upload the `frontend` folder
4. Configure:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
6. Deploy

#### Option B: Netlify
1. Go to https://netlify.com
2. Drag and drop the `frontend` folder
3. Configure build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add Environment Variables (same as above)
5. Deploy

#### Option C: Static Hosting (Shared Hosting)
1. Upload contents of `frontend` folder to your web server
2. Ensure `.htaccess` or equivalent is configured for SPA routing
3. Update environment variables in the deployed files

### Step 2: Setup Supabase

#### 2.1 Create Supabase Project
1. Go to https://supabase.com
2. Create new project
3. Note your project URL and anon key

#### 2.2 Run Migrations
Run migrations in order from the `supabase/migrations` folder:

```sql
-- Run these in Supabase SQL Editor in order:
1. 20260411151135_02adb8a3-b184-4e45-915d-b6f3edeb1348.sql
2. 20260411200451_10aa4cf4-fbe9-445b-945c-6c6751d02a5e.sql
3. 20260411201950_9e8a16cc-a910-4448-a00e-37922b7587fa.sql
4. 20260412055320_32a945fb-eecd-4baa-b9d9-31643294fe27.sql
5. 20260413053943_16706a5c-0ebb-471e-b161-f114c01fd271.sql
6. 20260413053959_cdc92652-86de-4918-9b9c-5e1546403624.sql
7. 20260413055330_dea4daa3-cb0d-4449-9de6-a2150562c9cd.sql
8. 20260414050014_a0b3bdb1-6a4c-4063-9f95-84ba884fd9e7.sql
9. 20260414092854_2cbc88ec-7450-4024-a1a4-abfe450e782c.sql
10. 20260415053920_c48e5110-3493-4386-b187-81747d899c4a.sql
11. 20260416_add_office_bearer_roles.sql
12. 20260416_add_role_policies.sql
13. 20260416_add_minutes_table.sql
14. 20260417_add_beneficiary_requests.sql
15. 20260417_add_news_read_tracking.sql
16. 20260417_update_minutes_policies.sql
17. 20260417_add_minutes_signatures.sql
18. 20260417_create_signatures_bucket.sql
```

#### 2.3 Deploy Edge Functions
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref your-project-ref`
4. Deploy functions:
   ```bash
   supabase functions deploy ai-assistant
   supabase functions deploy bulk-import
   supabase functions deploy coop-bank-sync
   supabase functions deploy create-member
   supabase functions deploy daily-automation
   supabase functions deploy generate-statement
   supabase functions deploy send-bulk-sms
   supabase functions deploy setup-admin
   supabase functions deploy sms-webhook
   ```

#### 2.4 Set Function Secrets
```bash
supabase secrets set LOVABLE_API_KEY=your_lovable_api_key
supabase secrets set AFRICASTALKING_API_KEY=your_africastalking_key
supabase secrets set AFRICASTALKING_USERNAME=your_username
```

### Step 3: Configure Storage

1. Go to Supabase Dashboard → Storage
2. Verify `signatures` bucket exists (created by migration)
3. Ensure bucket is public
4. Test upload by creating a meeting minute with signature

### Step 4: Create Admin User

Run the `setup-admin` function:
```bash
curl -X POST https://your-project.supabase.co/functions/v1/setup-admin \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Name",
    "phone": "+254712345678",
    "id_number": "12345678",
    "email": "admin@welfare.local"
  }'
```

Default password: `Admin2026`

### Step 5: Test Deployment

1. **Login Test**
   - Go to your deployed URL
   - Login with admin credentials
   - Verify dashboard loads

2. **Member Test**
   - Add a new member
   - Assign a role
   - Login as that member
   - Verify member dashboard

3. **Features Test**
   - Create news (should popup for members)
   - Create event
   - Upload meeting minutes with signatures
   - Submit beneficiary request
   - Test AI assistant

## Environment Variables

### Frontend (.env)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### Supabase Secrets
```
LOVABLE_API_KEY=your_lovable_api_key
AFRICASTALKING_API_KEY=your_africastalking_key
AFRICASTALKING_USERNAME=your_username
```

## Post-Deployment Configuration

### 1. Welfare Settings
Login as admin and configure:
- Monthly contribution amount
- Penalty amount
- Grace period days
- Paybill details

### 2. Office Bearers
Assign roles to members:
- Chairperson
- Vice Chairperson
- Secretary
- Vice Secretary
- Patron

### 3. Initial Data
- Add all members
- Import contribution history (if any)
- Create initial events
- Post welcome news

## Troubleshooting

### Frontend Issues
- **404 on refresh**: Verify `vercel.json` or `_redirects` is deployed
- **Blank page**: Check browser console for errors
- **API errors**: Verify environment variables

### Database Issues
- **Migration errors**: Run migrations in order
- **Permission errors**: Check RLS policies
- **Missing tables**: Verify all migrations ran

### Function Issues
- **Function not found**: Redeploy functions
- **Timeout errors**: Check function logs
- **Secret errors**: Verify secrets are set

## Support

For issues or questions:
1. Check the documentation files
2. Review error logs in Supabase
3. Test with browser developer tools
4. Verify all migrations ran successfully

## Security Checklist

- [ ] Changed default admin password
- [ ] Set strong Supabase passwords
- [ ] Configured RLS policies
- [ ] Set up proper CORS
- [ ] Enabled 2FA on Supabase
- [ ] Regular database backups
- [ ] Monitor function logs
- [ ] Review user permissions

## Maintenance

### Regular Tasks
- Weekly: Review error logs
- Monthly: Database backup
- Quarterly: Update dependencies
- Yearly: Security audit

### Updates
To deploy updates:
1. Build new frontend: `npm run build`
2. Upload to hosting
3. Run new migrations if any
4. Redeploy changed functions
5. Test thoroughly

## Success Criteria

Deployment is successful when:
- ✅ Admin can login
- ✅ Members can be added
- ✅ Roles can be assigned
- ✅ Contributions can be tracked
- ✅ News popup works
- ✅ Meeting minutes can be created
- ✅ Signatures can be uploaded
- ✅ AI assistant responds
- ✅ Downloads work
- ✅ Mobile responsive
- ✅ No 404 errors on refresh
