# External Cron Setup Guide

Since Vercel Hobby accounts are limited to daily cron jobs, we're using external cron services to trigger the scraper every 5 minutes.

## Option 1: GitHub Actions (Recommended - Free)

GitHub Actions is free for public repositories and can run scheduled workflows.

### Setup Steps:

1. **Add Secrets to GitHub Repository:**
   - Go to your repo: `Settings` → `Secrets and variables` → `Actions`
   - Add these secrets:
     - `CRON_SECRET`: Your cron secret (same as Vercel env var)
     - `SCRAPER_URL`: Your production URL (e.g., `https://vulnerabilityhub.com`)
   - **Note:** Use your production domain once DNS is configured. For testing, use your Vercel preview URL.

2. **Workflow File:**
   - The workflow file is already created at `.github/workflows/scraper-cron.yml`
   - It runs every 5 minutes automatically
   - You can also trigger it manually from the Actions tab

3. **Verify:**
   - Go to the `Actions` tab in your GitHub repo
   - You should see "Scrape Articles" workflow running every 5 minutes
   - Check the logs to ensure it's calling your API successfully

## Option 2: cron-job.org (Free Tier Available)

A free external cron service that can call your API endpoint.

### Setup Steps:

1. **Sign up at [cron-job.org](https://cron-job.org)** (free account available)

2. **Create a new cron job:**
   - **Title:** VulnHub Scraper
   - **Address:** `https://vulnerabilityhub.com/api/cron/scraper` (production domain)
   - **Schedule:** Every 5 minutes (`*/5 * * * *`)
   - **Request Method:** POST
   - **Request Headers:**
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     Content-Type: application/json
     ```

3. **Save and activate** the cron job

## Option 3: EasyCron (Free Tier Available)

Similar to cron-job.org with a free tier.

### Setup Steps:

1. **Sign up at [EasyCron](https://www.easycron.com)** (free account: 2 jobs)

2. **Create cron job:**
   - **URL:** `https://vulnerabilityhub.com/api/cron/scraper`
   - **HTTP Method:** POST
   - **HTTP Headers:** 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
   - **Schedule:** Every 5 minutes

## Option 4: UptimeRobot (Free - 50 monitors)

While primarily for uptime monitoring, can also ping URLs.

### Setup Steps:

1. **Sign up at [UptimeRobot](https://uptimerobot.com)** (free: 50 monitors)

2. **Add Monitor:**
   - **Type:** HTTP(s)
   - **URL:** `https://vulnerabilityhub.com/api/cron/scraper`
   - **Method:** POST
   - **Headers:** `Authorization: Bearer YOUR_CRON_SECRET`
   - **Interval:** 5 minutes

## Security Notes

- **CRON_SECRET** must match between:
  - Your Vercel environment variables
  - Your external cron service configuration
- Never commit `CRON_SECRET` to your repository
- Use GitHub Secrets or environment variables in your cron service

## Testing

You can manually test the endpoint:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  https://vulnerabilityhub.com/api/cron/scraper
```

Expected response:
```json
{
  "success": true,
  "result": { ... },
  "timestamp": "2025-01-XX..."
}
```

## Monitoring

- Check Vercel function logs to see when scrapes run
- Monitor GitHub Actions logs (if using Option 1)
- Set up alerts in your cron service for failures

## Recommended Setup

**For now:** Use **GitHub Actions** (Option 1) - it's free, reliable, and already configured.

**For production:** Consider using **cron-job.org** or **EasyCron** for more control and monitoring features.

