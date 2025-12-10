# Quick Removal Guide - Insecure Test Environment

## 🚨 Fastest Way to Disable

### Method 1: Environment Variable (30 seconds)

**Vercel:**
1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Find: `ENABLE_INSECURE_TEST`
3. Change value to: `false` (or delete it)
4. Click **Save**
5. **Redeploy** (or wait for auto-deploy)

**Result:** Test environment shows "Test environment disabled" message

### Method 2: Remove Files (2 minutes)

If you want to completely remove:

```bash
# Remove test environment directory
rm -rf app/test-insecure

# Remove test robots.txt (if created)
rm public/test-insecure-robots.txt
```

Then:
1. Update `next.config.js` - remove the `/test-insecure/:path*` headers section
2. Commit and push:
   ```bash
   git add .
   git commit -m "Remove insecure test environment"
   git push
   ```
3. Vercel will auto-deploy

### Method 3: DNS Removal (If Using Subdomain)

1. **Domain Registrar:**
   - Delete CNAME record: `test` → `cname.vercel-dns.com`

2. **Vercel:**
   - Settings → Domains → Remove `test.vulnerabilityhub.com`

3. **Wait:** DNS propagation (up to 48 hours)

## Verification

After disabling, verify:
- ✅ `https://your-domain.com/test-insecure` shows "Test environment disabled"
- ✅ No security headers are missing on main site
- ✅ Test endpoints return 403 or disabled message

## Emergency Disable

If you need to disable immediately:

1. **Set environment variable to `false`** (fastest)
2. **Redeploy** in Vercel
3. **Done** - takes ~2 minutes

## Files to Remove (Complete Removal)

If removing completely, delete:
- `app/test-insecure/` (entire directory)
- `public/test-insecure-robots.txt` (if exists)
- Update `next.config.js` (remove test-insecure headers section)
- Update `INSECURE_TEST_SETUP.md` (optional, for documentation)

## Checklist

- [ ] Set `ENABLE_INSECURE_TEST=false` in Vercel
- [ ] Redeploy application
- [ ] Verify test environment is disabled
- [ ] (Optional) Remove DNS record for subdomain
- [ ] (Optional) Remove domain from Vercel
- [ ] (Optional) Delete test files from codebase

---

**Time to disable: ~2 minutes**
**Time to completely remove: ~5 minutes**

