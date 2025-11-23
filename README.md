# 🛡️ VulnHub - Real-Time Cybersecurity Threat Intelligence

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**VulnHub** is a real-time cybersecurity threat aggregator that collects, summarizes, and displays security threats from multiple sources. Designed for cybersecurity professionals to have a one-stop shop for all cyber news.

## ✨ Features

- 🤖 **AI-Powered Summaries**: OpenAI GPT-4o-mini analyzes and summarizes every threat
- 🔄 **Real-Time Updates**: New threats appear instantly via Supabase Realtime
- 🏷️ **Smart Tagging**: Auto-tags threats by OS, vendor, threat type, severity
- 🔍 **Advanced Search**: Full-text search across titles, summaries, and tags
- 👤 **User Accounts**: Register, login, customize alert subscriptions
- 📊 **IOC Lookup**: VirusTotal API integration for hash/URL analysis
- 🌍 **World News Ticker**: Stay updated on global events
- 📱 **Responsive Design**: Works beautifully on desktop, tablet, and mobile
- 🔒 **Security First**: Built with security best practices (RLS, CSP, input validation)
- ⚡ **Lightning Fast**: Next.js 14 App Router with optimal performance

## 📊 Data Sources

- **The Hacker News**
- **CISA Cybersecurity Advisories**
- **Dark Reading**
- **Securelist (Kaspersky)**
- **SecurityWeek**
- **ZDNet Security**
- More sources added regularly!

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI**: OpenAI GPT-4o-mini
- **Hosting**: Vercel
- **RSS Parsing**: rss-parser
- **Scraping**: Vercel Cron Jobs (every 15 minutes)
- **Real-time**: Supabase Realtime subscriptions

## 🚀 Quick Start

### Prerequisites

- Node.js 18.17.0+
- npm 9.0.0+
- Supabase account (free tier)
- OpenAI API key
- VirusTotal API key (free tier)

### Installation

```bash
# Clone the repository
git clone https://github.com/toweringpillow/VulnHub.git
cd VulnHub

# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Edit .env.local with your keys (see SETUP_GUIDE.md)

# Run database migrations in Supabase SQL Editor
# Copy contents of supabase/schema.sql and run it

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Documentation

- **[Setup Guide](SETUP_GUIDE.md)**: Complete step-by-step setup instructions
- **[Project Notes](PROJECT_NOTES.md)**: Technical architecture and LLM context (gitignored)
- **[Environment Variables](.env.local.example)**: All required API keys and config

## 🔐 Environment Variables

Create a `.env.local` file with the following (see `.env.local.example` for details):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# OpenAI
OPENAI_API_KEY=sk-your-key

# VirusTotal
VIRUSTOTAL_API_KEY=your-key

# Web3Forms (contact form)
WEB3FORMS_ACCESS_KEY=your-key

# News API (optional)
NEWS_API_KEY=your-key

# Security
CRON_SECRET=your-random-string
```

## 🏗️ Project Structure

```
VulnHub/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes
│   ├── (main)/            # Main app routes
│   ├── api/               # API routes & cron jobs
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Header.tsx        # Animated binary header
│   ├── Navbar.tsx        # Navigation
│   ├── ArticleCard.tsx   # Threat display cards
│   └── ...
├── lib/                   # Utilities & helpers
│   ├── supabase/         # Supabase client
│   ├── openai.ts         # AI integration
│   └── scraper.ts        # RSS scraping
├── supabase/             # Database schema
├── public/               # Static assets
├── types/                # TypeScript types
├── .env.local.example    # Environment template
└── vercel.json           # Vercel config (cron)
```

## 🔄 How It Works

1. **Scraping**: Vercel cron job runs every 15 minutes
2. **Parsing**: RSS feeds parsed, articles extracted
3. **AI Analysis**: OpenAI analyzes content, generates summary, extracts tags
4. **Storage**: Articles saved to Supabase PostgreSQL
5. **Real-time**: Supabase broadcasts new articles to all connected clients
6. **Display**: Users see new threats instantly without refresh

## 🛡️ Security Features

- **Row Level Security (RLS)**: Database-level access control
- **Content Security Policy (CSP)**: Prevents XSS attacks
- **Input Sanitization**: All user inputs sanitized
- **Rate Limiting**: API endpoints protected
- **Secure Headers**: HSTS, X-Frame-Options, etc.
- **Environment Variables**: All secrets in .env (never committed)
- **Cron Authentication**: Protected with secret token

## 📱 Responsive Design

VulnHub works perfectly on:
- 💻 Desktop (1920px+)
- 💻 Laptop (1280px - 1919px)
- 📱 Tablet (768px - 1279px)
- 📱 Mobile (320px - 767px)

## 🎨 Design Philosophy

- **Dark Theme**: Professional cybersecurity aesthetic
- **Animated Binary Header**: Floating 1s and 0s (preserved from original)
- **Clean Cards**: Easy-to-scan threat information
- **Fast Navigation**: Sticky navbar, smooth scrolling
- **Accessible**: WCAG 2.1 AA compliant

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed instructions.

### DNS Configuration

Point your domain to Vercel:

**Option 1: Nameservers**
- Update nameservers to Vercel's (ns1.vercel-dns.com, ns2.vercel-dns.com)

**Option 2: CNAME**
- Add CNAME record: `@ → cname.vercel-dns.com`

## 📊 Usage & Costs

### Free Tiers

- **Vercel**: 100GB bandwidth/month
- **Supabase**: 500MB database, 2GB bandwidth/month
- **OpenAI**: Pay-as-you-go (~$0.001 per article)
- **VirusTotal**: 500 requests/day

### Estimated Costs

- ~50 articles/day × $0.001 = **$1.50/month** (OpenAI)
- Vercel & Supabase: **$0/month** (free tier)
- **Total**: ~$1.50/month

## 🤝 Contributing

This is a personal project, but suggestions are welcome! Open an issue or submit a PR.

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- **OpenAI**: For GPT-4o-mini API
- **Supabase**: For excellent PostgreSQL hosting & auth
- **Vercel**: For seamless Next.js deployment
- **RSS Feed Providers**: CISA, The Hacker News, Dark Reading, SecurityWeek, Securelist

## 📧 Contact

Have questions? Use the contact form on the live site or open a GitHub issue.

---

**Built with ❤️ for the cybersecurity community**

🔗 **Live Site**: [https://vulnerabilityhub.com](https://vulnerabilityhub.com)  
🐙 **GitHub**: [https://github.com/toweringpillow/VulnHub](https://github.com/toweringpillow/VulnHub)

