#!/bin/bash

EC2_IP="3.145.158.194"
EC2_USER="ubuntu"
KEY_PATH="$(dirname "$0")/mykeypair.pem"

echo "📊 Checking AI Service Logs"
echo "============================"
echo ""

ssh -i $KEY_PATH $EC2_USER@$EC2_IP << 'ENDSSH'
echo "Last 50 lines of service logs:"
echo "================================"
sudo journalctl -u ai-recommendation -n 50 --no-pager

echo ""
echo "Service status:"
echo "==============="
sudo systemctl status ai-recommendation --no-pager
ENDSSH
