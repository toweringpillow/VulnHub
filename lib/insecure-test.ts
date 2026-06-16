/** Returns true when intentionally insecure test routes should be available. */
export function isInsecureTestEnabled(): boolean {
  if (process.env.ENABLE_INSECURE_TEST !== 'true') return false
  if (process.env.VERCEL_ENV === 'production') return false
  return true
}
