# VulnHub Setup Guide

This guide will walk you through setting up VulnHub locally and deploying to Vercel + Supabase.

## Prerequisites

- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version
- **GitHub Account**: For repository hosting
- **Vercel Account**: Free tier (sign up at vercel.com)
- **Supabase Account**: Free tier (sign up at supabase.com)
- **OpenAI API Key**: From platform.openai.com
- **VirusTotal API Key**: From virustotal.com (free tier)

## Step 1: Clone & Install

```bash
# Clone from your GitHub
git clone https://github.com/toweringpillow/VulnHub.git
cd VulnHub

# Install dependencies
npm install
```

## Step 2: Supabase Setup

### 2.1 Create Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose organization and fill in:
   - **Project name**: VulnHub
   - **Database password**: (save this securely!)
   - **Region**: Choose closest to your users
4. Wait 2-3 minutes for project creation

### 2.2 Run Database Schema

1. Go to **SQL Editor** in your Supabase project
2. Open `supabase/schema.sql` from your local project
3. Copy the entire contents
4. Paste into SQL Editor and click **RUN**
5. Verify tables created: Database > Tables (you should see: profiles, articles, tags, etc.)

### 2.3 Enable Realtime

1. Go to **Database > Replication**
2. Enable replication for the `articles` table
3. This allows real-time updates on the frontend

### 2.4 Get API Keys

1. Go to **Settings > API**
2. Copy the following (you'll need these for .env.local):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon/public key**: `eyJhbG...` (long key)
   - **service_role key**: `eyJhbG...` (different long key - **keep secret!**)

## Step 3: OpenAI Setup

1. Go to [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Click "Create new secret key"
3. Name it "VulnHub"
4. Copy the key (starts with `sk-`)
5. **Note**: This will cost money per summary (~$0.001 per article). Add payment method if needed.

## Step 4: VirusTotal Setup

1. Go to [virustotal.com/gui/my-apikey](https://www.virustotal.com/gui/my-apikey)
2. Sign up/login
3. Copy your API key
4. **Free tier**: 4 requests/minute, 500/day

## Step 5: Web3Forms Setup (Contact Form)

1. Go to [web3forms.com](https://web3forms.com/)
2. Enter your email address
3. Click "Get Access Key"
4. Copy the access key from the email you receive

## Step 6: News API Setup (Optional - World News Ticker)

1. Go to [newsapi.org/register](https://newsapi.org/register)
2. Sign up for free tier
3. Copy your API key
4. **Free tier**: 100 requests/day (enough for ticker updates every 6 hours)

## Step 7: Environment Variables

1. Copy the example file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Open `.env.local` and fill in your values:

   ```env
   # Supabase (from Step 2.4)
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
   
   # OpenAI (from Step 3)
   OPENAI_API_KEY=sk-...
   
   # VirusTotal (from Step 4)
   VIRUSTOTAL_API_KEY=...
   
   # Web3Forms (from Step 5)
   WEB3FORMS_ACCESS_KEY=...
   
   # News API (from Step 6 - optional)
   NEWS_API_KEY=...
   
   # Security (generate with: openssl rand -base64 32)
   CRON_SECRET=your-random-secure-string-here
   
   # Features
   ENABLE_AI=true
   AI_MODEL=gpt-4o-mini
   MAX_ARTICLES_PER_RUN=50
   ARTICLE_CUTOFF_DAYS=5
   
   # Site URL (for local dev)
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

## Step 8: Copy Logo & Assets

Copy your logo, favicon, and images from the backup:

```bash
# Create public directory if it doesn't exist
mkdir -p public/images

# Copy from backup (adjust path to your backup location)
cp backup-11.8.2025_10-10-17_vulnfjdf/backup-11.8.2025_10-10-17_vulnfjdf/homedir/public_html/nc_assets/img/* public/images/

# Verify favicon exists
ls public/images/*.ico
```

## Step 9: Run Locally

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Features:
- [ ] Homepage loads
- [ ] Binary header animates
- [ ] Register new account
- [ ] Verify email (check Supabase Auth dashboard)
- [ ] Login works
- [ ] Dashboard loads
- [ ] Try IOC lookup (enter a hash)
- [ ] Contact form submits

## Step 10: Deploy to Vercel

### 10.1 Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial VulnHub v2.0 setup"

# Add remote and push
git remote add origin https://github.com/toweringpillow/VulnHub.git
git branch -M main
git push -u origin main
```

### 10.2 Connect to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repo: `toweringpillow/VulnHub`
4. Click "Import"
5. Configure:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 10.3 Add Environment Variables in Vercel

1. In Vercel dashboard, go to **Settings > Environment Variables**
2. Add ALL variables from your `.env.local` (EXCEPT don't add `.env.local` itself)
3. **Important**: Add these for all environments (Production, Preview, Development)
4. Update `NEXT_PUBLIC_SITE_URL` to your production domain:
   ```
   NEXT_PUBLIC_SITE_URL=https://vulnerabilityhub.com
   ```

### 10.4 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build
3. Your site will be live at `https://vulnhub-xxxx.vercel.app`

## Step 11: Configure Custom Domain (DNS)

### Option A: Using Vercel Nameservers (Recommended)

1. In Vercel dashboard, go to **Settings > Domains**
2. Add your domain: `vulnerabilityhub.com`
3. Vercel will show you nameservers (e.g., `ns1.vercel-dns.com`)
4. Go to your domain registrar (GoDaddy, Namecheap, etc.)
5. Update nameservers to Vercel's nameservers
6. Wait 24-48 hours for DNS propagation
7. Vercel will auto-configure SSL certificate

### Option B: Using CNAME Record (Faster)

1. Keep your current nameservers
2. In Vercel, add domain as above
3. Vercel will show you a CNAME value (e.g., `cname.vercel-dns.com`)
4. In your DNS provider, add:
   - **Type**: CNAME
   - **Name**: `@` (or blank for root domain)
   - **Value**: `cname.vercel-dns.com`
5. For www subdomain:
   - **Type**: CNAME
   - **Name**: `www`
   - **Value**: `cname.vercel-dns.com`
6. Wait 5-30 minutes for DNS propagation

### Verify Domain

```bash
# Check DNS propagation
dig vulnerabilityhub.com

# Should point to Vercel's IP or CNAME
```

## Step 12: Test Cron Jobs

Vercel cron jobs run automatically on schedule, but you can test them manually:

```bash
# Test scraper (in browser or curl)
curl -X POST https://your-domain.vercel.app/api/cron/scraper \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Check Vercel logs
# Go to Vercel dashboard > Deployments > Your deployment > Functions
# Find /api/cron/scraper and check logs
```

**Cron Schedule** (from `vercel.json`):
- **Scraper**: Every 15 minutes (`*/15 * * * *`)
- **World News**: Every 6 hours (`0 */6 * * *`)

## Step 13: Email Verification Setup

Supabase Auth sends verification emails automatically. To customize:

1. Go to **Authentication > Email Templates**
2. Customize the "Confirm signup" template
3. Update sender address in **Settings > Auth**

## Step 14: Monitor & Maintain

### Check Supabase Usage
- Go to **Settings > Usage**
- Free tier limits:
  - 500MB database storage
  - 2GB bandwidth/month
  - 50,000 monthly active users

### Check Vercel Usage
- Go to **Settings > Usage**
- Free tier limits:
  - 100GB bandwidth/month
  - 100 GB-hours compute
  - Serverless functions: 10 second timeout

### Check OpenAI Usage
- Go to [platform.openai.com/usage](https://platform.openai.com/usage)
- Monitor costs (should be ~$0.001 per article)
- Set budget alerts if needed

## Troubleshooting

### "Hydration Error" or Build Fails
- Check TypeScript errors: `npm run type-check`
- Clear `.next` folder: `rm -rf .next && npm run dev`

### Scraper Not Running
- Verify `CRON_SECRET` matches in Vercel env vars
- Check Vercel function logs
- Test endpoint manually with curl

### Real-time Updates Not Working
- Verify Replication enabled in Supabase
- Check browser console for WebSocket errors
- Ensure RLS policies allow read access

### Authentication Issues
- Verify Supabase URL and keys are correct
- Check email confirmation settings
- Look at Supabase Auth logs

### Database Connection Errors
- Verify service role key is correct
- Check Supabase project is not paused (free tier pauses after 7 days inactivity)
- Verify RLS policies are correct

## Security Checklist

- [ ] All environment variables set in Vercel (not in code)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is never exposed to client
- [ ] Cron endpoints protected with `CRON_SECRET`
- [ ] Supabase RLS policies enabled and tested
- [ ] CSP headers configured in `next.config.js`
- [ ] Rate limiting added to public API routes
- [ ] Input validation on all forms
- [ ] SQL injection protection (Supabase handles this)
- [ ] XSS protection (sanitize HTML)

## Need Help?

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Contact**: Use the Contact form on your deployed site

---

**Last Updated**: November 23, 2025

