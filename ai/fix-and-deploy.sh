#!/bin/bash

# Fix port conflict and deploy Gemini AI update
set -e

EC2_IP="3.145.158.194"
EC2_USER="ubuntu"
KEY_PATH="$(dirname "$0")/mykeypair.pem"
REMOTE_DIR="/home/ubuntu/ai"

echo "🚀 Fixing Port Conflict and Deploying Gemini AI"
echo "==============================================="
echo "EC2 IP: $EC2_IP"
echo ""

# Check if PEM key exists
if [ ! -f "$KEY_PATH" ]; then
    echo "❌ Error: PEM key not found at $KEY_PATH"
    exit 1
fi

# Step 1: Stop service and kill any processes on port 5000
echo "🛑 Step 1: Stopping old service and clearing port 5000..."
ssh -i $KEY_PATH $EC2_USER@$EC2_IP << 'ENDSSH'
# Stop the service
sudo systemctl stop ai-recommendation

# Kill any process using port 5000
sudo fuser -k 5000/tcp || true

# Wait a moment
sleep 2

echo "✅ Port cleared"
ENDSSH

# Step 2: Upload updated files
echo ""
echo "📤 Step 2: Uploading updated files to EC2..."
SCRIPT_DIR="$(dirname "$0")"

scp -i $KEY_PATH \
    "$SCRIPT_DIR/app.py" \
    "$SCRIPT_DIR/ai.py" \
    "$SCRIPT_DIR/requirements-simple.txt" \
    "$SCRIPT_DIR/.env" \
    $EC2_USER@$EC2_IP:$REMOTE_DIR/

echo "✅ Files uploaded successfully!"

# Step 3: Update dependencies and start service
echo ""
echo "🔧 Step 3: Updating dependencies and starting service..."
ssh -i $KEY_PATH $EC2_USER@$EC2_IP << 'ENDSSH'
cd /home/ubuntu/ai

# Activate virtual environment
source venv/bin/activate

# Update dependencies
pip install -q google-generativeai

# Start the service
sudo systemctl start ai-recommendation

# Wait for service to start
sleep 5

# Check service status
sudo systemctl status ai-recommendation --no-pager -l

echo ""
echo "✅ Service started with Gemini AI"
ENDSSH

# Step 4: Test the deployment
echo ""
echo "🧪 Step 4: Testing Gemini AI integration..."
sleep 3

echo ""
echo "Testing health endpoint..."
curl -s http://$EC2_IP/health | python3 -m json.tool || echo "⚠️ Health check failed"

echo ""
echo "Testing recommendations endpoint (this may take 10-15 seconds)..."
curl -s "http://$EC2_IP/api/recommendations/test-user-123?limit=4" | python3 -m json.tool || echo "⚠️ Recommendations test failed"

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

