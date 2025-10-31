# Quick Start - Deploy AI Recommendation API

## Current Situation

Your domain `aptest.prasklatechnology.com` currently points to `147.93.17.221`
Your EC2 instance is at `3.145.158.194`

## Option 1: Update DNS (Recommended)

Update your DNS A record to point to the EC2 instance:

1. Go to your DNS provider (where you manage prasklatechnology.com)
2. Find the A record for `aptest.prasklatechnology.com`
3. Change the IP from `147.93.17.221` to `3.145.158.194`
4. Wait 5-30 minutes for DNS propagation
5. Run: `./check-dns.sh` to verify
6. Deploy: `./deploy-with-https.sh`

## Option 2: Use Current IP

If `147.93.17.221` is your EC2 instance, update the deployment script:

```bash
# Edit deploy-with-https.sh
nano deploy-with-https.sh

# Change this line:
EC2_IP="3.145.158.194"

# To:
EC2_IP="147.93.17.221"
```

Then deploy:
```bash
./deploy-with-https.sh
```

## Option 3: Deploy Without Domain (Testing)

Deploy directly to IP without HTTPS:

```bash
# SSH to EC2
ssh -i mykeypair.pem ubuntu@3.145.158.194

# Upload and run
cd /home/ubuntu
mkdir -p ai
exit

# From your local machine
scp -i ai/mykeypair.pem ai/app_new.py ubuntu@3.145.158.194:~/ai/app.py
scp -i ai/mykeypair.pem ai/requirements-simple.txt ubuntu@3.145.158.194:~/ai/
scp -i ai/mykeypair.pem ai/.env ubuntu@3.145.158.194:~/ai/

# SSH back and setup
ssh -i ai/mykeypair.pem ubuntu@3.145.158.194

cd ai
python3 -m venv venv
source venv/bin/activate
pip install -r requirements-simple.txt
pip install gunicorn

# Run the API
gunicorn --bind 0.0.0.0:5000 --workers 2 app:app
```

Then update your `.env`:
```bash
VITE_RECOMMENDATION_API_URL=http://3.145.158.194:5000
```

**Note:** This will still have mixed content errors on HTTPS sites.

## Verify Which Option to Use

Check which IP is your EC2:

```bash
# Test IP 1
curl http://3.145.158.194:5000/health

# Test IP 2  
curl http://147.93.17.221:5000/health
```

Whichever responds is your EC2 instance.

## Need Help?

1. Check if you can SSH to EC2:
   ```bash
   ssh -i ai/mykeypair.pem ubuntu@3.145.158.194
   ```

2. Check what's running on the domain:
   ```bash
   curl -I http://aptest.prasklatechnology.com
   ```

3. See full deployment guide: `DEPLOYMENT_GUIDE.md`
