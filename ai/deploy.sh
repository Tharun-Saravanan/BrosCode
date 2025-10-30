#!/bin/bash

echo "🐳 AI Recommendation System - Docker Deployment Script"
echo "========================================================"

# Build Docker image
echo ""
echo "📦 Building Docker image..."
docker build -t ai-recommendation-api:latest .

if [ $? -ne 0 ]; then
    echo "❌ Docker build failed!"
    exit 1
fi

echo "✅ Docker image built successfully!"

# Option to run locally or prepare for EC2
echo ""
echo "Choose deployment option:"
echo "1) Run locally with Docker"
echo "2) Run with Docker Compose"
echo "3) Save image for EC2 deployment"
echo "4) Push to Docker Hub (requires login)"
read -p "Enter choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "🚀 Running container locally..."
        docker run -d \
            --name ai-recommendation-service \
            -p 5000:5000 \
            -e API_BASE_URL=https://wb16fax93g.execute-api.us-east-2.amazonaws.com/dev \
            ai-recommendation-api:latest
        
        echo ""
        echo "✅ Container started!"
        echo "🔗 API available at: http://localhost:5000"
        echo "🏥 Health check: http://localhost:5000/health"
        echo ""
        echo "To view logs: docker logs -f ai-recommendation-service"
        echo "To stop: docker stop ai-recommendation-service"
        ;;
    2)
        echo ""
        echo "🚀 Running with Docker Compose..."
        docker-compose up -d
        
        echo ""
        echo "✅ Services started!"
        echo "🔗 API available at: http://localhost:5000"
        echo ""
        echo "To view logs: docker-compose logs -f"
        echo "To stop: docker-compose down"
        ;;
    3)
        echo ""
        echo "💾 Saving Docker image for EC2 deployment..."
        docker save ai-recommendation-api:latest | gzip > ai-recommendation-api.tar.gz
        
        echo ""
        echo "✅ Image saved to: ai-recommendation-api.tar.gz"
        echo ""
        echo "📋 EC2 Deployment Steps:"
        echo "1. Upload ai-recommendation-api.tar.gz to EC2"
        echo "2. On EC2, run: gunzip -c ai-recommendation-api.tar.gz | docker load"
        echo "3. Run: docker run -d -p 5000:5000 ai-recommendation-api:latest"
        ;;
    4)
        read -p "Enter Docker Hub username: " username
        read -p "Enter image tag (default: latest): " tag
        tag=${tag:-latest}
        
        echo ""
        echo "🏷️  Tagging image..."
        docker tag ai-recommendation-api:latest $username/ai-recommendation-api:$tag
        
        echo "📤 Pushing to Docker Hub..."
        docker push $username/ai-recommendation-api:$tag
        
        echo ""
        echo "✅ Image pushed to Docker Hub!"
        echo "🔗 Pull on EC2 with: docker pull $username/ai-recommendation-api:$tag"
        ;;
    *)
        echo "Invalid choice!"
        exit 1
        ;;
esac

echo ""
echo "✨ Deployment complete!"
