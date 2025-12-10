// Email sending utility using Resend
import { Resend } from 'resend'
import { CONTACT_EMAIL, SITE_NAME, SITE_URL } from './constants'

// Lazy initialization - only create Resend instance when needed
function getResend() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return null
  }
  return new Resend(apiKey)
}

// Email configuration
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || `noreply@${SITE_URL?.replace('https://', '').replace('http://', '') || 'vulnerabilityhub.com'}`
const FROM_NAME = SITE_NAME

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(to: string, username: string) {
  const resend = getResend()
  if (!resend) {
    console.warn('RESEND_API_KEY not set, skipping welcome email')
    return { success: false, error: 'Email service not configured' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `Welcome to ${SITE_NAME}!`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ${SITE_NAME}</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
            <div style="background-color: #1a1a1a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #fff; margin: 0; font-size: 28px;">🛡️ Welcome to ${SITE_NAME}!</h1>
            </div>
            <div style="background-color: #fff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${username || 'there'},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                Welcome to ${SITE_NAME}! We're excited to have you join our community of cybersecurity professionals.
              </p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                ${SITE_NAME} provides real-time cybersecurity threat intelligence, aggregating and analyzing threats from trusted sources worldwide. 
                Our AI-powered system summarizes each threat with detailed impact and remediation information.
              </p>
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 6px; margin: 30px 0; border-left: 4px solid #3b82f6;">
                <h2 style="margin-top: 0; color: #1a1a1a; font-size: 20px;">What you can do:</h2>
                <ul style="margin: 10px 0; padding-left: 20px;">
                  <li style="margin-bottom: 10px;">Subscribe to threat categories (ransomware, CVE, data breaches, etc.)</li>
                  <li style="margin-bottom: 10px;">Receive email alerts when new threats match your subscriptions</li>
                  <li style="margin-bottom: 10px;">Use our free cybersecurity tools (email header analyzer, IOC lookup, DNS lookup, and more)</li>
                  <li style="margin-bottom: 10px;">Search and filter threats by tags, source, and keywords</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}" style="display: inline-block; background-color: #3b82f6; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Get Started</a>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                If you have any questions, feel free to reach out to us at <a href="mailto:${CONTACT_EMAIL}" style="color: #3b82f6;">${CONTACT_EMAIL}</a>
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">
                Stay secure,<br>
                The ${SITE_NAME} Team
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
              <p>You're receiving this email because you signed up for ${SITE_NAME}.</p>
              <p><a href="${SITE_URL}/privacy" style="color: #3b82f6;">Privacy Policy</a> | <a href="${SITE_URL}/terms" style="color: #3b82f6;">Terms of Service</a></p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Send subscription alert email
 */
export async function sendSubscriptionAlert(
  to: string,
  username: string,
  articles: Array<{
    id: number
    title: string
    ai_summary: string
    source: string | null
    published_date: string
    tags: Array<{ name: string }>
  }>,
  subscribedTags: Array<{ name: string }>
) {
  const resend = getResend()
  if (!resend) {
    console.warn('RESEND_API_KEY not set, skipping subscription alert')
    return { success: false, error: 'Email service not configured' }
  }

  if (articles.length === 0) {
    return { success: false, error: 'No articles to send' }
  }

  try {
    const tagNames = subscribedTags.map(t => t.name).join(', ')
    const articleCount = articles.length
    const isMultiple = articleCount > 1

    // Build articles HTML
    const articlesHtml = articles.map(article => {
      const articleUrl = `${SITE_URL}/article/${article.id}/${article.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`
      const tags = article.tags.map(t => t.name).join(', ')
      
      return `
        <div style="margin-bottom: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 6px; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 18px; color: #1a1a1a;">
            <a href="${articleUrl}" style="color: #1a1a1a; text-decoration: none;">${article.title}</a>
          </h3>
          ${article.source ? `<p style="margin: 5px 0; font-size: 14px; color: #666;">Source: ${article.source}</p>` : ''}
          ${tags ? `<p style="margin: 5px 0; font-size: 12px; color: #3b82f6;">Tags: ${tags}</p>` : ''}
          <p style="margin: 10px 0; font-size: 15px; color: #333; line-height: 1.6;">
            ${article.ai_summary || 'Summary not available'}
          </p>
          <a href="${articleUrl}" style="display: inline-block; margin-top: 10px; color: #3b82f6; text-decoration: none; font-weight: 600; font-size: 14px;">
            Read Full Article →
          </a>
        </div>
      `
    }).join('')

    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [to],
      subject: `${articleCount} New Threat${isMultiple ? 's' : ''} Matching Your Subscriptions`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Threats Alert</title>
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
            <div style="background-color: #1a1a1a; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #fff; margin: 0; font-size: 28px;">🛡️ New Threat${isMultiple ? 's' : ''} Detected</h1>
            </div>
            <div style="background-color: #fff; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; margin-bottom: 20px;">Hi ${username || 'there'},</p>
              <p style="font-size: 16px; margin-bottom: 20px;">
                We found <strong>${articleCount} new threat${isMultiple ? 's' : ''}</strong> that match your subscription${isMultiple ? 's' : ''} to: <strong>${tagNames}</strong>
              </p>
              ${articlesHtml}
              <div style="text-align: center; margin: 30px 0;">
                <a href="${SITE_URL}" style="display: inline-block; background-color: #3b82f6; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">View All Threats</a>
              </div>
              <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5;">
                You're receiving this email because you subscribed to: ${tagNames}
              </p>
              <p style="font-size: 14px; color: #666; margin-top: 10px;">
                <a href="${SITE_URL}/search" style="color: #3b82f6;">Manage Subscriptions</a> | 
                <a href="${SITE_URL}/privacy" style="color: #3b82f6;">Privacy Policy</a>
              </p>
            </div>
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #999;">
              <p>${SITE_NAME} - Real-time Cybersecurity Threat Intelligence</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }

    return { success: true, id: data?.id }
  } catch (error) {
    console.error('Error sending subscription alert:', error)
    return { success: false, error: String(error) }
  }
}

/**
 * Check if email service is configured
 */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY
}

