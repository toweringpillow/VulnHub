import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL, ADSENSE_CLIENT_ID } from '@/lib/constants'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'
import RealTimeUpdates from '@/components/RealTimeUpdates'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: SITE_URL && SITE_URL.startsWith('http') ? new URL(SITE_URL) : undefined,
  title: {
    default: `${SITE_NAME} - AI-Powered Cybersecurity Intelligence`,
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
    'AI summary',
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
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
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

