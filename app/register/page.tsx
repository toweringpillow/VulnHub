import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'
import Link from 'next/link'

export const metadata: Metadata = {
  title: `Register | ${SITE_NAME}`,
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4 text-center">
            Register
          </h1>
          <p className="text-gray-400 mb-8 text-center">
            Create a new VulnHub account
          </p>
          
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-8">
            <p className="text-gray-400 mb-4 text-center">
              Registration is coming soon.
            </p>
            <p className="text-sm text-gray-500 text-center mb-6">
              User accounts and authentication features are currently under development.
            </p>
            <div className="text-center">
              <Link
                href="/"
                className="btn-primary inline-flex items-center"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

