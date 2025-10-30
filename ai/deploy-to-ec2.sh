#!/bin/bash

# EC2 Deployment Script for AI Recommendation API
EC2_IP="3.145.158.194"
EC2_USER="ubuntu"
KEY_PATH="./mykeypair.pem"
REMOTE_DIR="/home/ubuntu/ai"

echo "🚀 Deploying AI Recommendation API to EC2"
echo "=========================================="
echo "EC2 IP: $EC2_IP"
echo ""

# Step 1: Upload files to EC2
echo "📤 Step 1: Uploading files to EC2..."
ssh -i $KEY_PATH $EC2_USER@$EC2_IP "mkdir -p $REMOTE_DIR"

scp -i $KEY_PATH \
    app.py \
    requirements-flask.txt \
    Dockerfile \
    docker-compose.yml \
    .dockerignore \
    .env.example \
    ec2-setup.sh \
    deploy.sh \
    ai-recommendation.service \
    $EC2_USER@$EC2_IP:$REMOTE_DIR/

echo "✅ Files uploaded successfully!"

# Step 2: Setup EC2 environment
echo ""
echo "🔧 Step 2: Setting up EC2 environment..."
ssh -i $KEY_PATH $EC2_USER@$EC2_IP << 'EOF'
cd /home/ubuntu/ai
chmod +x ec2-setup.sh deploy.sh
sudo ./ec2-setup.sh
EOF

echo "✅ EC2 environment setup complete!"

# Step 3: Deploy application
echo ""
echo "🐳 Step 3: Deploying Docker container..."
ssh -i $KEY_PATH $EC2_USER@$EC2_IP << 'EOF'
cd /home/ubuntu/ai
cp .env.example .env
docker-compose up -d --build
docker-compose ps
EOF

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🎯 Your AI Recommendation API is now running!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🔗 API Endpoints:"
echo "   Health Check: http://$EC2_IP:5000/health"
echo "   Recommendations: http://$EC2_IP:5000/api/recommendations/<user_id>?limit=5"
echo ""
echo "🧪 Test Commands:"
echo "   curl http://$EC2_IP:5000/health"
echo "   curl http://$EC2_IP:5000/api/recommendations/test-user-123?limit=5"
echo ""
echo "📊 View Logs:"
echo "   ssh -i $KEY_PATH $EC2_USER@$EC2_IP 'cd ~/ai && docker-compose logs -f'"
echo ""
