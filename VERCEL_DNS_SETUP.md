# Vercel DNS Setup for test.vulnerabilityhub.com

## ⚠️ Your Current DNS Configuration is INCORRECT

Based on your screenshot, you have:
- **Name:** `test`
- **Type:** `CNAME`
- **Value:** `test.vulnerabilityhub.com` ❌ **WRONG**

This creates a circular reference and won't work!

## ✅ Correct Vercel DNS Setup

### Option 1: Using Vercel's Nameservers (Recommended)

If you're using Vercel's nameservers for the main domain:

1. **Add Domain in Vercel First:**
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Click **Add Domain**
   - Enter: `test.vulnerabilityhub.com`
   - Vercel will automatically configure DNS

2. **No Manual DNS Record Needed:**
   - Vercel handles it automatically when using their nameservers

### Option 2: Using Third-Party DNS (Your Current Setup)

If you're managing DNS yourself (not using Vercel nameservers):

1. **Add Domain in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Domains
   - Click **Add Domain**
   - Enter: `test.vulnerabilityhub.com`
   - Vercel will show you what to configure

2. **Add CNAME Record in Your DNS:**
   - **Name:** `test` (or `test.vulnerabilityhub.com` depending on your DNS provider)
   - **Type:** `CNAME`
   - **Value:** `cname.vercel-dns.com` ✅ **CORRECT**
   - **TTL:** `60` (or auto)

   **OR** Vercel might give you a specific value like:
   - `cname.vercel-dns.com`
   - Or a specific Vercel domain

3. **Wait for DNS Propagation:**
   - Can take 5 minutes to 48 hours
   - Check status in Vercel dashboard

## Step-by-Step Instructions

### Step 1: Add Domain in Vercel

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Domains**
2. Click: **Add Domain**
3. Enter: `test.vulnerabilityhub.com`
4. Click: **Add**
5. Vercel will show you the DNS configuration needed

### Step 2: Configure DNS (If Using Third-Party DNS)

**In your DNS provider (where you took the screenshot):**

1. **Delete the incorrect record** (if it exists):
   - Name: `test`
   - Value: `test.vulnerabilityhub.com` ❌

2. **Add the correct CNAME record:**
   - **Name:** `test`
   - **Type:** `CNAME`
   - **Value:** `cname.vercel-dns.com` ✅
   - **TTL:** `60`
   - **Comment:** `Test subdomain for EASM scanning`

3. **Save the record**

### Step 3: Enable Test Environment

1. Go to: **Vercel Dashboard** → **Your Project** → **Settings** → **Environment Variables**
2. Add:
   - **Key:** `ENABLE_INSECURE_TEST`
   - **Value:** `true`
   - **Environments:** Production, Preview, Development (all)
3. Click: **Save**
4. **Redeploy** your application

### Step 4: Verify

1. Wait for DNS propagation (check in Vercel dashboard)
2. Once verified, access: `https://test.vulnerabilityhub.com/test-insecure`
3. You should see the insecure test environment page

## Common Issues

### "Domain not verified" in Vercel

- Wait for DNS propagation (can take up to 48 hours)
- Verify the CNAME record is correct
- Check that the record is active in your DNS provider

### "Circular reference" error

- This happens if you point CNAME to itself
- Make sure Value is `cname.vercel-dns.com`, NOT `test.vulnerabilityhub.com`

### Subdomain not working

1. Check DNS record is correct
2. Wait for DNS propagation
3. Verify domain is added in Vercel
4. Check Vercel domain verification status

## Quick Reference

**Correct DNS Record:**
```
Name: test
Type: CNAME
Value: cname.vercel-dns.com
TTL: 60
```

**Environment Variable:**
```
ENABLE_INSECURE_TEST=true
```

**Access URL:**
```
https://test.vulnerabilityhub.com/test-insecure
```

## After Testing

Remember to:
1. Set `ENABLE_INSECURE_TEST=false` in Vercel
2. Redeploy
3. (Optional) Remove DNS record
4. (Optional) Remove domain from Vercel

See `QUICK_REMOVE_TEST.md` for removal instructions.

