#!/bin/bash

# Deploy Gemini AI update to EC2
set -e

EC2_IP="3.145.158.194"
EC2_USER="ubuntu"
KEY_PATH="$(dirname "$0")/mykeypair.pem"
REMOTE_DIR="/home/ubuntu/ai"

echo "🚀 Deploying Gemini AI Update"
echo "=============================="
echo "EC2 IP: $EC2_IP"
echo ""

# Check if PEM key exists
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ Error: PEM key not found at $KEY_PATH"
    exit 1
fi

# Step 1: Upload updated files
echo "📤 Step 1: Uploading updated files to EC2..."
SCRIPT_DIR="$(dirname "$0")"

scp -i $KEY_PATH \
    "$SCRIPT_DIR/app.py" \
    "$SCRIPT_DIR/ai.py" \
    "$SCRIPT_DIR/requirements-simple.txt" \
    "$SCRIPT_DIR/.env" \
    $EC2_USER@$EC2_IP:$REMOTE_DIR/

echo "✅ Files uploaded successfully!"

# Step 2: Update dependencies and restart service
echo ""
echo "🔧 Step 2: Updating dependencies and restarting service..."
ssh -i $KEY_PATH $EC2_USER@$EC2_IP << 'ENDSSH'
cd /home/ubuntu/ai

# Activate virtual environment
source venv/bin/activate

# Update dependencies (add google-generativeai)
pip install -r requirements-simple.txt

# Restart the service
sudo systemctl restart ai-recommendation

# Wait a moment for service to start
sleep 3

# Check service status
sudo systemctl status ai-recommendation --no-pager

echo ""
echo "✅ Service restarted with Gemini AI"
ENDSSH

# Step 3: Test the deployment
echo ""
echo "🧪 Step 3: Testing Gemini AI integration..."
sleep 2

echo ""
echo "Testing health endpoint..."
curl -s http://$EC2_IP/health | python3 -m json.tool

echo ""
echo "Testing recommendations endpoint (this may take a moment)..."
curl -s "http://$EC2_IP/api/recommendations/test-user-123?limit=4" | python3 -m json.tool

echo ""
echo "✅ Deployment complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 Gemini AI Update Deployed Successfully!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 Test Endpoints:"
echo "   Health: http://$EC2_IP/health"
echo "   Recommendations: http://$EC2_IP/api/recommendations/test-user-123?limit=4"
echo ""
echo "📊 View Logs:"
echo "   ssh -i $KEY_PATH $EC2_USER@$EC2_IP"
echo "   sudo journalctl -u ai-recommendation -f"
echo ""
echo "🔄 If using HTTPS domain:"
echo "   https://aptest.prasklatechnology.com/health"
echo "   https://aptest.prasklatechnology.com/api/recommendations/test-user-123?limit=4"
echo ""

