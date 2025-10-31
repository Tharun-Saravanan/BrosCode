#!/bin/bash

# Setup HTTPS for AI Recommendation API using Nginx + Let's Encrypt
# Run this on your EC2 instance

set -e

echo "🔒 Setting up HTTPS for AI Recommendation API"
echo "=============================================="

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "Please run as root (use sudo)"
    exit 1
fi

# Variables - UPDATE THESE
DOMAIN="api.recommerceplugin.xyz"  # You'll need to create this subdomain
EMAIL="your-email@example.com"     # For Let's Encrypt notifications

echo ""
echo "Domain: $DOMAIN"
echo "Email: $EMAIL"
echo ""
read -p "Are these correct? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Please edit this script and update DOMAIN and EMAIL variables"
    exit 1
fi

# Install Nginx
echo ""
echo "📦 Installing Nginx..."
if command -v yum &> /dev/null; then
    yum install -y nginx
elif command -v apt-get &> /dev/null; then
    apt-get update
    apt-get install -y nginx
fi

# Install Certbot
echo ""
echo "📦 Installing Certbot..."
if command -v yum &> /dev/null; then
    yum install -y certbot python3-certbot-nginx
elif command -v apt-get &> /dev/null; then
    apt-get install -y certbot python3-certbot-nginx
fi

# Create Nginx configuration
echo ""
echo "⚙️  Creating Nginx configuration..."
cat > /etc/nginx/conf.d/ai-api.conf << 'EOF'
server {
    listen 80;
    server_name DOMAIN_PLACEHOLDER;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Replace domain placeholder
sed -i "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" /etc/nginx/conf.d/ai-api.conf

# Test Nginx configuration
echo ""
echo "🧪 Testing Nginx configuration..."
nginx -t

# Start Nginx
echo ""
echo "🚀 Starting Nginx..."
systemctl start nginx
systemctl enable nginx

# Obtain SSL certificate
echo ""
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL

# Reload Nginx
systemctl reload nginx

echo ""
echo "✅ HTTPS setup complete!"
echo ""
echo "Your API is now available at: https://$DOMAIN"
echo ""
echo "Next steps:"
echo "1. Make sure your DNS A record points $DOMAIN to this EC2 IP"
echo "2. Update your frontend code to use: https://$DOMAIN"
echo "3. Test: curl https://$DOMAIN/health"
echo ""
echo "SSL certificate will auto-renew via certbot timer"
