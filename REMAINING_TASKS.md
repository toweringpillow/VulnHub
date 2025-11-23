# Remaining Tasks to Complete VulnHub v2.0

## High Priority Pages to Create

### 1. Authentication Pages

#### `/app/login/page.tsx`
```tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
// Add form with email/password fields
// Use supabase.auth.signInWithPassword()
// Redirect to /dashboard on success
```

#### `/app/register/page.tsx`
```tsx
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
// Add form with username, email, password fields
// Validate password with isValidPassword() from lib/utils
// Use supabase.auth.signUp() with metadata: { username }
// Show "Check your email" message
```

#### `/app/dashboard/page.tsx`
```tsx
import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
// Get user with supabase.auth.getUser()
// Fetch user's profile and subscriptions
// Display tag subscription toggles
// Show "Coming Soon" for email alerts
```

### 2. Static Pages

#### `/app/privacy/page.tsx`
Copy content from your old `backup-11.8.2025_10-10-17_vulnfjdf/.../templates/privacy_policy.html`
Update to reflect:
- Supabase for auth (not Mailgun)
- Vercel hosting
- OpenAI data processing
- News API usage
- Web3Forms for contact

#### `/app/terms/page.tsx`
Create standard Terms of Service:
- No warranties on threat data
- Use at your own risk
- No liability for missed threats
- User-generated content policy
- Account termination rights
- Governing law (your jurisdiction)

#### `/app/contact/page.tsx`
```tsx
'use client'
import { useState } from 'react'
// Form with: name, email, subject, message
// POST to https://api.web3forms.com/submit
// Include WEB3FORMS_ACCESS_KEY from env
// Show success/error messages
```

### 3. Feature Pages

#### `/app/iocs/page.tsx`
```tsx
'use client'
import { useState } from 'react'
// Input field for hash/URL/IP
// POST to /api/virustotal
// Display results: scan date, detections, vendors
// Show "X/Y vendors flagged this as malicious"
```

#### `/api/virustotal/route.ts`
```ts
import { NextResponse } from 'next/server'
// GET request to VirusTotal API
// https://www.virustotal.com/api/v3/files/{hash}
// Header: x-apikey: process.env.VIRUSTOTAL_API_KEY
// Return formatted results
```

### 4. Additional Components

#### `/components/WorldNewsTicker.tsx`
```tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
// Fetch from world_news table
// Display as scrolling marquee or sidebar
// Update every 6 hours (matches cron)
```

#### `/components/RealTimeUpdates.tsx`
```tsx
'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
// Subscribe to Supabase Realtime channel
// Listen for INSERT on articles table
// Show toast notification for new threats
// Refresh page or optimistically add to list
```

## Asset Tasks

### Copy from Backup

1. **Logo Files**
   ```bash
   cp backup-11.8.2025_10-10-17_vulnfjdf/backup-11.8.2025_10-10-17_vulnfjdf/homedir/public_html/nc_assets/img/*.png public/images/
   cp backup-11.8.2025_10-10-17_vulnfjdf/backup-11.8.2025_10-10-17_vulnfjdf/homedir/public_html/nc_assets/img/*.ico public/images/
   ```

2. **Create Missing Icons**
   - `icon-192.png` (192×192px logo)
   - `icon-512.png` (512×512px logo)
   - `apple-touch-icon.png` (180×180px logo)
   - `og-image.png` (1200×630px for social sharing)

   You can use an online tool like Canva or Figma to resize your existing logo.

## Setup Tasks

### 1. Supabase Setup
- [ ] Create account at supabase.com
- [ ] Create new project
- [ ] Run `supabase/schema.sql` in SQL Editor
- [ ] Enable Realtime on `articles` table (Database > Replication)
- [ ] Copy URL and keys to `.env.local`

### 2. API Keys
- [ ] OpenAI: https://platform.openai.com/api-keys
- [ ] VirusTotal: https://www.virustotal.com/gui/my-apikey
- [ ] Web3Forms: https://web3forms.com/
- [ ] News API (optional): https://newsapi.org/register
- [ ] Generate CRON_SECRET: `openssl rand -base64 32`

### 3. Vercel Setup
- [ ] Push code to GitHub
- [ ] Connect repo to Vercel
- [ ] Add all environment variables
- [ ] Deploy
- [ ] Test cron jobs in Function logs

### 4. DNS Setup
- [ ] Add custom domain in Vercel
- [ ] Update nameservers OR add CNAME record
- [ ] Wait for DNS propagation
- [ ] Verify SSL certificate

## Testing Checklist

After deployment, test these features:

- [ ] Homepage loads with articles
- [ ] Binary header animates
- [ ] Search works (enter "ransomware")
- [ ] Article detail pages load
- [ ] Register new account
- [ ] Email verification received
- [ ] Login works
- [ ] Dashboard loads
- [ ] Subscribe/unsubscribe to tags
- [ ] IOC lookup returns results
- [ ] Contact form submits successfully
- [ ] World news ticker displays
- [ ] Real-time updates work (trigger scraper manually)
- [ ] Mobile responsive (test on phone)
- [ ] All links work (no 404s)

## Optional Enhancements

### Nice-to-Have Features
1. **Email Notifications** - When email server ready
2. **Reddit Integration** - r/cybersecurity, r/netsec
3. **Twitter/X Integration** - If API becomes affordable
4. **Export to CSV** - Download threat data
5. **Dark/Light Mode Toggle** - For accessibility
6. **Multi-language Support** - i18n
7. **Advanced Filters** - By severity, date range, vendor
8. **Bookmark/Save Threats** - Per-user saved articles
9. **Comment System** - Discuss threats (Disqus or custom)
10. **API for Third Parties** - Let others use your data

### Performance Optimizations
1. **Redis Caching** - Cache expensive queries
2. **Image CDN** - Optimize logo/images
3. **Service Worker** - Offline support
4. **Prefetching** - Preload likely next pages
5. **Compression** - Gzip/Brotli

### Analytics
1. **Google Analytics** - Track visitors
2. **Plausible** - Privacy-friendly analytics
3. **Sentry** - Error monitoring
4. **Vercel Analytics** - Built-in performance tracking

## Quick Command Reference

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check

# Lint
npm run lint

# Format code
npm run format

# Generate Supabase types (after schema changes)
npm run db:types
```

## File Size Summary

- **Total Files Created**: 50+
- **Lines of Code**: ~8,000
- **Configuration Files**: 12
- **Components**: 6
- **Pages**: 5 (+ 7 more to create)
- **API Routes**: 4
- **Documentation**: 5 files

## Need Help?

- Check `SETUP_GUIDE.md` for detailed instructions
- Read `PROJECT_NOTES.md` for technical details
- See `DEPLOYMENT_SUMMARY.md` for overview
- Reference `README.md` for quick start

---

**Remember**: The core infrastructure is complete. You're just adding the final UI pages and copying your assets!

