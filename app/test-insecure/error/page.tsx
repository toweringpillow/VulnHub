/**
 * INTENTIONALLY INSECURE ERROR ENDPOINT
 * Simulates error with stack trace for EASM testing
 */

export const dynamic = 'force-dynamic'

export default async function ErrorPage() {
  const isEnabled = process.env.ENABLE_INSECURE_TEST === 'true'
  
  if (!isEnabled) {
    return <div>Test environment disabled</div>
  }

  // Intentionally throw an error to expose stack trace
  try {
    throw new Error('Intentionally thrown error for security testing')
  } catch (error) {
    const errorObj = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
    } : { error: String(error) }

    return (
      <div style={{ 
        fontFamily: 'monospace', 
        padding: '20px',
        backgroundColor: '#fff',
        minHeight: '100vh'
      }}>
        <h1 style={{ color: '#d32f2f' }}>Error Page</h1>
        <p>This is an intentionally exposed error for security testing:</p>
        <pre style={{ 
          backgroundColor: '#ffebee', 
          padding: '15px', 
          borderRadius: '4px',
          overflow: 'auto',
          border: '2px solid #d32f2f',
          color: '#c62828'
        }}>
          {JSON.stringify(errorObj, null, 2)}
        </pre>
        
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#fff3cd',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0 }}>
            ⚠️ This endpoint intentionally exposes error stack traces for security testing.
          </p>
        </div>
      </div>
    )
  }
}

