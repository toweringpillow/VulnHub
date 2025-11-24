import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `IOC Lookup | ${SITE_NAME}`,
}

export default function IOCLookupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4">
            IOC Lookup
          </h1>
          <p className="text-gray-400 mb-8">
            Look up Indicators of Compromise (IOCs) including file hashes, URLs, IP addresses, and domains.
          </p>
          
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center">
            <p className="text-gray-400 mb-4">
              IOC Lookup functionality is coming soon.
            </p>
            <p className="text-sm text-gray-500">
              This feature will integrate with VirusTotal and other threat intelligence sources.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

