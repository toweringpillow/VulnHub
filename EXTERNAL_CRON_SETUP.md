# External Cron Setup for Free Tier Real-Time Updates

Since Vercel's free tier only allows daily cron jobs, we'll use **external free cron services** to trigger your scraper every 15 minutes. This gives you real-time updates while staying on the free tier!

## ✅ How It Works

1. **External cron service** calls your Vercel API endpoint every 15 minutes
2. **Scraper runs** and adds new threats to Supabase
3. **Supabase Realtime** broadcasts new articles to all connected users
4. **Users see updates instantly** without refreshing the page

## 🆓 Free Cron Services (Choose One)

### Option 1: cron-job.org (Recommended - Easiest)

1. Go to https://cron-job.org/en/
2. Sign up (free, no credit card)
3. Click **"Create cronjob"**
4. Configure:
   - **Title**: VulnHub Scraper
   - **Address**: `https://your-site.vercel.app/api/cron/scraper`
   - **Schedule**: Every 15 minutes (`*/15 * * * *`)
   - **Request Method**: POST
   - **Request Headers**: 
     - Key: `Authorization`
     - Value: `Bearer YOUR_CRON_SECRET` (from your .env)
   - **Request Body**: Leave empty
5. Click **"Create"**

**Repeat for world news:**
- Address: `https://your-site.vercel.app/api/cron/world-news`
- Schedule: Every 6 hours (`0 */6 * * *`)

### Option 2: EasyCron

1. Go to https://www.easycron.com/
2. Sign up (free tier: 1 job, runs every 5 minutes)
3. Create new cron job:
   - **URL**: `https://your-site.vercel.app/api/cron/scraper`
   - **HTTP Method**: POST
   - **HTTP Headers**: `Authorization: Bearer YOUR_CRON_SECRET`
   - **Schedule**: Every 15 minutes
4. Save

### Option 3: GitHub Actions (If you want it in your repo)

Create `.github/workflows/scraper.yml`:

```yaml
name: Scrape Threats
on:
  schedule:
    - cron: '*/15 * * * *'  # Every 15 minutes
  workflow_dispatch:  # Manual trigger

jobs:
  scrape:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Scraper
        run: |
          curl -X POST https://your-site.vercel.app/api/cron/scraper \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

Then add `CRON_SECRET` to GitHub Secrets.

## 🔄 Real-Time Updates (Already Built In!)

Your site already has **Supabase Realtime** configured! Here's how it works:

1. **Frontend subscribes** to new articles via Supabase Realtime
2. **When scraper adds** a new article, Supabase broadcasts it
3. **All connected users** see the new threat instantly

### Enable Realtime in Supabase:

1. Go to your Supabase project
2. **Database → Replication**
3. Find the `articles` table
4. Toggle **"Enable Realtime"** ON
5. Save

### Frontend Implementation:

The frontend will automatically subscribe to new articles. You can add this component to show real-time updates:

```tsx
// components/RealTimeUpdates.tsx
'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function RealTimeUpdates() {
  const supabase = createClient()
  
  useEffect(() => {
    // Subscribe to new articles
    const channel = supabase
      .channel('articles')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'articles'
      }, (payload) => {
        const newArticle = payload.new
        toast.success(`New threat: ${newArticle.title}`, {
          duration: 5000,
          onClick: () => window.location.href = `/article/${newArticle.id}/${slugify(newArticle.title)}`
        })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  return null // This component doesn't render anything
}
```

Then add it to your layout:

```tsx
// app/layout.tsx
import RealTimeUpdates from '@/components/RealTimeUpdates'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <RealTimeUpdates />
        {children}
      </body>
    </html>
  )
}
```

## 📊 Update Frequency

With external cron:
- **Scraper**: Every 15 minutes (real-time!)
- **World News**: Every 6 hours
- **Cost**: $0 (all free services)
- **Real-time updates**: ✅ Yes (via Supabase Realtime)

## 🔒 Security

Your cron endpoints are protected by the `CRON_SECRET` environment variable. Make sure:
- ✅ Never commit `CRON_SECRET` to git
- ✅ Use a strong random string (32+ characters)
- ✅ Only share with trusted cron services
- ✅ Rotate if compromised

## 🧪 Testing

Test your cron endpoint manually:

```bash
curl -X POST https://your-site.vercel.app/api/cron/scraper \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

You should see:
```json
{
  "success": true,
  "result": {
    "articlesProcessed": 50,
    "articlesAdded": 5,
    "articlesSkipped": 45,
    "errors": []
  }
}
```

## 🎯 Recommended Setup

1. **Use cron-job.org** (easiest, most reliable)
2. **Enable Supabase Realtime** on `articles` table
3. **Add RealTimeUpdates component** to show toast notifications
4. **Test manually** first to verify it works

## 💡 Pro Tips

- **Monitor your cron jobs**: Check cron-job.org dashboard regularly
- **Set up alerts**: Get email notifications if cron fails
- **Backup plan**: Keep manual trigger option (curl command)
- **Rate limiting**: External cron services respect your API rate limits

---

**Result**: Real-time updates every 15 minutes, completely free! 🎉

