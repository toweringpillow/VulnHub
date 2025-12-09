/**
 * Structured Data (JSON-LD) component for SEO
 * Adds schema.org markup for better search engine understanding
 */

interface StructuredDataProps {
  data: object
}

export default function StructuredData({ data }: StructuredDataProps) {
  // JSON.stringify is safe for JSON-LD - it escapes all special characters
  // This is the standard way to inject JSON-LD structured data
  const jsonString = JSON.stringify(data)
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonString }}
    />
  )
}

