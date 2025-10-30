#!/bin/bash

# EC2 Setup Script for AI Recommendation API
# Run this script on your EC2 instance

echo "🚀 AI Recommendation API - EC2 Setup"
echo "====================================="

# Update system
echo ""
echo "📦 Updating system packages..."
sudo yum update -y || sudo apt-get update -y

# Install Docker
echo ""
echo "🐳 Installing Docker..."
if command -v yum &> /dev/null; then
    # Amazon Linux 2
    sudo yum install -y docker
    sudo service docker start
    sudo usermod -a -G docker ec2-user
elif command -v apt-get &> /dev/null; then
    # Ubuntu
    sudo apt-get install -y docker.io docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -a -G docker ubuntu
fi

# Install Docker Compose (if not already installed)
echo ""
echo "🔧 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installations
echo ""
echo "✅ Verifying installations..."
docker --version
docker-compose --version

echo ""
echo "📋 Setup complete! Please log out and log back in for Docker group changes to take effect."
echo ""
echo "Next steps:"
echo "1. Upload your ai directory to EC2"
echo "2. cd into the ai directory"
echo "3. Run: ./deploy.sh"
echo ""
echo "Or manually run:"
echo "  docker-compose up -d"
