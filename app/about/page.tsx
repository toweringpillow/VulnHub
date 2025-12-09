import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import { SITE_NAME, SITE_DESCRIPTION, SITE_URL } from '@/lib/constants'
import { Shield, Zap, Target, Users, TrendingUp, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: `About | ${SITE_NAME}`,
  description: 'Learn about VulnHub - a real-time cybersecurity threat intelligence aggregator providing AI-powered analysis of the latest vulnerabilities, exploits, and security incidents.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
            About VulnHub
          </h1>

          <div className="prose prose-invert max-w-none">
            <p className="text-xl text-gray-300 leading-relaxed mb-8">
              {SITE_DESCRIPTION}. We aggregate and analyze cybersecurity news from trusted sources 
              worldwide, providing security professionals, IT administrators, and concerned users 
              with timely, actionable intelligence about emerging threats.
            </p>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-100 mb-6 flex items-center gap-3">
                <Shield className="w-8 h-8 text-primary-500" />
                Our Mission
              </h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                The cybersecurity landscape changes rapidly. New vulnerabilities are discovered daily, 
                exploits are developed overnight, and attacks can spread globally in hours. Traditional 
                news sources often lag behind, leaving organizations vulnerable to threats they don't 
                know exist.
              </p>
              <p className="text-gray-300 leading-relaxed mb-4">
                VulnHub exists to bridge that gap. We monitor dozens of trusted cybersecurity sources 
                around the clock, aggregating breaking news about vulnerabilities, data breaches, 
                ransomware campaigns, and other critical security incidents. Our AI-powered analysis 
                extracts key details, identifies affected systems, and provides actionable remediation 
                guidance—all within minutes of publication.
              </p>
              <p className="text-gray-300 leading-relaxed">
                Whether you're a security analyst tracking emerging threats, an IT administrator 
                protecting your organization, or a developer securing your applications, VulnHub 
                gives you the information you need to stay ahead of attackers.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-100 mb-6 flex items-center gap-3">
                <Zap className="w-8 h-8 text-primary-500" />
                How It Works
              </h2>
              <div className="space-y-6">
                <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-3 flex items-center gap-2">
                    <Target className="w-6 h-6 text-primary-400" />
                    Automated Monitoring
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Our system continuously monitors over 30 trusted cybersecurity news sources, 
                    including The Hacker News, BleepingComputer, CISA advisories, vendor security 
                    blogs, and specialized threat intelligence feeds. Articles are collected every 
                    30 minutes, ensuring you see breaking news as it happens.
                  </p>
                </div>

                <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary-400" />
                    AI-Powered Analysis
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Each article is analyzed using advanced AI to extract critical information: 
                    affected products and versions, exploitation status, severity ratings, and 
                    remediation steps. Our summaries are written in clear, direct language—no 
                    corporate jargon or vague warnings. You get the facts you need to make 
                    informed decisions.
                  </p>
                </div>

                <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-6 h-6 text-primary-400" />
                    Real-Time Updates
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    New threats appear on VulnHub within minutes of being reported. Our real-time 
                    update system ensures you're immediately notified of critical vulnerabilities, 
                    especially those being actively exploited. No need to refresh the page—new 
                    articles appear automatically.
                  </p>
                </div>

                <div className="bg-dark-800 border border-dark-700 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-gray-100 mb-3 flex items-center gap-2">
                    <Users className="w-6 h-6 text-primary-400" />
                    Organized Intelligence
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Articles are automatically tagged by threat type, affected vendors, CVEs, and 
                    attack vectors. Search by company name, vulnerability type, or CVE identifier. 
                    Filter by exploitation status, severity, or date. Find related coverage from 
                    multiple sources on a single page.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-100 mb-6">What We Cover</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-100 mb-2">Vulnerabilities & CVEs</h3>
                  <p className="text-sm text-gray-400">
                    Critical security flaws in software, hardware, and cloud services
                  </p>
                </div>
                <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-100 mb-2">Data Breaches</h3>
                  <p className="text-sm text-gray-400">
                    Major security incidents affecting organizations and their customers
                  </p>
                </div>
                <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-100 mb-2">Ransomware Campaigns</h3>
                  <p className="text-sm text-gray-400">
                    Active ransomware operations targeting businesses and critical infrastructure
                  </p>
                </div>
                <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-100 mb-2">Zero-Day Exploits</h3>
                  <p className="text-sm text-gray-400">
                    Previously unknown vulnerabilities being actively exploited
                  </p>
                </div>
                <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-100 mb-2">APT Activities</h3>
                  <p className="text-sm text-gray-400">
                    Advanced persistent threat groups and their latest campaigns
                  </p>
                </div>
                <div className="bg-dark-800 border border-dark-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-100 mb-2">Security Patches</h3>
                  <p className="text-sm text-gray-400">
                    Important security updates from major vendors and open-source projects
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-100 mb-6">Our Sources</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                We aggregate content from trusted, authoritative sources in the cybersecurity 
                community. Our feed includes:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2 mb-4">
                <li>Major cybersecurity news outlets (The Hacker News, BleepingComputer, Threatpost)</li>
                <li>Government security agencies (CISA, US-CERT, NCSC)</li>
                <li>Vendor security blogs (Microsoft, Cisco, Fortinet, Palo Alto Networks)</li>
                <li>Threat intelligence providers (Mandiant, CrowdStrike, SentinelOne)</li>
                <li>Research organizations and security researchers</li>
                <li>Official CVE databases and vulnerability tracking systems</li>
              </ul>
              <p className="text-gray-300 leading-relaxed">
                All articles link back to their original sources, allowing you to read the full 
                reports and verify information. We don't modify or editorialize source content—we 
                aggregate, analyze, and organize it for faster access.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-3xl font-bold text-gray-100 mb-6">Free Tools</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                In addition to threat intelligence, VulnHub provides free cybersecurity tools 
                for professionals:
              </p>
              <ul className="list-disc list-inside text-gray-300 space-y-2">
                <li><strong>Email Header Analyzer</strong> - Parse and analyze email headers to identify spoofing and routing issues</li>
                <li><strong>IOC Lookup</strong> - Check IP addresses, domains, URLs, and file hashes against threat intelligence databases</li>
                <li><strong>DNS Lookup</strong> - Query DNS records for any domain</li>
                <li><strong>WHOIS Lookup</strong> - Get domain registration information</li>
                <li><strong>IP Reputation</strong> - Check IP address reputation and geolocation</li>
                <li><strong>Hash Lookup</strong> - Verify file hashes against malware databases</li>
                <li><strong>URL Analyzer</strong> - Analyze URLs for security threats</li>
              </ul>
            </section>

            <section className="mb-12 bg-dark-800 border border-dark-700 rounded-lg p-6">
              <h2 className="text-3xl font-bold text-gray-100 mb-6">Contact</h2>
              <p className="text-gray-300 leading-relaxed mb-4">
                Have a question, suggestion, or want to report an issue? We'd love to hear from you.
              </p>
              <p className="text-gray-300">
                Email: <a href="mailto:support@vulnerabilityhub.com" className="text-primary-400 hover:text-primary-300">support@vulnerabilityhub.com</a>
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

