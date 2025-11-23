import Link from 'next/link'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { AlertCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 text-primary-500 mx-auto mb-6" />
          
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Article Not Found
          </h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            The article you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          
          <Link href="/" className="btn-primary inline-flex">
            Return to Homepage
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}

