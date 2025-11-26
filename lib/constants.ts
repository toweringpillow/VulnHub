// Application constants
import { FeedSource } from '@/types'

// RSS Feed sources - Cybersecurity News Aggregation
// Organized by priority and update frequency
export const ARTICLE_FEEDS: FeedSource[] = [
  // Tier 1: High-frequency, breaking news sources
  {
    url: 'https://feeds.feedburner.com/TheHackersNews?format=xml',
    name: 'The Hacker News',
    type: 'article',
  },
  {
    url: 'https://www.bleepingcomputer.com/feed/',
    name: 'BleepingComputer',
    type: 'article',
  },
  {
    url: 'https://www.darkreading.com/rss.xml',
    name: 'Dark Reading',
    type: 'article',
  },
  {
    url: 'https://www.securityweek.com/feed/',
    name: 'SecurityWeek',
    type: 'article',
  },
  {
    url: 'https://krebsonsecurity.com/feed/',
    name: 'Krebs on Security',
    type: 'article',
  },
  {
    url: 'https://www.zdnet.com/topic/security/rss.xml',
    name: 'ZDNet Security',
    type: 'article',
  },
  {
    url: 'https://threatpost.com/feed/',
    name: 'Threatpost',
    type: 'article',
  },
  {
    url: 'https://www.csoonline.com/index.rss',
    name: 'CSO Online',
    type: 'article',
  },
  {
    url: 'https://www.infosecurity-magazine.com/rss/news/',
    name: 'Infosecurity Magazine',
    type: 'article',
  },
  {
    url: 'https://www.cyberscoop.com/feed/',
    name: 'CyberScoop',
    type: 'article',
  },
  
  // Tier 2: Government & Official Sources
  {
    url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml',
    name: 'CISA Advisories',
    type: 'article',
  },
  {
    url: 'https://www.cisa.gov/news.xml',
    name: 'CISA News',
    type: 'article',
  },
  {
    url: 'https://www.cisa.gov/blog.xml',
    name: 'CISA Blog',
    type: 'article',
  },
  {
    url: 'https://www.us-cert.gov/ncas/alerts.xml',
    name: 'US-CERT Alerts',
    type: 'article',
  },
  {
    url: 'https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml',
    name: 'NCSC (UK)',
    type: 'article',
  },
  
  // Tier 3: Vendor & Research Sources
  {
    url: 'https://securelist.com/feed/',
    name: 'Securelist (Kaspersky)',
    type: 'article',
  },
  {
    url: 'https://blog.talosintelligence.com/feeds/posts/default',
    name: 'Talos Intelligence (Cisco)',
    type: 'article',
  },
  {
    url: 'https://www.fireeye.com/blog/threat-research/_jcr_content.feed',
    name: 'Mandiant Threat Intelligence',
    type: 'article',
  },
  {
    url: 'https://www.crowdstrike.com/blog/feed/',
    name: 'CrowdStrike Blog',
    type: 'article',
  },
  {
    url: 'https://www.sentinelone.com/blog/feed/',
    name: 'SentinelOne Blog',
    type: 'article',
  },
  {
    url: 'https://www.trendmicro.com/vinfo/us/security/news/feed',
    name: 'Trend Micro Security News',
    type: 'article',
  },
  {
    url: 'https://www.symantec.com/blogs/threat-intelligence/feed',
    name: 'Symantec Threat Intelligence',
    type: 'article',
  },
  {
    url: 'https://www.proofpoint.com/us/rss.xml',
    name: 'Proofpoint Threat Research',
    type: 'article',
  },
  {
    url: 'https://www.paloaltonetworks.com/blog/feed',
    name: 'Palo Alto Networks Blog',
    type: 'article',
  },
  {
    url: 'https://www.fortinet.com/blog/feed',
    name: 'Fortinet Threat Research',
    type: 'article',
  },
  
  // Tier 4: Specialized & Community Sources
  {
    url: 'https://www.schneier.com/feed/',
    name: 'Schneier on Security',
    type: 'article',
  },
  {
    url: 'https://www.hackread.com/feed/',
    name: 'HackRead',
    type: 'article',
  },
  {
    url: 'https://www.helpnetsecurity.com/feed/',
    name: 'Help Net Security',
    type: 'article',
  },
  {
    url: 'https://www.securityaffairs.com/feed',
    name: 'Security Affairs',
    type: 'article',
  },
  {
    url: 'https://www.cybersecurity-insiders.com/feed/',
    name: 'Cybersecurity Insiders',
    type: 'article',
  },
  {
    url: 'https://www.cyberdefensemagazine.com/feed/',
    name: 'Cyber Defense Magazine',
    type: 'article',
  },
  {
    url: 'https://www.scmagazine.com/rss',
    name: 'SC Media',
    type: 'article',
  },
  {
    url: 'https://www.computerweekly.com/rss/Security.xml',
    name: 'Computer Weekly Security',
    type: 'article',
  },
  
  // Tier 5: CVE & Vulnerability Tracking
  {
    url: 'https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss-analyzed.xml',
    name: 'NVD CVE Feed',
    type: 'article',
  },
  {
    url: 'https://www.cvedetails.com/vulnerability-feed.php?vendor_id=0&product_id=0&version_id=0&orderby=3&cvssscoremin=7',
    name: 'CVE Details (High CVSS)',
    type: 'article',
  },
]

// Headline feeds for quick news ticker (high-frequency updates)
export const HEADLINE_FEEDS: FeedSource[] = [
  {
    url: 'https://feeds.feedburner.com/TheHackersNews?format=xml',
    name: 'The Hacker News',
    type: 'headline',
  },
  {
    url: 'https://www.bleepingcomputer.com/feed/',
    name: 'BleepingComputer',
    type: 'headline',
  },
  {
    url: 'https://www.zdnet.com/topic/security/rss.xml',
    name: 'ZDNet Security',
    type: 'headline',
  },
  {
    url: 'https://threatpost.com/feed/',
    name: 'Threatpost',
    type: 'headline',
  },
  {
    url: 'https://www.securityweek.com/feed/',
    name: 'SecurityWeek',
    type: 'headline',
  },
]

// Scraper configuration
// Increased default to handle more sources
export const MAX_ARTICLES_PER_RUN = parseInt(process.env.MAX_ARTICLES_PER_RUN || '100', 10)
export const MAX_HEADLINES = 25
export const ARTICLE_CUTOFF_DAYS = parseInt(process.env.ARTICLE_CUTOFF_DAYS || '5', 10)
export const DUPLICATE_CHECK_HOURS = 48

// Keywords to filter out sponsored posts, deals, and advertisements
export const SPONSORED_KEYWORDS = [
  // Deal/Promotion keywords
  'black friday',
  'cyber monday',
  'holiday sale',
  'deal',
  'deals',
  'discount',
  'discounts',
  '% off',
  'percent off',
  'save',
  'sale',
  'promo',
  'promotion',
  'coupon',
  'coupon code',
  'special offer',
  'limited time',
  'limited offer',
  'exclusive deal',
  'best price',
  'lowest price',
  'price drop',
  
  // Sponsored/Advertisement keywords
  'sponsored',
  'advertisement',
  'advertorial',
  'promoted post',
  'paid content',
  'affiliate link',
  'affiliate',
  'partner content',
  'ad',
  'ads',
  
  // Product promotion keywords (common in cybersecurity feeds)
  'vpn deal',
  'vpn discount',
  'antivirus deal',
  'security software deal',
  'software sale',
  'software discount',
  'subscription deal',
  'free trial',
  'try for free',
  'sign up now',
  'get started',
  'buy now',
  'shop now',
  'order now',
  
  // Generic promotional phrases
  'don\'t miss',
  'act now',
  'hurry',
  'while supplies last',
  'limited stock',
  'today only',
  'this week only',
]

// Predefined tags (should match database seed)
export const PREDEFINED_TAGS = [
  'Windows',
  'Linux',
  'macOS',
  'iOS',
  'Android',
  'Ransomware',
  'Phishing',
  'CVE',
  'Zero-day',
  'Microsoft',
  'Apple',
  'Google',
  'Cisco',
  'Fortinet',
  'VMware',
  'Exploit',
  'Vulnerability',
  'Patch',
  'Update',
  'Data Breach',
  'APT',
  'Malware',
  'Trojan',
  'Botnet',
  'DDoS',
  'SQLi',
  'XSS',
  'RCE',
  'Privilege Escalation',
  'Critical',
]

// Pagination
export const DEFAULT_PAGE_SIZE = 15
export const MAX_PAGE_SIZE = 50

// Site metadata
export const SITE_NAME = 'VulnHub'
export const SITE_DESCRIPTION = 'Real-time cybersecurity threat intelligence aggregator'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://vulnerabilityhub.com'
export const SITE_LOGO = '/images/logo.png'
export const SITE_FAVICON = '/images/favicon.ico'

// Social/Contact
export const CONTACT_EMAIL = 'support@vulnerabilityhub.com'
export const GITHUB_URL = 'https://github.com/toweringpillow/VulnHub'

// AdSense
export const ADSENSE_CLIENT_ID = 'ca-pub-6273211993737711'

// Rate limiting
export const RATE_LIMIT_REQUESTS = 100
export const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

