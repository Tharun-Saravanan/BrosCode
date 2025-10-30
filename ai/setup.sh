#!/bin/bash

echo "🚀 Setting up AI Product Recommendation System..."

# Create virtual environment
echo "📦 Creating virtual environment..."
python3 -m venv venv

# Activate virtual environment
echo "✓ Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "⬆️  Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "✓ .env file created from .env.example"
else
    echo "✓ .env file already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To use the AI system:"
echo "  1. Activate the virtual environment: source venv/bin/activate"
echo "  2. Run the AI: python ai.py <user_id> <num_recommendations>"
echo ""
echo "Example:"
echo "  python ai.py test-user-123 5"
echo ""
