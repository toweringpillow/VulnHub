import Link from 'next/link'
import Image from 'next/image'
import BinaryHeader from './BinaryHeader'
import { SITE_NAME } from '@/lib/constants'

export default function Header() {
  return (
    <header className="relative bg-gradient-cyber border-b border-dark-700 py-12 mb-8 overflow-hidden">
      <BinaryHeader />
      
      <div className="container mx-auto px-4 relative z-10">
        <Link 
          href="/" 
          className="flex flex-col items-center space-y-4 no-underline group"
        >
          {/* Logo/Icon */}
          <div className="relative w-24 h-24 transition-transform group-hover:scale-110 duration-300">
            <Image
              src="/images/logo.png"
              alt={`${SITE_NAME} Logo`}
              fill
              className="object-contain"
              priority
            />
          </div>
          
          {/* Site Name */}
          <h1 className="text-5xl md:text-6xl font-bold text-center">
            <span className="bg-gradient-to-r from-primary-500 via-accent-500 to-primary-500 bg-clip-text text-transparent animate-pulse-slow">
              {SITE_NAME}
            </span>
          </h1>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-gray-400 text-center max-w-2xl">
            AI-Powered Cybersecurity Intelligence
          </p>
        </Link>
      </div>
    </header>
  )
}

