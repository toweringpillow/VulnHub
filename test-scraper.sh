#!/bin/bash
# Bash script to test the scraper endpoint
# Usage: ./test-scraper.sh https://your-vercel-url.vercel.app your-cron-secret

if [ $# -ne 2 ]; then
    echo "Usage: $0 <VERCEL_URL> <CRON_SECRET>"
    echo "Example: $0 https://vuln-hub-blue.vercel.app my-secret-key"
    exit 1
fi

URL=$1
SECRET=$2

echo "Testing scraper endpoint: $URL/api/cron/scraper"
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Authorization: Bearer $SECRET" \
  -H "Content-Type: application/json" \
  "$URL/api/cron/scraper")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo "✅ Success!"
    echo ""
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    
    success=$(echo "$body" | jq -r '.success' 2>/dev/null)
    if [ "$success" = "true" ]; then
        echo ""
        echo "Articles processed: $(echo "$body" | jq -r '.result.articlesProcessed')"
        echo "Articles added: $(echo "$body" | jq -r '.result.articlesAdded')"
        echo "Articles skipped: $(echo "$body" | jq -r '.result.articlesSkipped')"
    fi
else
    echo "❌ Error! HTTP Status: $http_code"
    echo ""
    echo "$body" | jq '.' 2>/dev/null || echo "$body"
    exit 1
fi

