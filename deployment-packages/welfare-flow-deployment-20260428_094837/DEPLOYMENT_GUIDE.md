# Welfare Flow - Deployment Guide

## Package Contents

This deployment package contains:
- `dist/` - Production build files (frontend)
- `supabase/migrations/` - Database migration files
- `.env.example` - Environment variables template
- `DEPLOYMENT_GUIDE.md` - This file
- `FEATURES_SUMMARY.md` - Complete feature list

## Prerequisites

1. **Supabase Account** - Create a project at https://supabase.com
2. **Web Hosting** - Any static hosting service (Vercel, Netlify, AWS S3, etc.)
3. **Node.js** (optional, for local testing)

## Deployment Steps

### 1. Setup Supabase Database

1. Create a new Supabase project
2. Go to SQL Editor in your Supabase dashboard
3. Run all migration files in order from `supabase/migrations/` folder:
   - Start with earliest dates (20260411...)
   - Run each file sequentially
   - Verify each migration completes successfully

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env`
2. Update with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. Get these values from Supabase Dashboard → Settings → API

### 3. Deploy Frontend

#### Option A: Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel --prod`
3. Upload the `dist` folder when prompted
4. Add environment variables in Vercel dashboard

#### Option B: Netlify
1. Drag and drop the `dist` folder to Netlify
2. Or use Netlify CLI: `netlify deploy --prod --dir=dist`
3. Add environment variables in Netlify dashboard

#### Option C: Traditional Web Hosting
1. Upload contents of `dist` folder to your web server
2. Configure web server to serve `index.html` for all routes (SPA routing)
3. Ensure HTTPS is enabled

### 4. Configure Supabase Storage

1. Go to Supabase Dashboard → Storage
2. Create buckets:
   - `signatures` (public)
   - `documents` (public)
3. Set appropriate RLS policies (already in migrations)

### 5. Initial Setup

1. Access your deployed application
2. Register the first user (will be a member by default)
3. Use Supabase Dashboard → Authentication → Users to manually add roles:
   - Add `super_admin` role to your user in `user_roles` table
4. Login as super admin to manage the system

### 6. Create Admin Users

As super admin:
1. Go to Super Admin Dashboard → Members
2. Assign `admin` role to trusted users
3. Admins can then manage day-to-day operations

## Post-Deployment Checklist

- [ ] Database migrations completed successfully
- [ ] Environment variables configured
- [ ] Frontend deployed and accessible
- [ ] Storage buckets created
- [ ] Super admin user created
- [ ] Admin users assigned
- [ ] Test all major features:
  - [ ] User registration/login
  - [ ] Member contributions
  - [ ] News announcements
  - [ ] Chat functionality
  - [ ] Meeting minutes
  - [ ] Beneficiary management
  - [ ] Penalty payments

## Troubleshooting

### Build Issues
- Ensure Node.js version 18+ is installed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Increase memory: `node --max-old-space-size=4096 ./node_modules/vite/bin/vite.js build`

### Database Issues
- Check migration order - they must run sequentially
- Verify Supabase project is active
- Check RLS policies are enabled

### Authentication Issues
- Verify environment variables are correct
- Check Supabase Auth settings
- Ensure email confirmation is configured

### Performance Issues
- Enable CDN for static assets
- Configure caching headers
- Consider code splitting for large bundles

## Security Recommendations

1. **Enable Row Level Security (RLS)** - Already configured in migrations
2. **Use HTTPS** - Required for production
3. **Rotate API Keys** - Regularly update Supabase keys
4. **Backup Database** - Enable Supabase automatic backups
5. **Monitor Logs** - Check Supabase logs regularly
6. **Update Dependencies** - Keep packages up to date

## Support

For issues or questions:
1. Check migration files for database schema
2. Review feature documentation in FEATURES_SUMMARY.md
3. Check Supabase logs for backend errors
4. Review browser console for frontend errors

## Maintenance

### Regular Tasks
- Monitor database size and performance
- Review and clean old logs
- Update member statuses
- Backup important data
- Review security logs

### Updates
- Pull latest code changes
- Run new migrations
- Rebuild and redeploy frontend
- Test thoroughly before production deployment

## Version Information

- Build Date: April 28, 2026
- Node Version: 18+
- React Version: 18.3.1
- Vite Version: 7.3.2
- Supabase JS: 2.103.0
