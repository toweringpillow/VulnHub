/**
 * Structured Data (JSON-LD) component for SEO
 * Adds schema.org markup for better search engine understanding
 */

interface StructuredDataProps {
  data: object
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}

