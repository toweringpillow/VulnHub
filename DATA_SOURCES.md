# VulnHub Data Sources

This document lists all RSS feeds and data sources currently configured for VulnHub's cybersecurity threat aggregation.

## Current Feed Sources

### Tier 1: High-Frequency Breaking News (10 sources)
These sources update multiple times per day with breaking cybersecurity news:

1. **The Hacker News** - `https://feeds.feedburner.com/TheHackersNews?format=xml`
   - One of the most popular cybersecurity news sites
   - Updates: Multiple times daily
   - Focus: Breaking security news, vulnerabilities, breaches

2. **BleepingComputer** - `https://www.bleepingcomputer.com/feed/`
   - Excellent for breaking malware and ransomware news
   - Updates: Multiple times daily
   - Focus: Malware, ransomware, tech support scams

3. **Dark Reading** - `https://www.darkreading.com/rss.xml`
   - Industry-leading security publication
   - Updates: Daily
   - Focus: Enterprise security, threat intelligence

4. **SecurityWeek** - `https://www.securityweek.com/feed/`
   - Comprehensive security news coverage
   - Updates: Daily
   - Focus: Enterprise security, vulnerabilities, breaches

5. **Krebs on Security** - `https://krebsonsecurity.com/feed/`
   - Investigative cybersecurity journalism
   - Updates: 2-3 times per week
   - Focus: In-depth investigations, data breaches

6. **ZDNet Security** - `https://www.zdnet.com/topic/security/rss.xml`
   - Tech news with strong security coverage
   - Updates: Daily
   - Focus: Tech security, enterprise IT

7. **Threatpost** - `https://threatpost.com/feed/`
   - Independent security news
   - Updates: Daily
   - Focus: Vulnerabilities, malware, breaches

8. **CSO Online** - `https://www.csoonline.com/index.rss`
   - Chief Security Officer perspective
   - Updates: Daily
   - Focus: Enterprise security strategy

9. **Infosecurity Magazine** - `https://www.infosecurity-magazine.com/rss/news/`
   - European security publication
   - Updates: Daily
   - Focus: Global security news, compliance

10. **CyberScoop** - `https://www.cyberscoop.com/feed/`
    - Government and policy-focused security news
    - Updates: Daily
    - Focus: Government cybersecurity, policy

### Tier 2: Government & Official Sources (5 sources)
Official government advisories and alerts:

11. **CISA Advisories** - `https://www.cisa.gov/cybersecurity-advisories/all.xml`
    - US Cybersecurity and Infrastructure Security Agency
    - Updates: As needed (critical vulnerabilities)
    - Focus: Official vulnerability advisories

12. **CISA News** - `https://www.cisa.gov/news.xml`
    - CISA news and announcements
    - Updates: Weekly
    - Focus: Government security initiatives

13. **CISA Blog** - `https://www.cisa.gov/blog.xml`
    - CISA blog posts and guidance
    - Updates: Weekly
    - Focus: Security best practices, guidance

14. **US-CERT Alerts** - `https://www.us-cert.gov/ncas/alerts.xml`
    - US Computer Emergency Readiness Team alerts
    - Updates: As needed (critical threats)
    - Focus: Critical security alerts

15. **NCSC (UK)** - `https://www.ncsc.gov.uk/api/1/services/v1/all-rss-feed.xml`
    - UK National Cyber Security Centre
    - Updates: Daily
    - Focus: UK and international threats

### Tier 3: Vendor & Research Sources (10 sources)
Security vendor threat intelligence and research:

16. **Securelist (Kaspersky)** - `https://securelist.com/feed/`
    - Kaspersky threat research
    - Updates: Daily
    - Focus: Malware analysis, threat research

17. **Talos Intelligence (Cisco)** - `https://blog.talosintelligence.com/feeds/posts/default`
    - Cisco Talos threat intelligence
    - Updates: Daily
    - Focus: Threat intelligence, malware research

18. **Mandiant Threat Intelligence** - `https://www.fireeye.com/blog/threat-research/_jcr_content.feed`
    - Mandiant (FireEye) threat research
    - Updates: Weekly
    - Focus: APT groups, threat intelligence

19. **CrowdStrike Blog** - `https://www.crowdstrike.com/blog/feed/`
    - CrowdStrike threat intelligence
    - Updates: Daily
    - Focus: EDR, threat hunting, APTs

20. **SentinelOne Blog** - `https://www.sentinelone.com/blog/feed/`
    - SentinelOne threat research
    - Updates: Weekly
    - Focus: Endpoint security, malware

21. **Trend Micro Security News** - `https://www.trendmicro.com/vinfo/us/security/news/feed`
    - Trend Micro threat intelligence
    - Updates: Daily
    - Focus: Global threat landscape

22. **Symantec Threat Intelligence** - `https://www.symantec.com/blogs/threat-intelligence/feed`
    - Broadcom/Symantec threat research
    - Updates: Weekly
    - Focus: Threat intelligence, IOCs

23. **Proofpoint Threat Research** - `https://www.proofpoint.com/us/rss.xml`
    - Proofpoint email security research
    - Updates: Weekly
    - Focus: Email threats, phishing, BEC

24. **Palo Alto Networks Blog** - `https://www.paloaltonetworks.com/blog/feed`
    - Palo Alto threat research
    - Updates: Weekly
    - Focus: Network security, threat intelligence

25. **Fortinet Threat Research** - `https://www.fortinet.com/blog/feed`
    - Fortinet threat intelligence
    - Updates: Daily
    - Focus: Network security, threat landscape

### Tier 4: Specialized & Community Sources (8 sources)
Specialized security publications and community resources:

26. **Schneier on Security** - `https://www.schneier.com/feed/`
    - Bruce Schneier's security blog
    - Updates: 2-3 times per week
    - Focus: Cryptography, security policy, analysis

27. **HackRead** - `https://www.hackread.com/feed/`
    - Cybersecurity news aggregator
    - Updates: Daily
    - Focus: Hacking news, data breaches

28. **Help Net Security** - `https://www.helpnetsecurity.com/feed/`
    - European security news
    - Updates: Daily
    - Focus: Security products, vulnerabilities

29. **Security Affairs** - `https://www.securityaffairs.com/feed`
    - Italian security publication
    - Updates: Daily
    - Focus: Global security news

30. **Cybersecurity Insiders** - `https://www.cybersecurity-insiders.com/feed/`
    - Security industry news
    - Updates: Daily
    - Focus: Industry news, vendor updates

31. **Cyber Defense Magazine** - `https://www.cyberdefensemagazine.com/feed/`
    - Security magazine
    - Updates: Weekly
    - Focus: Security products, industry news

32. **SC Media** - `https://www.scmagazine.com/rss`
    - Security magazine
    - Updates: Daily
    - Focus: Security industry, products

33. **Computer Weekly Security** - `https://www.computerweekly.com/rss/Security.xml`
    - UK tech publication security section
    - Updates: Daily
    - Focus: Enterprise security, UK perspective

### Tier 5: CVE & Vulnerability Tracking (2 sources)
Official vulnerability databases:

34. **NVD CVE Feed** - `https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss-analyzed.xml`
    - National Vulnerability Database
    - Updates: Real-time (as CVEs are published)
    - Focus: Official CVE listings

35. **CVE Details (High CVSS)** - `https://www.cvedetails.com/vulnerability-feed.php?vendor_id=0&product_id=0&version_id=0&orderby=3&cvssscoremin=7`
    - CVE Details (CVSS 7.0+ only)
    - Updates: Daily
    - Focus: High-severity vulnerabilities

## Headline Feeds (5 sources)
Quick-update feeds for news ticker:

- The Hacker News
- BleepingComputer
- ZDNet Security
- Threatpost
- SecurityWeek

## World News Source
- **NewsAPI** - Used for general world news ticker (requires `NEWS_API_KEY`)

## Total Sources
- **35 RSS feeds** for cybersecurity articles
- **5 headline feeds** for quick updates
- **1 API** for world news

## Feed Update Frequency

The scraper runs based on your cron job configuration (see `EXTERNAL_CRON_SETUP.md`). Recommended:
- **Every 15-30 minutes** for breaking news
- **Every 6 hours** for comprehensive updates

## Source Priority

Sources are processed in order. The scraper will:
1. Process Tier 1 sources first (breaking news)
2. Then Tier 2 (government advisories)
3. Then Tier 3 (vendor research)
4. Then Tier 4 (specialized sources)
5. Finally Tier 5 (CVE feeds)

This ensures breaking news appears first, followed by official advisories, then research and analysis.

## Adding New Sources

To add a new source:

1. Find the RSS feed URL
2. Add it to `lib/constants.ts` in the appropriate tier
3. Test the feed URL works: `curl <feed-url>`
4. The scraper will automatically pick it up on the next run

## Feed Validation

All feeds are validated during scraping. If a feed fails:
- The error is logged
- The scraper continues with other feeds
- Failed feeds are retried on the next run

## Notes

- Some vendor feeds may require authentication or have rate limits
- Government feeds are typically very reliable
- CVE feeds update in real-time as vulnerabilities are published
- Some feeds may have duplicate content (scraper handles deduplication)


