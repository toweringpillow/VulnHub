# Resend Email Integration Setup Guide

This guide walks you through setting up Resend for email notifications in VulnHub.

## Overview

VulnHub uses Resend to send:
- **Welcome emails** when users sign up
- **Subscription alerts** when new threats match user subscriptions

## Step 1: Create Resend Account

1. Go to [https://resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Your API Key

1. After logging in, go to **API Keys** in the sidebar
2. Click **Create API Key**
3. Give it a name (e.g., "VulnHub Production")
4. Select **Sending access** (full access)
5. Copy the API key (starts with `re_`)

**Important:** You'll only see the API key once. Save it securely!

## Step 3: Verify Your Domain (Recommended for Production)

For production, you should verify your domain:

1. Go to **Domains** in Resend dashboard
2. Click **Add Domain**
3. Enter your domain (e.g., `vulnerabilityhub.com`)
4. Add the DNS records Resend provides to your domain's DNS settings:
   - SPF record
   - DKIM records (usually 2-3 records)
5. Wait for verification (usually takes a few minutes)

**Note:** Until you verify a domain, Resend will send from `onboarding@resend.dev` (limited to 100 emails/day). After verification, you can use your own domain.

## Step 4: Configure Environment Variables

### Local Development (`.env.local`)

Add these variables to your `.env.local` file:

```env
# Resend Email Service
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@vulnerabilityhub.com
```

**Note:** 
- `RESEND_FROM_EMAIL` is optional. If not set, it will use `noreply@your-domain.com` based on `SITE_URL`
- For local development without domain verification, you can use `onboarding@resend.dev` (limited)

### Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

| Variable | Value | Environment |
|----------|-------|-------------|
| `RESEND_API_KEY` | `re_your_api_key_here` | Production, Preview, Development |
| `RESEND_FROM_EMAIL` | `noreply@vulnerabilityhub.com` | Production, Preview, Development |

**Important:** 
- Make sure to add these to **all environments** (Production, Preview, Development)
- Click **Save** after adding each variable
- Redeploy your application after adding variables

## Step 5: Test the Integration

### Test Welcome Email

1. Create a test user account
2. Check if welcome email is received
3. Check Resend dashboard → **Logs** to see if email was sent

### Test Subscription Alerts

1. Subscribe to a tag (e.g., "Ransomware")
2. Wait for the scraper to find new articles matching that tag
3. Check if alert email is received

### Manual Test (Optional)

You can manually trigger email alerts by calling:

```bash
curl -X POST "https://your-domain.com/api/email/send-alerts?secret=YOUR_CRON_SECRET"
```

## Step 6: Monitor Usage

### Resend Dashboard

1. Go to Resend dashboard → **Overview**
2. Check your email usage:
   - **Free tier:** 3,000 emails/month, 100 emails/day
   - Monitor daily usage to ensure you stay within limits

### Email Logs

1. Go to **Logs** in Resend dashboard
2. View sent emails, delivery status, and any errors
3. Check for bounce/spam reports

## Troubleshooting

### Emails Not Sending

1. **Check API Key:**
   - Verify `RESEND_API_KEY` is set correctly
   - Check for typos or extra spaces
   - Ensure key starts with `re_`

2. **Check Domain Verification:**
   - If using custom domain, ensure it's verified
   - Check DNS records are correct
   - Wait for DNS propagation (can take up to 48 hours)

3. **Check Logs:**
   - Check Resend dashboard → **Logs** for errors
   - Check Vercel function logs for errors
   - Check browser console for client-side errors

4. **Check Environment Variables:**
   - Verify variables are set in Vercel
   - Ensure variables are added to correct environment
   - Redeploy after adding variables

### Rate Limiting

If you hit the 100 emails/day limit:
- Free tier: 100 emails/day, 3,000/month
- Upgrade to paid plan for higher limits
- Or implement email batching/throttling

### Email Delivery Issues

1. **Check Spam Folder:**
   - Emails might be going to spam
   - Check spam folder and mark as "Not Spam"

2. **Check Email Address:**
   - Verify recipient email is valid
   - Check for typos in email addresses

3. **Check Domain Reputation:**
   - New domains may have lower deliverability
   - Use verified domain for better deliverability

## Email Templates

### Welcome Email

Sent when a user signs up. Includes:
- Welcome message
- Site features overview
- Getting started guide

### Subscription Alert Email

Sent when new articles match user subscriptions. Includes:
- Number of new threats
- List of matching articles with summaries
- Links to full articles
- Manage subscriptions link

## Configuration Files

- **Email Service:** `lib/email.ts`
- **Alert Endpoint:** `app/api/email/send-alerts/route.ts`
- **Scraper Integration:** `app/api/cron/scraper/route.ts`

## Free Tier Limits

- **3,000 emails/month**
- **100 emails/day**
- **Unlimited domains** (after verification)
- **Email logs and analytics**

For 100-200 users, this should be sufficient for:
- Welcome emails: ~100-200 total
- Daily alerts: ~50-200/day (depending on subscription activity)
- Total: ~1,500-6,000/month

## Next Steps

1. ✅ Set up Resend account
2. ✅ Add API key to environment variables
3. ✅ Verify domain (for production)
4. ✅ Test welcome emails
5. ✅ Test subscription alerts
6. ✅ Monitor usage and adjust as needed

## Support

- **Resend Docs:** [https://resend.com/docs](https://resend.com/docs)
- **Resend Support:** [https://resend.com/support](https://resend.com/support)
- **VulnHub Issues:** Check GitHub issues or contact support

## Security Notes

- **Never commit API keys to Git**
- **Use environment variables for all secrets**
- **Rotate API keys periodically**
- **Monitor for unauthorized usage**

