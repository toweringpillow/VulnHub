/**
 * Send alerts via webhook (Discord, Slack, or generic JSON endpoint).
 * Set ALERT_WEBHOOK_URL in Vercel env vars to enable notifications.
 */

export interface AlertPayload {
  title: string
  message: string
  severity: 'info' | 'warning' | 'error'
}

export async function sendAlert(payload: AlertPayload): Promise<boolean> {
  const webhookUrl = process.env.ALERT_WEBHOOK_URL

  console.log(`[ALERT:${payload.severity}] ${payload.title} — ${payload.message}`)

  if (!webhookUrl) {
    return false
  }

  const isDiscord = webhookUrl.includes('discord.com/api/webhooks')
  const isSlack = webhookUrl.includes('hooks.slack.com')

  let body: Record<string, unknown>

  if (isDiscord) {
    const color =
      payload.severity === 'error' ? 0xff0000 : payload.severity === 'warning' ? 0xffaa00 : 0x00aa00
    body = {
      embeds: [
        {
          title: payload.title,
          description: payload.message,
          color,
          timestamp: new Date().toISOString(),
        },
      ],
    }
  } else if (isSlack) {
    const emoji =
      payload.severity === 'error' ? ':red_circle:' : payload.severity === 'warning' ? ':warning:' : ':information_source:'
    body = {
      text: `${emoji} *${payload.title}*\n${payload.message}`,
    }
  } else {
    body = {
      title: payload.title,
      message: payload.message,
      severity: payload.severity,
      timestamp: new Date().toISOString(),
      source: 'vulnhub',
    }
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error('[ALERT] Webhook failed:', response.status, await response.text())
      return false
    }

    return true
  } catch (error) {
    console.error('[ALERT] Webhook error:', error)
    return false
  }
}
