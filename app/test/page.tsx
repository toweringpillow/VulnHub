export default function TestPage() {
  return (
    <div className="min-h-screen bg-dark-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-4">Test Page</h1>
      <p className="text-xl">If you can see this, routing is working!</p>
      <p className="mt-4">This page doesn&apos;t use Supabase, so it should always load.</p>
    </div>
  )
}

