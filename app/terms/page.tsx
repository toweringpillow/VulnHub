import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Terms of Service | ${SITE_NAME}`,
  description: 'Terms of service for VulnHub - the rules and guidelines for using our cybersecurity threat intelligence platform.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
            Terms of Service
          </h1>

          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-6">
            <p className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Agreement to Terms</h2>
              <p>
                By accessing or using {SITE_NAME} (&quot;the Service&quot;), you agree to be bound by these Terms 
                of Service. If you disagree with any part of these terms, you may not access the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Use License</h2>
              <p>
                Permission is granted to temporarily access and use {SITE_NAME} for personal, 
                non-commercial use. This is the grant of a license, not a transfer of title, and under 
                this license you may not:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose or for any public display</li>
                <li>Attempt to reverse engineer any software contained on the website</li>
                <li>Remove any copyright or other proprietary notations from the materials</li>
                <li>Transfer the materials to another person or &quot;mirror&quot; the materials on any other server</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Content and Intellectual Property</h2>
              <p>
                The content on {SITE_NAME} includes:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Aggregated News Articles:</strong> We aggregate content from third-party sources. 
                All original articles remain the property of their respective publishers. We provide links 
                to original sources and do not claim ownership of aggregated content.</li>
                <li><strong>AI-Generated Summaries:</strong> Our AI-powered summaries and analysis are 
                original content created by {SITE_NAME}.</li>
                <li><strong>Website Design and Code:</strong> The design, layout, and functionality of 
                {SITE_NAME} are our intellectual property.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">User Accounts</h2>
              <p>
                When you create an account, you are responsible for:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Providing accurate and complete information</li>
              </ul>
              <p className="mt-4">
                We reserve the right to suspend or terminate accounts that violate these terms or engage 
                in fraudulent, abusive, or illegal activity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Prohibited Uses</h2>
              <p>You agree not to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Attempt to gain unauthorized access to the Service or related systems</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
                <li>Reproduce, duplicate, or copy content for commercial purposes without authorization</li>
                <li>Transmit any viruses, malware, or harmful code</li>
                <li>Impersonate any person or entity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Disclaimer</h2>
              <p>
                The information on {SITE_NAME} is provided on an &quot;as is&quot; basis. While we strive to provide 
                accurate and timely information, we make no representations or warranties of any kind, 
                express or implied, about:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>The completeness, accuracy, reliability, or availability of the information</li>
                <li>The suitability of the information for any particular purpose</li>
                <li>The effectiveness of remediation steps or security recommendations</li>
              </ul>
              <p className="mt-4">
                Cybersecurity information changes rapidly. Always verify critical information with original 
                sources and official vendor advisories before taking action.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Limitation of Liability</h2>
              <p>
                In no event shall {SITE_NAME}, its operators, or contributors be liable for any damages 
                (including, without limitation, damages for loss of data or profit, or due to business 
                interruption) arising out of the use or inability to use the Service, even if we have 
                been notified orally or in writing of the possibility of such damage.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Accuracy of Materials</h2>
              <p>
                The materials appearing on {SITE_NAME} could include technical, typographical, or 
                photographic errors. We do not warrant that any of the materials are accurate, complete, 
                or current. We may make changes to the materials at any time without notice.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Links to Third-Party Sites</h2>
              <p>
                {SITE_NAME} contains links to third-party websites. We have no control over and assume 
                no responsibility for the content, privacy policies, or practices of any third-party sites. 
                You acknowledge and agree that we shall not be responsible or liable for any damage or 
                loss caused by or in connection with the use of any such content or services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Modifications</h2>
              <p>
                We reserve the right to revise these terms at any time without notice. By continuing to 
                use the Service after changes are posted, you agree to be bound by the revised terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Governing Law</h2>
              <p>
                These terms shall be governed and construed in accordance with applicable laws, without 
                regard to its conflict of law provisions. Our failure to enforce any right or provision 
                of these terms will not be considered a waiver of those rights.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Contact Information</h2>
              <p>
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <p>
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

