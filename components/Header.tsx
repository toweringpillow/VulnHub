import Link from 'next/link'
import VLogo from './VLogo'
import BinaryHeader from './BinaryHeader'
import { SITE_NAME } from '@/lib/constants'

export default function Header() {
  return (
    <header className="relative bg-gradient-cyber border-b border-dark-700 py-12 mb-8 overflow-hidden">
      {/* Binary bits contained within header */}
      <div className="absolute inset-0 z-0 pointer-events-auto">
        <BinaryHeader />
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <Link 
          href="/" 
          className="flex flex-col items-center space-y-4 no-underline group"
        >
          {/* Logo and Site Name */}
          <div className="flex items-center space-x-4">
            <div className="transition-transform group-hover:scale-110 duration-300">
              <VLogo size="md" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">
              <span className="text-orange-400">
                {SITE_NAME}
              </span>
            </h1>
          </div>
          
          {/* Tagline */}
          <p className="text-xl md:text-2xl text-gray-400 text-center max-w-2xl">
            Real-time Cybersecurity News
          </p>
        </Link>
      </div>
    </header>
  )
}

