#!/bin/bash

EC2_IP="3.145.158.194"
EC2_USER="ubuntu"
KEY_PATH="$(dirname "$0")/mykeypair.pem"

echo "📊 Checking Application Startup Logs"
echo "====================================="
echo ""

ssh -i $KEY_PATH $EC2_USER@$EC2_IP << 'ENDSSH'
echo "Checking if app prints to stdout/stderr..."
sudo journalctl -u ai-recommendation --since "2 minutes ago" --no-pager | grep -i "gemini\|loading\|error\|warning" || echo "No Gemini-related logs found"

echo ""
echo "Testing Gemini directly in Python..."
cd /home/ubuntu/ai
source venv/bin/activate

python3 << 'PYTHON'
import google.generativeai as genai

api_key = 'AIzaSyBvLE1sDxEDx4kGgxuSO_XiThlBgg9wHso'
genai.configure(api_key=api_key)

print("\nTesting gemini-2.0-flash-exp...")
try:
    model = genai.GenerativeModel('gemini-2.0-flash-exp')
    response = model.generate_content("Say 'Hello!'")
    print(f"✅ Success: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
PYTHON

ENDSSH
