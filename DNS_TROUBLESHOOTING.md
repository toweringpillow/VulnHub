# DNS Troubleshooting - cPanel and Nameservers

## How Nameservers Work

When you change nameservers in Namecheap to point to Vercel, **those nameservers take full control** of DNS for that domain. This means:

- ✅ **Vercel's nameservers** control all DNS records
- ❌ **cPanel DNS settings** are ignored (because nameservers point elsewhere)
- ❌ **Namecheap's DNS settings** are ignored (because nameservers point elsewhere)

## Do You Need to Unlink cPanel?

**Short answer: No, you don't need to unlink cPanel**, but you should understand what happens:

### What Happens:

1. **Nameservers Override Everything:**
   - When nameservers point to Vercel, Vercel controls DNS
   - cPanel DNS records are not used
   - Namecheap DNS records are not used

2. **cPanel Can Still Be Used For:**
   - Other domains (if you have multiple)
   - Email hosting (if you keep email on cPanel)
   - Other services not related to this domain

3. **The Domain Itself:**
   - The domain `vulnerabilityhub.com` will resolve to Vercel
   - cPanel won't serve this domain anymore

## Important: Email and Other Services

If you have email or other services through cPanel, you need to preserve those DNS records:

### Option 1: Keep Email on cPanel (Recommended)

1. **In Vercel Dashboard:**
   - Go to your project → Settings → Domains
   - Click on `vulnerabilityhub.com`
   - Add DNS records for email:
     - **MX Records:** Point to your cPanel email server
     - **TXT Records:** SPF, DKIM records for email authentication

2. **Get Email DNS Records from cPanel:**
   - Log into cPanel
   - Go to "Email Accounts" or "Email Routing"
   - Note the mail server hostname (e.g., `mail.vulnerabilityhub.com`)
   - Get MX records (e.g., `10 mail.vulnerabilityhub.com`)

3. **Add to Vercel:**
   - In Vercel → Domains → DNS Records
   - Add MX record: `@` → `10 mail.vulnerabilityhub.com`
   - Add A record for mail: `mail` → `your-cpanel-ip`

### Option 2: Use Namecheap Email (If Available)

If Namecheap provides email hosting, you can use that instead.

### Option 3: Use External Email Service

- Google Workspace
- Microsoft 365
- Zoho Mail
- etc.

## Checking Current DNS Setup

### In Namecheap:

1. **Check Nameservers:**
   - Domain List → Manage → Nameservers
   - Should show Vercel nameservers (ns1.vercel-dns.com, ns2.vercel-dns.com)

2. **Check Advanced DNS (if nameservers are custom):**
   - If nameservers are still Namecheap, check Advanced DNS tab
   - Note any MX, TXT, or other important records

### In cPanel:

1. **Check DNS Zone Editor:**
   - Log into cPanel
   - Go to "Zone Editor" or "DNS Zone"
   - Note any important records (MX, TXT, CNAME, etc.)
   - **These won't be used** if nameservers point to Vercel, but good to have for reference

## Verification Steps

1. **Check DNS Propagation:**
   - Visit [whatsmydns.net](https://www.whatsmydns.net)
   - Enter `vulnerabilityhub.com`
   - Check A records - should point to Vercel's IP
   - Check nameservers - should show Vercel's nameservers

2. **Test Your Site:**
   - Visit `https://vulnerabilityhub.com`
   - Should load your Vercel deployment

3. **Test Email (if applicable):**
   - Send a test email to an address on your domain
   - Check if it's received

## Common Issues

### Issue: Site Still Shows cPanel Default Page

**Cause:** DNS hasn't propagated yet or nameservers weren't saved correctly

**Solution:**
- Wait 24-48 hours for full propagation
- Double-check nameservers in Namecheap are saved correctly
- Clear browser cache
- Try from different network/device

### Issue: Email Not Working

**Cause:** MX records not configured in Vercel

**Solution:**
- Add MX records in Vercel DNS settings
- Point to your email server (cPanel or email provider)
- Wait for DNS propagation

### Issue: Subdomain Not Working

**Cause:** Subdomain DNS records not in Vercel

**Solution:**
- Add subdomain in Vercel → Settings → Domains
- Or add CNAME/A records in Vercel DNS

## Summary

- ✅ **No need to unlink cPanel** - nameservers override it
- ✅ **cPanel DNS is ignored** when nameservers point to Vercel
- ⚠️ **Preserve email DNS records** if you use cPanel email
- ✅ **Domain will work** once DNS propagates (1-48 hours)

## Next Steps

1. Verify nameservers are set correctly in Namecheap
2. Wait for DNS propagation (check with whatsmydns.net)
3. If you use email, add MX records in Vercel
4. Test your site once DNS propagates
5. Keep cPanel for other services if needed (it won't interfere)

