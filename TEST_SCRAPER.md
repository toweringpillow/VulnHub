# Testing the Scraper

## Finding Your Vercel Deployment URL

Your Vercel deployment URL is typically one of these formats:

1. **Production URL:** `https://your-project-name.vercel.app`
2. **Preview URL:** `https://your-project-name-git-main-your-username.vercel.app`
3. **Custom Domain:** `https://vulnerabilityhub.com` (once DNS is configured)

### How to Find It:

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your project (`vuln-hub` or similar)

2. **Check Deployments:**
   - Look at the latest deployment
   - The URL is shown at the top (e.g., `vuln-hub-blue.vercel.app`)
   - Or click "Visit" to see the full URL

3. **Check Project Settings:**
   - Go to `Settings` → `Domains`
   - You'll see all assigned domains/URLs

## Testing the Scraper Manually

### Option 1: Using curl (Terminal/Command Prompt)

Replace `YOUR_VERCEL_URL` and `YOUR_CRON_SECRET` with your actual values:

```bash
curl -X POST \
  -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  https://YOUR_VERCEL_URL/api/cron/scraper
```

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer my-secret-key-123" \
  -H "Content-Type: application/json" \
  https://vuln-hub-blue.vercel.app/api/cron/scraper
```

### Option 2: Using PowerShell (Windows)

```powershell
$headers = @{
    "Authorization" = "Bearer YOUR_CRON_SECRET"
    "Content-Type" = "application/json"
}

Invoke-RestMethod -Uri "https://YOUR_VERCEL_URL/api/cron/scraper" -Method POST -Headers $headers
```

### Option 3: Using a REST Client (Postman, Insomnia, etc.)

1. **Method:** POST
2. **URL:** `https://YOUR_VERCEL_URL/api/cron/scraper`
3. **Headers:**
   - `Authorization`: `Bearer YOUR_CRON_SECRET`
   - `Content-Type`: `application/json`

### Option 4: Test the Health Check Endpoint (No Auth Required)

You can test if the endpoint is accessible:

```bash
curl https://YOUR_VERCEL_URL/api/cron/scraper
```

This should return:
```json
{
  "status": "ok",
  "endpoint": "scraper",
  "message": "Use POST with Authorization header"
}
```

## Expected Response

When the scraper runs successfully, you should see:

```json
{
  "success": true,
  "result": {
    "articlesProcessed": 10,
    "articlesAdded": 5,
    "articlesSkipped": 5,
    "errors": []
  },
  "timestamp": "2025-01-XX..."
}
```

## Troubleshooting

### Error: "Unauthorized"
- Check that `CRON_SECRET` matches between:
  - Vercel environment variables
  - Your test command
- Make sure you're using `Bearer ` prefix (with space)

### Error: "Server misconfigured"
- `CRON_SECRET` is not set in Vercel environment variables
- Go to Vercel → Project Settings → Environment Variables
- Add `CRON_SECRET` with your secret value

### Error: Connection refused / Timeout
- Check that your Vercel deployment is live
- Verify the URL is correct
- Check Vercel function logs for errors

### Check Vercel Logs
1. Go to Vercel Dashboard → Your Project
2. Click on the latest deployment
3. Go to "Logs" tab
4. Look for errors or success messages

## Setting Up GitHub Actions

Once you've confirmed the scraper works manually:

1. **Get your Vercel URL** (from above steps)
2. **Get your CRON_SECRET** (from Vercel environment variables)
3. **Add GitHub Secrets:**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Add `SCRAPER_URL`: Your Vercel URL (e.g., `https://vuln-hub-blue.vercel.app`)
   - Add `CRON_SECRET`: Your secret value

The GitHub Actions workflow will then run automatically every 5 minutes.

