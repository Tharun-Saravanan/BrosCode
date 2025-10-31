#!/bin/bash
# Run this script on EC2 to check DNS and install SSL

DOMAIN="aptest.prasklatechnology.com"
EXPECTED_IP="3.145.158.194"
EMAIL="tharun.s@prasklatechnology.com"

echo "🔍 Checking DNS for $DOMAIN..."
echo ""

# Get current IP from DNS
CURRENT_IP=$(dig +short $DOMAIN | tail -n1)

if [ -z "$CURRENT_IP" ]; then
    echo "❌ Domain does not resolve"
    echo ""
    echo "Action: Update DNS A record to point to $EXPECTED_IP"
    exit 1
fi

echo "Current DNS: $CURRENT_IP"
echo "Expected IP: $EXPECTED_IP"
echo ""

if [ "$CURRENT_IP" != "$EXPECTED_IP" ]; then
    echo "❌ DNS not updated yet"
    echo ""
    echo "Action: Update DNS A record to point to $EXPECTED_IP"
    echo "Then wait 15-30 minutes for propagation"
    exit 1
fi

echo "✅ DNS is correct!"
echo ""
echo "🔐 Installing SSL certificate..."
echo ""

# Install SSL certificate
sudo certbot --nginx -d $DOMAIN \
    --non-interactive --agree-tos -m $EMAIL --redirect

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSL certificate installed successfully!"
    echo ""
    echo "🧪 Testing HTTPS..."
    sleep 2
    curl -s https://$DOMAIN/health | python3 -m json.tool
    echo ""
    echo "✅ HTTPS is working!"
    echo ""
    echo "🎉 Deployment complete!"
    echo ""
    echo "Next steps:"
    echo "1. Test: curl https://$DOMAIN/api/recommendations/test-user-123?limit=4"
    echo "2. Rebuild frontend: npm run build"
    echo "3. Deploy frontend"
else
    echo ""
    echo "❌ SSL installation failed"
    echo ""
    echo "Check logs: sudo tail -f /var/log/letsencrypt/letsencrypt.log"
    exit 1
fi
