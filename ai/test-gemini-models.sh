#!/bin/bash

EC2_IP="3.145.158.194"
EC2_USER="ubuntu"
KEY_PATH="$(dirname "$0")/mykeypair.pem"

echo "🧪 Testing Available Gemini Models"
echo "=================================="
echo ""

ssh -i $KEY_PATH $EC2_USER@$EC2_IP << 'ENDSSH'
cd /home/ubuntu/ai
source venv/bin/activate

python3 << 'PYTHON'
import google.generativeai as genai

api_key = 'AIzaSyBvLE1sDxEDx4kGgxuSO_XiThlBgg9wHso'
genai.configure(api_key=api_key)

print("Available Gemini models:")
print("=" * 50)
for model in genai.list_models():
    if 'generateContent' in model.supported_generation_methods:
        print(f"✓ {model.name}")

print("\n" + "=" * 50)
print("\nTesting gemini-1.5-flash...")
try:
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content("Say 'Hello from Gemini 1.5 Flash!'")
    print(f"✅ Success: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")

print("\nTesting gemini-1.0-pro...")
try:
    model = genai.GenerativeModel('gemini-1.0-pro')
    response = model.generate_content("Say 'Hello from Gemini 1.0 Pro!'")
    print(f"✅ Success: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
PYTHON

ENDSSH
