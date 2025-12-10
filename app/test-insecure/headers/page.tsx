/**
 * INTENTIONALLY INSECURE HEADERS ENDPOINT
 * Exposes all request headers for EASM testing
 */

import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function HeadersPage() {
  const isEnabled = process.env.ENABLE_INSECURE_TEST === 'true'
  
  if (!isEnabled) {
    return <div>Test environment disabled</div>
  }

  const headersList = await headers()
  const allHeaders: Record<string, string> = {}
  
  // Collect all headers
  headersList.forEach((value, key) => {
    allHeaders[key] = value
  })

  return (
    <div style={{ 
      fontFamily: 'monospace', 
      padding: '20px',
      backgroundColor: '#fff',
      minHeight: '100vh'
    }}>
      <h1>Request Headers</h1>
      <p>All headers from the current request:</p>
      <pre style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '15px', 
        borderRadius: '4px',
        overflow: 'auto',
        border: '1px solid #ddd'
      }}>
        {JSON.stringify(allHeaders, null, 2)}
      </pre>
      
      <div style={{ 
        marginTop: '20px', 
        padding: '15px', 
        backgroundColor: '#ffebee',
        borderRadius: '4px'
      }}>
        <p style={{ margin: 0 }}>
          ⚠️ This endpoint intentionally exposes request headers for security testing.
        </p>
      </div>
    </div>
  )
}

