# Real-Time Scraping Options

Currently, the scraper runs via Vercel Cron every 15 minutes. Here are options to make it more real-time:

## Option 1: Reduce Cron Interval (Easiest)
**Current:** Every 15 minutes  
**Recommended:** Every 5 minutes (already configured in `vercel.json`)

**Pros:**
- Simple - just change the schedule
- No additional services needed
- Free on Vercel

**Cons:**
- Still not truly "real-time"
- More API calls to OpenAI (costs)
- More database writes

**Implementation:** Already done in `vercel.json` - changed to `*/5 * * * *` (every 5 minutes)

## Option 2: Supabase Edge Functions + pg_cron
Use Supabase's built-in cron to trigger Edge Functions that scrape and insert directly.

**Pros:**
- Runs closer to the database (faster)
- Can run every 1-2 minutes
- Integrated with your Supabase setup

**Cons:**
- Requires Supabase Pro plan for frequent cron jobs
- More complex setup
- Need to rewrite scraper as Edge Function

**Implementation:**
1. Create Supabase Edge Function
2. Set up pg_cron to run every 2-5 minutes
3. Function calls OpenAI and inserts to database

## Option 3: Webhook-Based RSS Monitoring
Use a service that monitors RSS feeds and sends webhooks when new items appear.

**Services:**
- **Zapier/Make.com** - Monitor RSS feeds, trigger webhook to your API
- **IFTTT** - Similar to Zapier
- **n8n** - Self-hosted automation
- **RSS Bridge** - Self-hosted RSS aggregator

**Pros:**
- Truly real-time (within seconds of publication)
- Only processes new items (efficient)
- Can monitor multiple feeds simultaneously

**Cons:**
- Requires external service (costs or self-hosting)
- More complex setup
- Need to handle webhook authentication

**Implementation:**
1. Set up Zapier/Make.com workflow
2. Monitor RSS feeds
3. When new item detected, POST to `/api/scraper/webhook`
4. Your API processes single article instead of full scrape

## Option 4: GitHub Actions Scheduled Workflows
Use GitHub Actions to run scraper on a schedule.

**Pros:**
- Free for public repos
- Can run every minute (with limits)
- Version controlled

**Cons:**
- Not truly real-time
- Requires GitHub repo
- API rate limits

## Option 5: Hybrid Approach (Recommended)
Combine multiple methods:

1. **Vercel Cron** - Full scrape every 15-30 minutes (backup)
2. **Webhook service** - Real-time for high-priority feeds (CISA, critical CVEs)
3. **Supabase Realtime** - Already implemented for instant UI updates

**Best Setup:**
- Use Zapier/Make.com to monitor CISA and critical feeds → webhook → instant processing
- Keep Vercel Cron for comprehensive scrape every 15 minutes
- Users see updates instantly via Supabase Realtime subscriptions

## Recommendation

For now, **Option 1** (5-minute cron) is the simplest improvement. For true real-time, implement **Option 3** (webhook-based) for critical feeds like CISA advisories, while keeping cron for comprehensive coverage.

## Cost Considerations

- **5-minute cron:** ~288 API calls/day × $0.001 = ~$0.29/day = ~$8.70/month
- **1-minute cron:** ~1,440 calls/day = ~$43/month (not recommended)
- **Webhook-based:** Only processes new items = much lower costs

