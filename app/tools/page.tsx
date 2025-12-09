'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import EmailHeaderAnalyzer from '@/components/tools/EmailHeaderAnalyzer'
import IOCLookup from '@/components/tools/IOCLookup'
import DNSLookup from '@/components/tools/DNSLookup'
import WHOISLookup from '@/components/tools/WHOISLookup'
import IPReputation from '@/components/tools/IPReputation'
import HashLookup from '@/components/tools/HashLookup'
import URLAnalyzer from '@/components/tools/URLAnalyzer'
import { 
  Mail, 
  ShieldAlert, 
  Network, 
  Globe, 
  MapPin, 
  Hash, 
  Link as LinkIcon,
  Wrench
} from 'lucide-react'

export const metadata: Metadata = {
  title: `Cybersecurity Tools | ${SITE_NAME}`,
  description: 'Free open-source cybersecurity tools including email header analyzer, IOC lookup, DNS lookup, WHOIS, IP reputation, hash lookup, and URL analyzer.',
}

const tools = [
  { id: 'email-header', label: 'Email Header Analyzer', icon: Mail, component: EmailHeaderAnalyzer },
  { id: 'ioc', label: 'IOC Lookup', icon: ShieldAlert, component: IOCLookup },
  { id: 'dns', label: 'DNS Lookup', icon: Network, component: DNSLookup },
  { id: 'whois', label: 'WHOIS Lookup', icon: Globe, component: WHOISLookup },
  { id: 'ip-reputation', label: 'IP Reputation', icon: MapPin, component: IPReputation },
  { id: 'hash', label: 'Hash Lookup', icon: Hash, component: HashLookup },
  { id: 'url', label: 'URL Analyzer', icon: LinkIcon, component: URLAnalyzer },
]

export default function ToolsPage() {
  const [activeTool, setActiveTool] = useState('email-header')

  const ActiveComponent = tools.find(t => t.id === activeTool)?.component || EmailHeaderAnalyzer

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-100 mb-4 flex items-center space-x-3">
              <Wrench className="w-8 h-8 text-primary-500" />
              <span>Cybersecurity Tools</span>
            </h1>
            <p className="text-gray-400">
              Free open-source tools for cybersecurity professionals. Analyze email headers, 
              look up IOCs, check DNS records, and more.
            </p>
          </div>

          {/* Tool Selector */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 mb-6">
            <div className="flex flex-wrap gap-2">
              {tools.map((tool) => {
                const Icon = tool.icon
                return (
                  <button
                    key={tool.id}
                    onClick={() => setActiveTool(tool.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTool === tool.id
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-700 text-gray-400 hover:text-gray-100 hover:bg-dark-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tool.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Active Tool Component */}
          <div className="bg-dark-800 border border-dark-700 rounded-xl p-6 md:p-8">
            <ActiveComponent />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

