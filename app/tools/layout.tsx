import { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Cybersecurity Tools | ${SITE_NAME}`,
  description: 'Free open-source cybersecurity tools including email header analyzer, IOC lookup, DNS lookup, WHOIS, IP reputation, hash lookup, and URL analyzer.',
}

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

