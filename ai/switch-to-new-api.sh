#!/bin/bash

# Script to switch to the new recommendation API

echo "🔄 Switching to new recommendation API..."
echo ""

# Backup old app
if [ -f "app.py" ]; then
    echo "📦 Backing up old app.py to app_old.py"
    cp app.py app_old.py
fi

# Replace with new app
echo "✅ Installing new app.py"
cp app_new.py app.py

# Update requirements
echo "📝 Updating requirements.txt"
cp requirements-simple.txt requirements-flask.txt

echo ""
echo "✅ Switch complete!"
echo ""
echo "Next steps:"
echo "1. Install dependencies: pip install -r requirements-flask.txt"
echo "2. Test locally: python app.py"
echo "3. Deploy to EC2: ./deploy-to-ec2.sh"
echo ""
