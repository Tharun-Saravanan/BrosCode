#!/bin/bash

# Complete deployment script with HTTPS setup for aptest.prasklatechnology.com
set -e

EC2_IP="3.145.158.194"
EC2_USER="ubuntu"
KEY_PATH="$(dirname "$0")/mykeypair.pem"
REMOTE_DIR="/home/ubuntu/ai"
DOMAIN="aptest.prasklatechnology.com"
EMAIL="tharun.s@prasklatechnology.com"

echo "🚀 Deploying AI Recommendation API with HTTPS"
echo "=============================================="
echo "EC2 IP: $EC2_IP"
echo "Domain: $DOMAIN"
echo ""

# Check if PEM key exists
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ Error: PEM key not found at $KEY_PATH"
    exit 1
fi

# Step 1: Upload files to EC2
echo "📤 Step 1: Uploading files to EC2..."
SCRIPT_DIR="$(dirname "$0")"
ssh -i $KEY_PATH $EC2_USER@$EC2_IP "mkdir -p $REMOTE_DIR"

scp -i $KEY_PATH \
    "$SCRIPT_DIR/app_new.py" \
    "$SCRIPT_DIR/requirements-simple.txt" \
    "$SCRIPT_DIR/.env" \
    $EC2_USER@$EC2_IP:$REMOTE_DIR/

echo "✅ Files uploaded successfully!"

# Step 2: Install dependencies and setup
echo ""
echo "🔧 Step 2: Setting up Python environment on EC2..."
ssh -i $KEY_PATH $EC2_USER@$EC2_IP << 'ENDSSH'
cd /home/ubuntu/ai

# Install Python and pip if not present
sudo apt-get update
sudo apt-get install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements-simple.txt
pip install gunicorn

# Rename app_new.py to app.py
mv app_new.py app.py

echo "✅ Python environment ready"
ENDSSH

# Step 3: Setup Nginx for the domain
echo ""
echo "🌐 Step 3: Configuring Nginx for $DOMAIN..."
ssh -i $KEY_PATH $EC2_USER@$EC2_IP << ENDSSH
# Create Nginx configuration
sudo tee /etc/nginx/sites-available/ai-api << 'EOF'
server {
    listen 80;
    server_name $DOMAIN;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 120s;
        proxy_connect_timeout 120s;
    }
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/ai-api /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx

echo "✅ Nginx configured"
ENDSSH

# Step 4: Setup systemd service for the Flask app
echo ""
echo "⚙️  Step 4: Creating systemd service..."
ssh -i $KEY_PATH $EC2_USER@$EC2_IP << 'ENDSSH'
# Create systemd service file
sudo tee /etc/systemd/system/ai-recommendation.service << 'EOF'
[Unit]
Description=AI Recommendation API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/ai
Environment="PATH=/home/ubuntu/ai/venv/bin"
ExecStart=/home/ubuntu/ai/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 2 --threads 4 --timeout 120 app:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and start service
sudo systemctl daemon-reload
sudo systemctl enable ai-recommendation
sudo systemctl restart ai-recommendation

echo "✅ Service started"
ENDSSH

# Step 5: Wait for service to start
echo ""
echo "⏳ Step 5: Waiting for service to start..."
sleep 5

# Step 6: Setup SSL with Let's Encrypt
echo ""
echo "🔐 Step 6: Setting up SSL certificate..."
echo "⚠️  Make sure DNS A record for $DOMAIN points to $EC2_IP"
read -p "Press Enter to continue with SSL setup (or Ctrl+C to skip)..."

ssh -i $KEY_PATH $EC2_USER@$EC2_IP << ENDSSH
# Obtain SSL certificate
sudo certbot --nginx -d $DOMAIN --non-interactive --agree-tos -m $EMAIL --redirect

echo "✅ SSL certificate installed"
ENDSSH

# Step 7: Test the deployment
echo ""
echo "🧪 Step 7: Testing deployment..."
echo ""

# Test HTTP (will redirect to HTTPS if SSL is set up)
echo "Testing health endpoint..."
curl -s http://$DOMAIN/health | python3 -m json.tool || echo "⚠️  HTTP test failed"

echo ""
echo "Testing HTTPS health endpoint..."
curl -s https://$DOMAIN/health | python3 -m json.tool || echo "⚠️  HTTPS test failed"

echo ""
echo "✅ Deployment complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Your AI Recommendation API is live!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 API Endpoints:"
echo "   Health: https://$DOMAIN/health"
echo "   Recommendations: https://$DOMAIN/api/recommendations/<user_id>?limit=5"
echo ""
echo "🧪 Test Commands:"
echo "   curl https://$DOMAIN/health"
echo "   curl https://$DOMAIN/api/recommendations/test-user-123?limit=5"
echo ""
echo "📊 Manage Service:"
echo "   ssh -i $KEY_PATH $EC2_USER@$EC2_IP"
echo "   sudo systemctl status ai-recommendation"
echo "   sudo systemctl restart ai-recommendation"
echo "   sudo journalctl -u ai-recommendation -f"
echo ""
echo "🔄 Update .env file with:"
echo "   VITE_RECOMMENDATION_API_URL=https://$DOMAIN"
echo ""
