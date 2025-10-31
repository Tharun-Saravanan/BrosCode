#!/bin/bash

EC2_IP="3.145.158.194"
EC2_USER="ubuntu"
KEY_PATH="$(dirname "$0")/mykeypair.pem"

echo "🧪 Testing Gemini AI Directly on EC2"
echo "====================================="
echo ""

ssh -i $KEY_PATH $EC2_USER@$EC2_IP << 'ENDSSH'
cd /home/ubuntu/ai
source venv/bin/activate

echo "Testing Gemini API with Python..."
python3 << 'PYTHON'
import os
import google.generativeai as genai

# Load .env
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('GEMINI_API_KEY')
if not api_key:
    api_key = 'AIzaSyBvLE1sDxEDx4kGgxuSO_XiThlBgg9wHso'

print(f"API Key (first 20 chars): {api_key[:20]}...")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel('gemini-pro')
    print("✅ Gemini model loaded successfully")
    
    # Test a simple prompt
    response = model.generate_content("Say 'Hello from Gemini!'")
    print(f"✅ Gemini response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
PYTHON

ENDSSH
