# 🛡️ VulnHub - Real-Time Cybersecurity Threat Intelligence

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**VulnHub** is a real-time cybersecurity threat aggregator that collects, summarizes, and displays security threats from multiple trusted sources. Designed for cybersecurity professionals who need a comprehensive, up-to-date view of the threat landscape.

## ✨ Features

- 🤖 **AI-Powered Analysis**: OpenAI GPT-4o-mini analyzes and summarizes every threat with detailed impact and remediation information
- 🔄 **Real-Time Updates**: New threats appear instantly via Supabase Realtime subscriptions
- 🏷️ **Smart Tagging**: Auto-tags threats by OS, vendor, threat type, and severity
- 🔍 **Advanced Search**: Full-text search across titles, summaries, and tags
- 📊 **IOC Lookup**: IOC enrichment for IPs/domains/URLs/hashes via VirusTotal (optional), and CVE enrichment via NVD (no API key required)
- 🌍 **World News Ticker**: Stay updated on global cybersecurity events
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile
- 🔒 **Security First**: Built with security best practices (RLS, CSP, secure headers)
- ⚡ **High Performance**: Next.js 14 App Router with optimal SEO and performance
- 📈 **SEO Optimized**: Structured data, sitemaps, and comprehensive meta tags

## 📊 Data Sources

- **The Hacker News**
- **CISA Cybersecurity Advisories**
- **Dark Reading**
- **Securelist (Kaspersky)**
- **SecurityWeek**
- **ZDNet Security**

More sources added regularly!

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4o-mini
- **Hosting**: Vercel
- **RSS Parsing**: rss-parser
- **Scraping**: GitHub Actions (every 5 minutes)
- **Real-time**: Supabase Realtime subscriptions
- **Analytics**: Vercel Analytics

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0+
- npm 9.0.0+
- Supabase account (free tier)
- OpenAI API key
- VirusTotal API key (free tier, optional)

### Installation

```bash
# Clone the repository
git clone https://github.com/toweringpillow/VulnHub.git
cd VulnHub

# Install dependencies
npm install

# Set up environment variables
# Copy .env.local.example to .env.local and fill in your keys

# Run database migrations in Supabase SQL Editor
# Copy contents of supabase/schema.sql and run it

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Environment Variables

Create a `.env.local` file with the following:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# OpenAI
OPENAI_API_KEY=sk-your-key

# VirusTotal (optional)
VIRUSTOTAL_API_KEY=your-key

# News API (optional - for World News ticker)
NEWS_API_KEY=your-key

# Reddit API (optional - for Trending Banner)
# If not set, will use public Reddit API (may be rate-limited)
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-client-secret

# Resend Email Service (optional - for email notifications)
# Get API key from https://resend.com
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@vulnerabilityhub.com

# Security
CRON_SECRET=your-random-string

# Site Configuration
SITE_URL=https://vulnerabilityhub.com
```

### Getting a NewsAPI Key

The World News ticker feature uses [NewsAPI.org](https://newsapi.org/) to fetch general cybersecurity news headlines. Here's how to set it up:

1. **Sign up for a free account**:
   - Visit [https://newsapi.org/register](https://newsapi.org/register)
   - Create a free account (no credit card required)

2. **Get your API key**:
   - After registration, you'll receive an API key
   - Free tier includes: 100 requests/day, 1 request/second

3. **Add to environment variables**:
   - Add `NEWS_API_KEY=your-actual-api-key` to your `.env.local` file
   - For production (Vercel), add it in: Project Settings → Environment Variables

4. **How it works**:
   - The world news scraper runs via cron job (every 6 hours)
   - Fetches top 25 headlines from US news sources
   - Displays in the sidebar on the homepage
   - If `NEWS_API_KEY` is not set, the world news feature will be disabled (no errors, just empty)

**Note**: The free tier is sufficient for personal use. If you need more requests, NewsAPI offers paid plans starting at $449/month.

### Getting Reddit API Credentials (Optional but Recommended)

The Trending Banner feature uses Reddit to fetch trending cybersecurity keywords. While the public Reddit API works without credentials, it can be rate-limited. For better reliability, you can set up Reddit OAuth2:

1. **Create a Reddit app**:
   - Visit [https://www.reddit.com/prefs/apps](https://www.reddit.com/prefs/apps)
   - Scroll down and click **"create another app..."** or **"create app"**
   - Fill in the form:
     - **Name**: VulnHub (or any name you prefer)
     - **Type**: Select **"script"**
     - **Description**: "Cybersecurity news aggregator trending keywords"
     - **About URL**: Your site URL (optional)
     - **Redirect URI**: `http://localhost:3000` (required but not used for script apps)
   - Click **"create app"**

2. **Get your credentials**:
   - After creating the app, you'll see:
     - **Client ID**: The string under your app name (looks like: `abc123def456ghi789`)
     - **Client Secret**: The "secret" field (looks like: `xyz789secret123key456`)

3. **Add to environment variables**:
   - Add to `.env.local`:
     ```env
     REDDIT_CLIENT_ID=your-client-id-here
     REDDIT_CLIENT_SECRET=your-client-secret-here
     ```
   - For production (Vercel), add both in: Project Settings → Environment Variables

4. **How it works**:
   - If credentials are provided, the app uses Reddit's OAuth2 API (better rate limits)
   - If not provided, it falls back to the public Reddit JSON API (may be rate-limited)
   - The trending banner fetches from cybersecurity subreddits every 5 minutes
   - Keywords are extracted and weighted by post score and engagement

**Note**: Reddit API credentials are optional. The feature will work without them, but may be more reliable with OAuth2 authentication.

## 🏗️ Project Structure

```
VulnHub/
├── app/                    # Next.js App Router
│   ├── api/               # API routes & cron jobs
│   ├── article/           # Article detail pages
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ArticleCard.tsx    # Threat display cards
│   ├── Header.tsx        # Site header
│   ├── Navbar.tsx        # Navigation
│   └── ...
├── lib/                   # Utilities & helpers
│   ├── supabase/         # Supabase clients
│   ├── openai.ts         # AI integration
│   ├── scraper.ts        # RSS scraping
│   └── logger.ts         # Logging utility
├── supabase/             # Database schema
├── public/               # Static assets
└── types/                # TypeScript types
```

## 🔄 How It Works

1. **Scraping**: GitHub Actions cron runs every 5 minutes
2. **Parsing**: RSS feeds parsed, articles extracted
3. **AI Analysis**: OpenAI analyzes content, generates summary, extracts tags
4. **Storage**: Articles saved to Supabase PostgreSQL
5. **Real-time**: Supabase broadcasts new articles to all connected clients
6. **Display**: Users see new threats instantly without refresh

**Note:** Published dates from RSS feeds are normalized and guarded against invalid/future-dated values to prevent bad feed metadata from pinning articles to the top.

## 🛡️ Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Content Security Policy (CSP)**: Prevents XSS attacks
- **Secure Headers**: HSTS, X-Frame-Options, X-Content-Type-Options, etc.
- **Input Sanitization**: All user inputs validated and sanitized
- **Environment Variables**: All secrets in .env (never committed)
- **Cron Authentication**: Protected endpoints with secret tokens
- **Rate Limiting**: API endpoints protected against abuse

## 📈 SEO Features

- **Structured Data (JSON-LD)**: Organization, Website, and Article schemas
- **Sitemap**: Dynamic sitemap with all articles
- **Robots.txt**: Properly configured for search engines
- **Meta Tags**: Comprehensive Open Graph and Twitter Card tags
- **Canonical URLs**: Prevents duplicate content issues
- **Semantic HTML**: Proper heading hierarchy and article structure

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Branch Structure

- **`main` branch** → Production (deploys to `vulnerabilityhub.com`)
- **`dev` branch** → Development/Staging (deploys to preview URL)

### GitHub Actions Setup

The scraper runs automatically via GitHub Actions every 5 minutes. Configure:

1. Go to GitHub repo → Settings → Secrets and variables → Actions
2. Add repository secrets:
   - `CRON_SECRET`: Your cron secret (same as Vercel env var)
3. Add repository variables:
   - `SCRAPER_URL`: Your production URL (e.g., `vulnerabilityhub.com`)

## 📊 Usage & Costs

### Free Tiers

- **Vercel**: 100GB bandwidth/month
- **Supabase**: 500MB database, 2GB bandwidth/month
- **OpenAI**: Pay-as-you-go (~$0.001 per article)
- **VirusTotal**: 500 requests/day
- **GitHub Actions**: 2,000 minutes/month

### Estimated Costs

- ~50 articles/day × $0.001 = **$1.50/month** (OpenAI)
- Vercel, Supabase, GitHub Actions: **$0/month** (free tier)
- **Total**: ~$1.50/month

## 🤝 Contributing

This is a personal project, but suggestions and contributions are welcome! Open an issue or submit a PR.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **OpenAI**: For GPT-4o-mini API
- **Supabase**: For excellent PostgreSQL hosting & auth
- **Vercel**: For seamless Next.js deployment
- **RSS Feed Providers**: CISA, The Hacker News, Dark Reading, SecurityWeek, Securelist

---

**Built with ❤️ for the cybersecurity community**

🔗 **Live Site**: [https://vulnerabilityhub.com](https://vulnerabilityhub.com)  
🐙 **GitHub**: [https://github.com/toweringpillow/VulnHub](https://github.com/toweringpillow/VulnHub)
