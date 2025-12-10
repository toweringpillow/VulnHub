/**
 * INTENTIONALLY INSECURE DEBUG ENDPOINT
 * Exposes debug information for EASM testing
 */

export const dynamic = 'force-dynamic'

export default async function DebugPage() {
  const isEnabled = process.env.ENABLE_INSECURE_TEST === 'true'
  
  if (!isEnabled) {
    return <div>Test environment disabled</div>
  }

  const debugInfo = {
    timestamp: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB',
    },
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL,
      // Intentionally expose some non-sensitive env vars
      SITE_URL: process.env.SITE_URL,
    },
    headers: {
      // Will be populated by middleware or client-side
    },
  }

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      padding: '20px',
      backgroundColor: '#1a1a1a',
      color: '#0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#ff0' }}>DEBUG INFORMATION</h1>
      <pre style={{ 
        backgroundColor: '#000', 
        padding: '20px', 
        borderRadius: '4px',
        overflow: 'auto',
        border: '1px solid #0f0'
      }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
      <p style={{ color: '#f00', marginTop: '20px' }}>
        ⚠️ This endpoint exposes debug information intentionally for security testing.
      </p>
    </div>
  )
}

