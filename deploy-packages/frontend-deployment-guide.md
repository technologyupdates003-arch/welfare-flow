# Frontend Deployment Guide

## Quick Deploy Options

### Option 1: Netlify (Recommended)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `welfare-flow-production.zip` file
3. Set environment variables in Site Settings > Environment Variables

### Option 2: Vercel
1. Go to [vercel.com](https://vercel.com)
2. Import project from Git or upload the production files
3. Set environment variables in Project Settings

### Option 3: Static Hosting (Apache/Nginx)
1. Extract `welfare-flow-production.zip`
2. Upload contents to your web server's document root
3. Configure environment variables through your hosting provider

## Required Environment Variables

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Security Notes

- Only public keys are exposed in the frontend
- All sensitive operations happen server-side
- The xlsx vulnerability is development-only and doesn't affect production

## Performance Optimizations Applied

- Code splitting and lazy loading
- Asset optimization and compression
- CSS purging with Tailwind
- Modern JavaScript output for better performance