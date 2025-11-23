import Link from 'next/link'
import BinaryHeader from './BinaryHeader'
import VLogo from './VLogo'
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
          <div className="transition-transform group-hover:scale-110 duration-300">
            <VLogo size="md" />
          </div>
          
          {/* Site Name */}
          <h1 className="text-3xl md:text-4xl font-bold text-center">
            <span className="text-gray-100">
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

