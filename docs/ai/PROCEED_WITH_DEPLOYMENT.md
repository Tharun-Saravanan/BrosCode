# Ready to Deploy HTTPS

## Current Situation

✅ **EC2 Instance:** `3.145.158.194` (confirmed accessible)
✅ **API Running:** Port 5000 (working locally on EC2)
✅ **Domain:** `aptest.prasklatechnology.com`
⚠️ **DNS:** Currently points to `147.93.17.221` (needs update)

## Two Options

### Option A: Deploy Now (Recommended)

You can run the deployment script now. It will:
1. ✅ Install Nginx
2. ✅ Configure reverse proxy
3. ✅ Setup systemd service
4. ⚠️ SSL certificate will fail (DNS not ready)

Then once DNS propagates, just run:
```bash
ssh -i ai/mykeypair.pem ubuntu@3.145.158.194
sudo certbot --nginx -d aptest.prasklatechnology.com --non-interactive --agree-tos -m your-email@example.com
```

### Option B: Wait for DNS, Then Deploy

1. Update DNS A record: `aptest` → `3.145.158.194`
2. Wait 15-30 minutes
3. Run: `./ai/check-dns.sh` (until it passes)
4. Run: `./ai/deploy-with-https.sh`

## Quick Deploy Command

If you want to proceed with Option A:

```bash
cd ai
./deploy-with-https.sh
```

When it asks about SSL setup, you can:
- Press Ctrl+C to skip SSL for now
- Or let it try (it will fail but that's okay)

Then update DNS and run SSL setup later.

## Manual SSL Setup (After DNS Update)

```bash
ssh -i ai/mykeypair.pem ubuntu@3.145.158.194

# Install certbot if not already installed
sudo apt-get update
sudo apt-get install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d aptest.prasklatechnology.com \
  --non-interactive --agree-tos -m your-email@example.com --redirect
```

## Test After Deployment

Once DNS is updated and SSL is installed:

```bash
# Test HTTPS
curl https://aptest.prasklatechnology.com/health

# Test recommendations
curl "https://aptest.prasklatechnology.com/api/recommendations/test-user-123?limit=4"
```

## Update Frontend

Once HTTPS is working, your frontend is already configured:

```bash
# .env already has:
VITE_RECOMMENDATION_API_URL=https://aptest.prasklatechnology.com

# Just rebuild:
npm run build
```

## Need to Update DNS?

See `DNS_UPDATE_GUIDE.md` for detailed instructions.
