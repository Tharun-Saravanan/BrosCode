#!/bin/bash

# Check if DNS is properly configured

DOMAIN="aptest.prasklatechnology.com"
EXPECTED_IP="3.145.158.194"

echo "🔍 Checking DNS configuration for $DOMAIN"
echo "=========================================="
echo ""

# Check DNS resolution
echo "1. DNS Resolution:"
RESOLVED_IP=$(dig +short $DOMAIN | tail -n1)

if [ -z "$RESOLVED_IP" ]; then
    echo "   ❌ Domain does not resolve"
    echo ""
    echo "   Action needed:"
    echo "   - Add A record in your DNS provider:"
    echo "     Name: aptest"
    echo "     Type: A"
    echo "     Value: $EXPECTED_IP"
    echo "     TTL: 300"
    exit 1
elif [ "$RESOLVED_IP" = "$EXPECTED_IP" ]; then
    echo "   ✅ Domain resolves correctly to $RESOLVED_IP"
else
    echo "   ⚠️  Domain resolves to $RESOLVED_IP (expected $EXPECTED_IP)"
    echo ""
    echo "   Action needed:"
    echo "   - Update A record to point to $EXPECTED_IP"
    exit 1
fi

echo ""
echo "2. Testing HTTP connection:"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://$EXPECTED_IP:5000/health 2>/dev/null)

if [ "$HTTP_STATUS" = "200" ]; then
    echo "   ✅ EC2 API is responding on port 5000"
else
    echo "   ⚠️  EC2 API not responding (status: $HTTP_STATUS)"
fi

echo ""
echo "3. Security Group Check:"
echo "   Make sure EC2 security group allows:"
echo "   - Port 80 (HTTP) from 0.0.0.0/0"
echo "   - Port 443 (HTTPS) from 0.0.0.0/0"
echo "   - Port 5000 from localhost only"

echo ""
if [ "$RESOLVED_IP" = "$EXPECTED_IP" ]; then
    echo "✅ DNS is configured correctly!"
    echo "   You can proceed with deployment: ./deploy-with-https.sh"
else
    echo "⚠️  Please fix DNS configuration before deploying"
fi
echo ""
