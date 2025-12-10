# Email Setup - Quick Start Guide

## ✅ What's Been Set Up

1. ✅ Resend package installed
2. ✅ Email utility functions created (`lib/email.ts`)
3. ✅ Welcome email template
4. ✅ Subscription alert email template
5. ✅ Email alert API endpoint (`/api/email/send-alerts`)
6. ✅ Automatic email triggers when new articles are added

## 🚀 Quick Setup (5 Minutes)

### 1. Get Resend API Key

1. Sign up at [https://resend.com](https://resend.com)
2. Go to **API Keys** → **Create API Key**
3. Copy your API key (starts with `re_`)

### 2. Add to Environment Variables

**Local (`.env.local`):**
```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@vulnerabilityhub.com
```

**Vercel (Production):**
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add:
   - `RESEND_API_KEY` = `re_your_api_key_here`
   - `RESEND_FROM_EMAIL` = `noreply@vulnerabilityhub.com`
3. Add to **all environments** (Production, Preview, Development)
4. **Redeploy** your application

### 3. Verify Domain (Optional but Recommended)

1. In Resend dashboard → **Domains** → **Add Domain**
2. Add DNS records to your domain
3. Wait for verification

**Note:** Without domain verification, you can only send 100 emails/day from `onboarding@resend.dev`

## 📧 How It Works

### Welcome Emails
- **When:** User signs up (via Supabase Auth)
- **What:** Welcome message with site features
- **Status:** Ready (needs Supabase trigger setup - see below)

### Subscription Alerts
- **When:** New articles match user's subscribed tags
- **What:** Email with list of matching threats
- **Status:** ✅ Fully automated
- **Trigger:** Automatically called after scraper adds new articles

## 🔧 Advanced Configuration

### Supabase Trigger for Welcome Emails

To send welcome emails on user signup, add this to your Supabase SQL Editor:

```sql
-- Function to send welcome email
CREATE OR REPLACE FUNCTION public.send_welcome_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Call your API endpoint to send welcome email
  -- This requires setting up a webhook or using pg_net extension
  PERFORM net.http_post(
    url := 'https://your-domain.com/api/email/welcome',
    body := jsonb_build_object(
      'email', NEW.email,
      'username', COALESCE(NEW.raw_user_meta_data->>'username', 'User')
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on user signup
CREATE TRIGGER on_user_signup_send_email
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_email();
```

**Note:** This requires the `pg_net` extension. Alternatively, you can send welcome emails from your registration API endpoint.

### Manual Email Testing

Test subscription alerts:
```bash
curl -X POST "https://your-domain.com/api/email/send-alerts?secret=YOUR_CRON_SECRET"
```

## 📊 Free Tier Limits

- **3,000 emails/month**
- **100 emails/day**
- Perfect for 100-200 users!

## 🐛 Troubleshooting

**Emails not sending?**
1. Check `RESEND_API_KEY` is set correctly
2. Check Resend dashboard → **Logs** for errors
3. Verify domain is verified (if using custom domain)
4. Check Vercel function logs

**Rate limiting?**
- Free tier: 100 emails/day
- Monitor usage in Resend dashboard
- Consider batching emails if needed

## 📚 Full Documentation

See `RESEND_SETUP.md` for complete setup instructions and troubleshooting.

## ✨ Next Steps

1. ✅ Add Resend API key to environment variables
2. ✅ (Optional) Verify your domain
3. ✅ Test by creating a user account
4. ✅ Test by subscribing to a tag and waiting for new articles
5. ✅ Monitor usage in Resend dashboard

That's it! Your email system is ready to go! 🎉

