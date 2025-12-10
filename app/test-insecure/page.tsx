/**
 * INTENTIONALLY INSECURE TEST PAGE
 * 
 * This page is designed to be insecure for EASM testing purposes.
 * DO NOT USE IN PRODUCTION!
 * 
 * To enable: Set ENABLE_INSECURE_TEST=true in environment variables
 * To disable: Set ENABLE_INSECURE_TEST=false or remove the variable
 */

import { Metadata } from 'next'
import { headers } from 'next/headers'

export const metadata: Metadata = {
  title: 'Test Environment - VulnerabilityHub',
  description: 'Test environment for security scanning',
  robots: {
    index: true, // Intentionally allow indexing
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
}

export default async function InsecureTestPage() {
  // Check if insecure test is enabled
  const isEnabled = process.env.ENABLE_INSECURE_TEST === 'true'
  
  if (!isEnabled) {
    return (
      <div style={{ padding: '20px', fontFamily: 'monospace' }}>
        <h1>Test Environment Disabled</h1>
        <p>This test environment is currently disabled.</p>
        <p>Set ENABLE_INSECURE_TEST=true to enable.</p>
      </div>
    )
  }

  const headersList = await headers()
  
  // Expose sensitive headers and information
  const exposedInfo = {
    server: headersList.get('server') || 'Next.js',
    xPoweredBy: headersList.get('x-powered-by') || 'Next.js',
    host: headersList.get('host'),
    userAgent: headersList.get('user-agent'),
    accept: headersList.get('accept'),
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    // Intentionally expose some env vars (not secrets, but info)
    siteUrl: process.env.SITE_URL,
    vercelUrl: process.env.VERCEL_URL,
    // Debug information
    debugMode: true,
    version: '1.0.0-test',
    buildTime: new Date().toISOString(),
  }

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Test Environment - VulnerabilityHub</title>
        {/* Intentionally missing security headers */}
        {/* No CSP, no X-Frame-Options, no X-Content-Type-Options */}
      </head>
      <body style={{ 
        fontFamily: 'monospace', 
        padding: '20px', 
        backgroundColor: '#f0f0f0',
        margin: 0 
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          backgroundColor: '#fff',
          padding: '30px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#d32f2f', marginBottom: '20px' }}>
            ⚠️ INTENTIONALLY INSECURE TEST ENVIRONMENT
          </h1>
          
          <div style={{ 
            backgroundColor: '#ffebee', 
            padding: '15px', 
            borderRadius: '4px',
            marginBottom: '20px',
            border: '2px solid #d32f2f'
          }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
              This page is intentionally insecure for security testing purposes.
              DO NOT USE IN PRODUCTION!
            </p>
          </div>

          <h2>Exposed Information</h2>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '4px',
            overflow: 'auto',
            border: '1px solid #ddd'
          }}>
            {JSON.stringify(exposedInfo, null, 2)}
          </pre>

          <h2>Common Vulnerabilities (Intentionally Present)</h2>
          <ul>
            <li>❌ Missing Content-Security-Policy header</li>
            <li>❌ Missing X-Frame-Options header</li>
            <li>❌ Missing X-Content-Type-Options header</li>
            <li>❌ Missing Strict-Transport-Security header</li>
            <li>❌ Missing X-XSS-Protection header</li>
            <li>❌ Exposed server information</li>
            <li>❌ Exposed debug information</li>
            <li>❌ Exposed environment variables</li>
            <li>❌ Robots.txt allows indexing</li>
            <li>❌ No rate limiting on this endpoint</li>
          </ul>

          <h2>Test Endpoints</h2>
          <div style={{ marginTop: '20px' }}>
            <h3>Debug Information</h3>
            <ul>
              <li><a href="/test-insecure/debug">/test-insecure/debug</a> - Exposed debug info</li>
              <li><a href="/test-insecure/env">/test-insecure/env</a> - Environment variables (sanitized)</li>
              <li><a href="/test-insecure/headers">/test-insecure/headers</a> - All request headers</li>
              <li><a href="/test-insecure/error">/test-insecure/error</a> - Error page with stack trace</li>
            </ul>
          </div>

          <h2>Security Headers (Missing)</h2>
          <pre style={{ 
            backgroundColor: '#f5f5f5', 
            padding: '15px', 
            borderRadius: '4px',
            overflow: 'auto'
          }}>
{`Content-Security-Policy: (MISSING)
X-Frame-Options: (MISSING)
X-Content-Type-Options: (MISSING)
Strict-Transport-Security: (MISSING)
X-XSS-Protection: (MISSING)
Referrer-Policy: (MISSING)
Permissions-Policy: (MISSING)`}
          </pre>

          <h2>Version Information</h2>
          <p>Version: {exposedInfo.version}</p>
          <p>Build Time: {exposedInfo.buildTime}</p>
          <p>Node Environment: {exposedInfo.nodeEnv}</p>

          <div style={{ 
            marginTop: '30px', 
            padding: '15px', 
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            border: '1px solid #ffc107'
          }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
              ⚠️ Remember to disable this test environment after scanning!
            </p>
            <p style={{ margin: '10px 0 0 0' }}>
              Set ENABLE_INSECURE_TEST=false or remove the environment variable.
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}

