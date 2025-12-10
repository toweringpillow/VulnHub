# Insecure Test Environment Setup Guide

This guide explains how to set up and remove the intentionally insecure test environment for EASM (External Attack Surface Management) scanning.

## ⚠️ WARNING

**This test environment is intentionally insecure and should ONLY be used for security testing purposes.**
- DO NOT enable in production without proper controls
- DO NOT leave enabled after testing
- DO NOT expose sensitive information

## Purpose

This test environment is designed to help test EASM tools by providing:
- Missing security headers
- Exposed debug information
- Common misconfigurations
- Error pages with stack traces
- Exposed endpoints

## Setup Instructions

### Step 1: Enable the Test Environment

Add the environment variable to enable the test environment:

**Local Development (`.env.local`):**
```env
ENABLE_INSECURE_TEST=true
```

**Vercel (Production):**
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add:
   - `ENABLE_INSECURE_TEST` = `true`
3. Add to **all environments** (Production, Preview, Development)
4. **Redeploy** your application

### Step 2: Configure Subdomain (Optional)

If you want to use a subdomain like `test.vulnerabilityhub.com`:

1. **Add DNS Record:**
   - Go to your domain registrar
   - Add a CNAME record:
     - Name: `test`
     - Value: `cname.vercel-dns.com` (or your Vercel domain)

2. **Add Domain in Vercel:**
   - Go to Vercel → Your Project → Settings → Domains
   - Add `test.vulnerabilityhub.com`
   - Wait for DNS verification

3. **Deploy:**
   - The test environment will be accessible at `https://test.vulnerabilityhub.com/test-insecure`

### Step 3: Access Test Environment

Once enabled, access the test environment at:
- Main page: `https://your-domain.com/test-insecure`
- Debug info: `https://your-domain.com/test-insecure/debug`
- Environment vars: `https://your-domain.com/test-insecure/env`
- Headers: `https://your-domain.com/test-insecure/headers`
- Error page: `https://your-domain.com/test-insecure/error`
- API endpoint: `https://your-domain.com/test-insecure` (GET)

## What's Exposed (Intentionally)

### Security Headers (Missing)
- ❌ Content-Security-Policy
- ❌ X-Frame-Options
- ❌ X-Content-Type-Options
- ❌ Strict-Transport-Security
- ❌ X-XSS-Protection
- ❌ Referrer-Policy
- ❌ Permissions-Policy

### Exposed Information
- Server information (X-Powered-By, Server headers)
- Debug information
- Environment variables (non-sensitive)
- Request headers
- Error stack traces
- Version information
- Build timestamps

### Common Misconfigurations
- Permissive CORS (`Access-Control-Allow-Origin: *`)
- No rate limiting
- Exposed API endpoints
- Debug mode enabled
- Robots.txt allows indexing

## Testing Checklist

Use this checklist to verify your EASM tool detects:

- [ ] Missing security headers
- [ ] Exposed server information
- [ ] Exposed debug endpoints
- [ ] Missing CSP header
- [ ] Missing HSTS header
- [ ] Permissive CORS
- [ ] Exposed error stack traces
- [ ] Exposed environment information
- [ ] Missing X-Frame-Options
- [ ] Missing X-Content-Type-Options

## Quick Removal / Decommission

### Option 1: Disable via Environment Variable (Recommended)

**Local:**
```env
ENABLE_INSECURE_TEST=false
```

**Vercel:**
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Edit `ENABLE_INSECURE_TEST`
3. Set value to `false` or delete the variable
4. **Redeploy** your application

The test environment will return "Test environment disabled" messages.

### Option 2: Remove Files (Permanent)

If you want to completely remove the test environment:

```bash
# Remove test environment files
rm -rf app/test-insecure
```

Then:
1. Update `next.config.js` to remove the test-insecure headers configuration
2. Commit and push changes
3. Redeploy

### Option 3: DNS Removal (If Using Subdomain)

1. **Remove DNS Record:**
   - Go to your domain registrar
   - Delete the CNAME record for `test.vulnerabilityhub.com`

2. **Remove Domain in Vercel:**
   - Go to Vercel → Your Project → Settings → Domains
   - Remove `test.vulnerabilityhub.com`

3. **Wait for DNS propagation** (up to 48 hours)

## Files Created

The following files were created for the test environment:

```
app/test-insecure/
├── page.tsx              # Main test page
├── route.ts              # API endpoint
├── debug/
│   └── page.tsx          # Debug information
├── env/
│   └── page.tsx          # Environment variables
├── headers/
│   └── page.tsx          # Request headers
└── error/
    └── page.tsx          # Error page with stack trace
```

## Security Notes

1. **Never commit with `ENABLE_INSECURE_TEST=true`** in production
2. **Always disable after testing** - set to `false` or remove
3. **Monitor access logs** while enabled
4. **Use a separate subdomain** if possible to isolate
5. **Set up alerts** for unexpected access patterns
6. **Review exposed information** - ensure no secrets are leaked

## Troubleshooting

### Test Environment Not Showing

1. Check `ENABLE_INSECURE_TEST=true` is set
2. Verify environment variable is in correct environment (Production/Preview/Development)
3. Redeploy after adding environment variable
4. Check Vercel function logs for errors

### Subdomain Not Working

1. Verify DNS CNAME record is correct
2. Check DNS propagation (can take up to 48 hours)
3. Verify domain is added in Vercel
4. Check Vercel domain verification status

### Still Seeing Security Headers

1. Clear browser cache
2. Check that you're accessing `/test-insecure` routes
3. Verify `next.config.js` has the test-insecure header configuration
4. Redeploy after changes

## Best Practices

1. ✅ **Enable only when testing** - disable immediately after
2. ✅ **Use separate subdomain** - isolate from production
3. ✅ **Monitor access** - watch for unexpected traffic
4. ✅ **Time-boxed** - set a reminder to disable after X hours/days
5. ✅ **Document usage** - note when and why it was enabled
6. ✅ **Review logs** - check what was accessed after testing

## Support

If you need help:
- Check Vercel logs for errors
- Verify environment variables are set correctly
- Ensure DNS is configured properly (if using subdomain)
- Review this guide for troubleshooting steps

---

**Remember: Always disable the test environment after your EASM scan is complete!**

