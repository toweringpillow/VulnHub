# DNS Verification Steps

## The Problem

You're seeing cPanel DNS records because either:
1. Nameservers haven't fully switched to Vercel yet
2. There's a DNS cache issue
3. Vercel DNS records aren't configured correctly

## Step 1: Verify Nameservers in Namecheap

1. **Log into Namecheap**
2. **Go to Domain List** → Click **Manage** next to `vulnerabilityhub.com`
3. **Check Nameservers section:**
   - Should show: `Custom DNS` (not "Namecheap BasicDNS")
   - Should show: `ns1.vercel-dns.com` and `ns2.vercel-dns.com`
   - If it shows something else, **change it now**

## Step 2: Check What Nameservers Are Actually Active

Use these tools to verify:

1. **whatsmydns.net:**
   - Visit: https://www.whatsmydns.net/#NS/vulnerabilityhub.com
   - Should show: `ns1.vercel-dns.com` and `ns2.vercel-dns.com`
   - If it shows cPanel nameservers, DNS hasn't propagated yet

2. **dig command (if you have it):**
   ```bash
   dig NS vulnerabilityhub.com
   ```
   Should show Vercel nameservers

3. **Online DNS checker:**
   - https://dnschecker.org/#NS/vulnerabilityhub.com
   - Check multiple locations worldwide

## Step 3: Check Vercel DNS Records

1. **Go to Vercel Dashboard:**
   - Your project → Settings → Domains
   - Click on `vulnerabilityhub.com`

2. **Verify DNS Records:**
   - Should see an A record pointing to Vercel's IP
   - Should see CNAME for www if configured
   - **If no records show, Vercel hasn't configured DNS yet**

3. **If Vercel shows "Pending" or "Not Configured":**
   - The domain might not be fully verified
   - Wait a bit longer or re-add the domain

## Step 4: The cPanel Records Issue

**Those cPanel records won't interfere IF nameservers are correct**, but:

- The A record `198.54.116.91` is the cPanel server
- If nameservers point to Vercel, Vercel's A record takes precedence
- If you're still seeing cPanel, nameservers might not have switched

## Step 5: Force DNS Refresh

1. **Clear local DNS cache:**
   ```powershell
   # Windows PowerShell (as Admin)
   ipconfig /flushdns
   ```

2. **Try different DNS servers:**
   - Use Google DNS: 8.8.8.8
   - Use Cloudflare DNS: 1.1.1.1
   - Change in network settings temporarily

3. **Try from different location:**
   - Use mobile data (different network)
   - Use VPN
   - Use incognito/private browsing

## Step 6: Check Vercel Domain Status

In Vercel Dashboard → Settings → Domains:

- **Status should be:** "Valid Configuration" or "Active"
- **If it says "Pending":** Wait for verification
- **If it says "Error":** Check the error message

## What to Do Right Now

1. **Double-check nameservers in Namecheap** - make absolutely sure they're saved as Vercel's
2. **Check whatsmydns.net** - see what nameservers are actually active globally
3. **Check Vercel domain status** - make sure domain is verified and active
4. **Wait 1-2 more hours** - DNS can take time to fully propagate

## If Still Not Working After 24 Hours

1. **Remove domain from Vercel and re-add it**
2. **Double-check nameservers are exactly:**
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
3. **Contact Vercel support** if domain shows as verified but site doesn't load

