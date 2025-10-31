#!/bin/bash

# Test script for recommendation API

echo "🧪 Testing Recommendation API"
echo "=============================="
echo ""

# Test HTTP endpoint (will work from command line but not from HTTPS site)
echo "1. Testing HTTP endpoint (current):"
curl -s http://3.145.158.194:5000/health && echo "✅ HTTP health check passed" || echo "❌ HTTP health check failed"
echo ""

# Test recommendations
echo "2. Testing recommendations endpoint:"
curl -s "http://3.145.158.194:5000/api/recommendations/test-user-123?limit=4" | head -n 5
echo ""

# Check if HTTPS is set up
echo "3. Testing HTTPS endpoint (if configured):"
if curl -s -k https://3.145.158.194:5000/health &> /dev/null; then
    echo "✅ HTTPS is configured on EC2"
elif curl -s https://api.recommerceplugin.xyz/health &> /dev/null; then
    echo "✅ HTTPS is configured with domain"
else
    echo "⚠️  HTTPS not yet configured"
    echo "   Run: ssh -i ai/mykeypair.pem ubuntu@3.145.158.194"
    echo "   Then: cd ai && sudo ./setup-https.sh"
fi
echo ""

echo "📝 Next steps:"
echo "   1. Set up HTTPS on EC2 (see FIXING_MIXED_CONTENT.md)"
echo "   2. Update .env with HTTPS URL"
echo "   3. Rebuild: npm run build"
echo "   4. Redeploy your site"
