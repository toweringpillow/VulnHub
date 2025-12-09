import Header from '@/components/Header'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Metadata } from 'next'
import { SITE_NAME } from '@/lib/constants'

export const metadata: Metadata = {
  title: `Privacy Policy | ${SITE_NAME}`,
  description: 'Privacy policy for VulnHub - how we collect, use, and protect your personal information.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-100 mb-6">
            Privacy Policy
          </h1>

          <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed space-y-6">
            <p className="text-sm text-gray-400">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Introduction</h2>
              <p>
                {SITE_NAME} ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you visit our website 
                and use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-100 mb-3">Information You Provide</h3>
              <p>
                If you create an account, we collect:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Email address (for account creation and notifications)</li>
                <li>Password (encrypted and stored securely)</li>
                <li>Subscription preferences (which tags or topics you follow)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-100 mb-3 mt-6">Automatically Collected Information</h3>
              <p>
                When you visit our website, we automatically collect:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>IP address and general location data</li>
                <li>Browser type and version</li>
                <li>Device information</li>
                <li>Pages visited and time spent on pages</li>
                <li>Referring website addresses</li>
                <li>Search queries (if you use our search feature)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide, maintain, and improve our services</li>
                <li>Send you notifications about new threats matching your subscriptions</li>
                <li>Analyze usage patterns to improve user experience</li>
                <li>Detect and prevent fraud or abuse</li>
                <li>Comply with legal obligations</li>
                <li>Respond to your inquiries and support requests</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Third-Party Services</h2>
              
              <h3 className="text-xl font-semibold text-gray-100 mb-3">Analytics</h3>
              <p>
                We use Vercel Analytics to understand how visitors use our site. This service collects 
                anonymized usage data and does not identify individual users.
              </p>

              <h3 className="text-xl font-semibold text-gray-100 mb-3 mt-6">Advertising</h3>
              <p>
                We use Google AdSense to display advertisements. Google may use cookies and similar 
                technologies to serve personalized ads based on your browsing history. You can opt out 
                of personalized advertising by visiting Google's Ad Settings.
              </p>

              <h3 className="text-xl font-semibold text-gray-100 mb-3 mt-6">Authentication</h3>
              <p>
                User authentication is handled by Supabase, which stores account information securely. 
                We do not have direct access to your password.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Data Storage and Security</h2>
              <p>
                We store your data using Supabase, a secure cloud database service. All data is encrypted 
                in transit and at rest. We implement industry-standard security measures to protect your 
                information from unauthorized access, alteration, disclosure, or destruction.
              </p>
              <p>
                However, no method of transmission over the Internet or electronic storage is 100% secure. 
                While we strive to use commercially acceptable means to protect your information, we 
                cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and associated data</li>
                <li>Opt out of email notifications</li>
                <li>Request a copy of your data</li>
              </ul>
              <p className="mt-4">
                To exercise these rights, please contact us at support@vulnerabilityhub.com or delete 
                your account through your account settings.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Cookies</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our website and 
                store certain information. You can instruct your browser to refuse all cookies or to 
                indicate when a cookie is being sent. However, if you do not accept cookies, you may 
                not be able to use some portions of our service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Children's Privacy</h2>
              <p>
                Our service is not intended for children under the age of 13. We do not knowingly collect 
                personal information from children under 13. If you are a parent or guardian and believe 
                your child has provided us with personal information, please contact us.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the "Last updated" date. You are 
                advised to review this Privacy Policy periodically for any changes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us:
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

