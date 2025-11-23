# Domain Setup Guide - Namecheap to Vercel

This guide will walk you through pointing `vulnerabilityhub.com` from Namecheap to Vercel.

## Step 1: Get Vercel DNS Information

1. **Go to Vercel Dashboard:**
   - Visit [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click on your project (`vuln-hub`)

2. **Add Your Domain:**
   - Go to `Settings` → `Domains`
   - Click `Add Domain`
   - Enter: `vulnerabilityhub.com`
   - Click `Add`

3. **Vercel will show you DNS configuration options:**
   - You'll see two options:
     - **Option A: Nameservers** (Recommended - easier)
     - **Option B: A/CNAME Records** (If you want to keep using Namecheap DNS)

## Step 2A: Using Nameservers (Recommended - Easier)

This is the simplest method. You'll point your domain's nameservers to Vercel.

### In Namecheap:

1. **Log into Namecheap:**
   - Go to [namecheap.com](https://www.namecheap.com) and log in
   - Go to `Domain List`

2. **Find your domain:**
   - Click `Manage` next to `vulnerabilityhub.com`

3. **Change Nameservers:**
   - Scroll to `Nameservers` section
   - Select `Custom DNS` (instead of "Namecheap BasicDNS")
   - Vercel will provide you with nameservers like:
     ```
     ns1.vercel-dns.com
     ns2.vercel-dns.com
     ```
   - Enter these nameservers
   - Click the checkmark to save

4. **Wait for DNS Propagation:**
   - Changes can take 24-48 hours, but usually happen within 1-2 hours
   - You can check status at [whatsmydns.net](https://www.whatsmydns.net)

### In Vercel:

1. **Verify Domain:**
   - Go back to Vercel → Settings → Domains
   - Vercel will automatically verify your domain
   - Once verified, you'll see a green checkmark

## Step 2B: Using A/CNAME Records (Alternative)

If you prefer to keep using Namecheap's DNS instead of Vercel's nameservers:

### In Vercel:

1. When adding the domain, Vercel will show you DNS records to add
2. You'll see something like:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

### In Namecheap:

1. **Go to Advanced DNS:**
   - In domain management, go to `Advanced DNS` tab
   - Remove any existing A records for `@` and `www`

2. **Add Vercel Records:**
   - Click `Add New Record`
   - Add the A record Vercel provided:
     - Type: `A Record`
     - Host: `@`
     - Value: `76.76.21.21` (Vercel's IP - use what Vercel shows)
     - TTL: `Automatic`
   - Add the CNAME record:
     - Type: `CNAME Record`
     - Host: `www`
     - Value: `cname.vercel-dns.com` (or what Vercel shows)
     - TTL: `Automatic`

3. **Save and wait for propagation**

## Step 3: Verify Everything Works

1. **Check DNS Propagation:**
   - Visit [whatsmydns.net](https://www.whatsmydns.net)
   - Enter `vulnerabilityhub.com`
   - Check that A records point to Vercel's IP

2. **Test Your Site:**
   - Visit `https://vulnerabilityhub.com`
   - Should load your Vercel deployment

3. **Check SSL Certificate:**
   - Vercel automatically provisions SSL certificates
   - Should see the padlock icon in browser

## Step 4: Update Environment Variables

Once your domain is live, update your scraper URL:

1. **In GitHub Secrets** (for GitHub Actions cron):
   - Go to GitHub repo → Settings → Secrets
   - Update `SCRAPER_URL` to: `https://vulnerabilityhub.com`

2. **In Vercel Environment Variables:**
   - Go to Vercel → Project Settings → Environment Variables
   - Update `NEXT_PUBLIC_SITE_URL` to: `https://vulnerabilityhub.com`

## Troubleshooting

### Domain not resolving?
- Wait 24-48 hours for full DNS propagation
- Clear your browser cache
- Try accessing from different network/device
- Check Namecheap DNS settings are saved correctly

### SSL Certificate issues?
- Vercel automatically provisions SSL, but it can take a few minutes
- If issues persist, check Vercel domain settings

### Still seeing old site?
- Clear browser cache (Ctrl+Shift+Delete)
- Try incognito/private browsing
- DNS might still be propagating

## Important Notes

- **cPanel:** You can keep your cPanel hosting for other services, but the main domain will point to Vercel
- **Email:** If you have email through Namecheap/cPanel, make sure to keep MX records in Advanced DNS
- **Subdomains:** You can add subdomains in Vercel (like `www.vulnerabilityhub.com`) separately

