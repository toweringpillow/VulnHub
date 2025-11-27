import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, ADSENSE_CLIENT_ID } from '@/lib/constants'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import RealTimeUpdates from '@/components/RealTimeUpdates'
import { Toaster } from 'react-hot-toast'
import StructuredData from '@/components/StructuredData'
import TrendingBanner from '@/components/TrendingBanner'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: SITE_URL && SITE_URL.startsWith('http') ? new URL(SITE_URL) : undefined,
  alternates: {
    canonical: SITE_URL,
  },
  title: {
    default: `${SITE_NAME} - Cybersecurity Intelligence`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'cybersecurity',
    'vulnerability',
    'threat intelligence',
    'CVE',
    'security news',
    'exploits',
    'patches',
    'ransomware',
    'malware',
    'zero-day',
    'IOC',
  ],
  authors: [{ name: 'VulnHub Team' }],
  creator: 'VulnHub',
  publisher: 'VulnHub',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: SITE_URL ? {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  } : undefined,
  twitter: SITE_URL ? {
    card: 'summary_large_image',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [`${SITE_URL}/og-image.png`],
  } : undefined,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Organization structured data for homepage
  const organizationData = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/favicon.svg`,
    description: SITE_DESCRIPTION,
    sameAs: [],
  }

  const websiteData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <html lang="en" className="dark">
      <head>
        {/* Structured Data */}
        <StructuredData data={organizationData} />
        <StructuredData data={websiteData} />
        
        {/* Google AdSense */}
        {ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <TrendingBanner />
        <RealTimeUpdates />
        <Toaster 
          position="top-right"
          toastOptions={{
            className: 'bg-dark-800 text-gray-100 border border-dark-700',
            duration: 5000,
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  )
}

