# Commands to Run on EC2

You're currently SSH'd into EC2. Run these commands:

## Step 1: Check DNS

```bash
dig aptest.prasklatechnology.com +short
```

**Expected output:** `3.145.158.194`

If you see `147.93.17.221` or nothing, DNS is not updated yet. Update DNS first and wait.

## Step 2: Check if API is Running

```bash
curl http://localhost:5000/health
```

**Expected output:** JSON with `"status": "healthy"`

## Step 3: Install SSL Certificate

If DNS is correct (shows `3.145.158.194`), run:

```bash
sudo certbot --nginx -d aptest.prasklatechnology.com --non-interactive --agree-tos -m tharun.s@prasklatechnology.com --redirect
```

## Step 4: Test HTTPS

```bash
curl https://aptest.prasklatechnology.com/health
```

## Step 5: Test Recommendations

```bash
curl "https://aptest.prasklatechnology.com/api/recommendations/test-user-123?limit=4"
```

## If DNS is Not Updated Yet

### Option A: Update DNS Now

1. Go to your DNS provider
2. Update A record: `aptest` → `3.145.158.194`
3. Wait 15-30 minutes
4. Run Step 1 again to check

### Option B: Use HTTP for Now (Temporary)

Update your frontend `.env`:
```bash
VITE_RECOMMENDATION_API_URL=http://3.145.158.194
```

**Note:** This will still have mixed content errors on HTTPS sites.

## Troubleshooting

### Check Service Status
```bash
sudo systemctl status ai-recommendation
```

### View Logs
```bash
sudo journalctl -u ai-recommendation -f
```

### Restart Service
```bash
sudo systemctl restart ai-recommendation
```

### Check Nginx
```bash
sudo systemctl status nginx
sudo nginx -t
```

### View Certbot Logs
```bash
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

## Quick Test Script

Or download and run the automated script:

```bash
cd ~/ai
wget https://raw.githubusercontent.com/[your-repo]/check-and-install-ssl.sh
chmod +x check-and-install-ssl.sh
./check-and-install-ssl.sh
```

Or create it manually:
```bash
nano check-ssl.sh
# Paste the script content
chmod +x check-ssl.sh
./check-ssl.sh
```
