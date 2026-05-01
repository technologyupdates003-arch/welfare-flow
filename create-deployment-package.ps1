# Welfare Flow - Deployment Package Creator
# This script creates a complete deployment package

Write-Host "Creating Welfare Flow Deployment Package..." -ForegroundColor Green

# Define package name with timestamp
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$packageName = "welfare-flow-deployment-$timestamp"
$packageDir = ".\deployment-packages\$packageName"

# Create deployment package directory
Write-Host "Creating package directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $packageDir | Out-Null

# Copy built frontend files
Write-Host "Copying frontend build files..." -ForegroundColor Yellow
if (Test-Path ".\dist") {
    Copy-Item -Path ".\dist" -Destination "$packageDir\dist" -Recurse -Force
    Write-Host "✓ Frontend files copied" -ForegroundColor Green
} else {
    Write-Host "✗ Build files not found. Run 'npm run build' first!" -ForegroundColor Red
    exit 1
}

# Copy database migrations
Write-Host "Copying database migrations..." -ForegroundColor Yellow
if (Test-Path ".\supabase\migrations") {
    Copy-Item -Path ".\supabase\migrations" -Destination "$packageDir\supabase\migrations" -Recurse -Force
    Write-Host "✓ Database migrations copied" -ForegroundColor Green
} else {
    Write-Host "⚠ No migrations folder found" -ForegroundColor Yellow
}

# Copy documentation
Write-Host "Copying documentation..." -ForegroundColor Yellow
$docs = @(
    "DEPLOYMENT_GUIDE.md",
    "FEATURES_SUMMARY.md",
    "README.md"
)

foreach ($doc in $docs) {
    if (Test-Path ".\$doc") {
        Copy-Item -Path ".\$doc" -Destination "$packageDir\$doc" -Force
        Write-Host "✓ $doc copied" -ForegroundColor Green
    }
}

# Create .env.example
Write-Host "Creating .env.example..." -ForegroundColor Yellow
$envExample = @"
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Example:
# VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Get these values from:
# Supabase Dashboard → Settings → API
"@
Set-Content -Path "$packageDir\.env.example" -Value $envExample
Write-Host "✓ .env.example created" -ForegroundColor Green

# Create deployment checklist
Write-Host "Creating deployment checklist..." -ForegroundColor Yellow
$checklist = @"
# Deployment Checklist

## Pre-Deployment
- [ ] Review DEPLOYMENT_GUIDE.md
- [ ] Review FEATURES_SUMMARY.md
- [ ] Supabase project created
- [ ] Environment variables prepared

## Database Setup
- [ ] All migrations run successfully
- [ ] Storage buckets created (signatures, documents)
- [ ] RLS policies verified
- [ ] Test data added (optional)

## Frontend Deployment
- [ ] Environment variables configured
- [ ] dist/ folder uploaded to hosting
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] SPA routing configured

## Post-Deployment
- [ ] Application accessible
- [ ] User registration works
- [ ] Login works
- [ ] Super admin user created
- [ ] Admin users assigned
- [ ] All features tested

## Testing Checklist
- [ ] Member registration/login
- [ ] Contributions
- [ ] Penalty payments
- [ ] Beneficiary requests
- [ ] News announcements
- [ ] Chat functionality
- [ ] Meeting minutes
- [ ] Document upload/download
- [ ] Signature upload
- [ ] Super admin features

## Security
- [ ] RLS enabled on all tables
- [ ] API keys secured
- [ ] HTTPS enforced
- [ ] Backup configured
- [ ] Monitoring enabled

Deployment Date: _______________
Deployed By: _______________
Production URL: _______________
"@
Set-Content -Path "$packageDir\DEPLOYMENT_CHECKLIST.md" -Value $checklist
Write-Host "✓ Deployment checklist created" -ForegroundColor Green

# Create quick start guide
Write-Host "Creating quick start guide..." -ForegroundColor Yellow
$quickStart = @"
# Quick Start Guide

## 1. Setup Supabase (5 minutes)
1. Go to https://supabase.com and create a project
2. Wait for project to be ready
3. Go to SQL Editor
4. Run all files from 'supabase/migrations/' folder in order
5. Go to Storage and create buckets: 'signatures' and 'documents'

## 2. Configure Environment (2 minutes)
1. Copy .env.example to .env
2. Get your Supabase URL and Anon Key from Settings → API
3. Update .env with your credentials

## 3. Deploy Frontend (5 minutes)

### Option A: Vercel (Easiest)
1. Go to https://vercel.com
2. Click "New Project"
3. Upload the 'dist' folder
4. Add environment variables from .env
5. Deploy!

### Option B: Netlify
1. Go to https://netlify.com
2. Drag and drop the 'dist' folder
3. Add environment variables
4. Done!

## 4. Initial Setup (3 minutes)
1. Open your deployed site
2. Register first user
3. Go to Supabase Dashboard → Authentication → Users
4. Find your user in the users table
5. Go to Table Editor → user_roles
6. Add a row: user_id = your_user_id, role = 'super_admin'
7. Refresh your app and login

## 5. You're Done! 🎉
- Login as super admin
- Create admin users
- Start managing your welfare group

## Need Help?
- Check DEPLOYMENT_GUIDE.md for detailed instructions
- Review FEATURES_SUMMARY.md for all features
- Check Supabase logs for errors
"@
Set-Content -Path "$packageDir\QUICK_START.md" -Value $quickStart
Write-Host "✓ Quick start guide created" -ForegroundColor Green

# Create package info file
Write-Host "Creating package info..." -ForegroundColor Yellow
$packageInfo = @"
# Welfare Flow Deployment Package

**Package Created:** $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
**Version:** 1.0.0
**Build Date:** April 28, 2026

## Package Contents

1. **dist/** - Production build files (frontend)
2. **supabase/migrations/** - Database migration files
3. **DEPLOYMENT_GUIDE.md** - Complete deployment instructions
4. **FEATURES_SUMMARY.md** - All features documentation
5. **QUICK_START.md** - Quick deployment guide
6. **DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist
7. **.env.example** - Environment variables template

## Quick Links

- Supabase: https://supabase.com
- Vercel: https://vercel.com
- Netlify: https://netlify.com

## Support

For deployment issues:
1. Check DEPLOYMENT_GUIDE.md
2. Review migration files
3. Check Supabase logs
4. Verify environment variables

## System Requirements

- Supabase account (free tier works)
- Static hosting service
- Modern web browser
- HTTPS support

---

**Ready to deploy!** Start with QUICK_START.md for fastest deployment.
"@
Set-Content -Path "$packageDir\PACKAGE_INFO.md" -Value $packageInfo
Write-Host "✓ Package info created" -ForegroundColor Green

# Create the zip file
Write-Host "`nCreating ZIP archive..." -ForegroundColor Yellow
$zipPath = ".\deployment-packages\$packageName.zip"
Compress-Archive -Path "$packageDir\*" -DestinationPath $zipPath -Force

# Get file size
$zipSize = (Get-Item $zipPath).Length / 1MB
$zipSizeFormatted = "{0:N2} MB" -f $zipSize

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✓ Deployment Package Created Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "`nPackage Details:" -ForegroundColor Yellow
Write-Host "  Name: $packageName.zip" -ForegroundColor White
Write-Host "  Size: $zipSizeFormatted" -ForegroundColor White
Write-Host "  Location: $zipPath" -ForegroundColor White
Write-Host "`nPackage Contents:" -ForegroundColor Yellow
Write-Host "  ✓ Frontend build (dist/)" -ForegroundColor Green
Write-Host "  ✓ Database migrations" -ForegroundColor Green
Write-Host "  ✓ Deployment guide" -ForegroundColor Green
Write-Host "  ✓ Features documentation" -ForegroundColor Green
Write-Host "  ✓ Quick start guide" -ForegroundColor Green
Write-Host "  ✓ Deployment checklist" -ForegroundColor Green
Write-Host "  ✓ Environment template" -ForegroundColor Green
Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host "  1. Extract the ZIP file" -ForegroundColor White
Write-Host "  2. Read QUICK_START.md for fastest deployment" -ForegroundColor White
Write-Host "  3. Or read DEPLOYMENT_GUIDE.md for detailed instructions" -ForegroundColor White
Write-Host "`n========================================`n" -ForegroundColor Cyan

# Open the deployment packages folder
Start-Process explorer.exe -ArgumentList ".\deployment-packages"
