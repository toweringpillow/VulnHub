# Cybersecurity Tools - Environment Variables

This document lists all environment variables needed for the cybersecurity tools available in the `/tools` page.

## Required Variables

### None (All tools work without API keys)

All tools are designed to work without any API keys. Some features will be limited, but basic functionality is available.

## Optional Variables (Enhanced Features)

### VirusTotal API Key

**Variable:** `VIRUSTOTAL_API_KEY`

**Description:** Enables enhanced IOC lookup, hash lookup, IP reputation checking, and URL analysis using VirusTotal's threat intelligence database.

**How to get:**
1. Sign up for a free account at https://www.virustotal.com/gui/join-us
2. Go to your profile settings
3. Copy your API key
4. Add it to your `.env.local` file (for local development) or Vercel environment variables (for production)

**Free Tier Limits:**
- 4 API requests per minute
- 500 requests per day
- Perfect for personal use and small-scale operations

**Tools Enhanced:**
- **IOC Lookup**: Checks IPs, domains, URLs, and hashes against VirusTotal database
- **Hash Lookup**: Full file hash analysis with detection rates
- **IP Reputation**: Threat intelligence for IP addresses
- **URL Analyzer**: URL reputation and threat detection

**Example:**
```env
VIRUSTOTAL_API_KEY=your_api_key_here
```

## Tools That Work Without API Keys

The following tools work completely without any API keys:

1. **Email Header Analyzer** - Client-side parsing, no API needed
2. **DNS Lookup** - Uses Node.js built-in DNS resolver
3. **WHOIS Lookup** - Uses free public APIs (limited information)
4. **IP Reputation** - Basic geolocation works without API key (reputation checking requires VirusTotal)

## Setup Instructions

### Local Development

1. Copy `.env.local.example` to `.env.local` (if it exists)
2. Add the optional variables you want to use:
   ```env
   VIRUSTOTAL_API_KEY=your_key_here
   ```
3. Restart your development server

### Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the variables:
   - `VIRUSTOTAL_API_KEY` (optional)
4. Redeploy your application

## Rate Limiting

### VirusTotal Free Tier
- **Rate Limit**: 4 requests per minute
- **Daily Limit**: 500 requests per day
- **Recommendation**: The tools handle rate limiting gracefully. If you exceed limits, you'll see appropriate error messages.

## Tool-Specific Notes

### Email Header Analyzer
- **No API required** - Fully client-side
- Parses email headers locally in the browser
- Shows SPF, DKIM, DMARC status
- Displays routing path and authentication results

### IOC Lookup
- **Without API**: Shows IOC type detection only
- **With VirusTotal API**: Full threat intelligence lookup for IPs, domains, URLs, and hashes
- **CVE support**: CVE enrichment uses the NVD API (no API key required)
- Supports: IPs, domains, URLs, hashes (MD5, SHA1, SHA256), CVEs

### DNS Lookup
- **No API required** - Uses Node.js DNS resolver
- Supports: A, AAAA, MX, TXT, CNAME, NS, SOA records
- Works for any publicly resolvable domain

### WHOIS Lookup
- **Without API**: Limited information from free services
- **With paid API**: Full registration details
- Currently uses free IP geolocation API (limited WHOIS data)

### IP Reputation
- **Without API**: Basic geolocation only
- **With VirusTotal API**: Full threat intelligence and reputation scoring

### Hash Lookup
- **Without API**: Hash type detection only
- **With VirusTotal API**: Full malware detection with scan results

### URL Analyzer
- **Without API**: Basic URL parsing and DNS lookup
- **With VirusTotal API**: Full URL reputation and threat detection

## Troubleshooting

### "API key not configured" messages
- These are informational messages, not errors
- Tools will still work with limited functionality
- Add the appropriate API key to enable enhanced features

### Rate limit errors
- VirusTotal free tier: Wait 15 seconds between requests
- The tools will automatically handle rate limiting
- Consider upgrading to a paid plan for higher limits

### DNS lookup failures
- Check that the domain is publicly resolvable
- Some domains may have DNS restrictions
- Try different record types (A, MX, etc.)

## Security Notes

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys periodically
- Monitor API usage to avoid unexpected charges (for paid tiers)

## Future Enhancements

Potential additions that may require additional API keys:
- AbuseIPDB integration (IP reputation)
- Shodan integration (device/port scanning)
- Hybrid Analysis integration (sandbox analysis)
- URLScan.io integration (URL screenshot and analysis)

