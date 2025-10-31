# AI Recommendation API Deployment Guide

## Quick Start

Deploy the new recommendation API to your EC2 instance with HTTPS support.

## Prerequisites

1. **DNS Configuration** - Add A record:
   - Name: `aptest`
   - Type: A
   - Value: `3.145.158.194`
   - Domain: `prasklatechnology.com`
   - Result: `aptest.prasklatechnology.com` → `3.145.158.194`

2. **EC2 Security Group** - Allow inbound traffic:
   - Port 80 (HTTP) from 0.0.0.0/0
   - Port 443 (HTTPS) from 0.0.0.0/0
   - Port 22 (SSH) from your IP

3. **Email for SSL** - Update in `deploy-with-https.sh`:
   ```bash
   EMAIL="your-email@example.com"
   ```

## Deployment Steps

### Step 1: Check DNS Configuration

```bash
cd ai
./check-dns.sh
```

Wait for DNS to propagate (5-30 minutes) if you just added the A record.

### Step 2: Deploy to EC2

```bash
./deploy-with-https.sh
```

This script will:
1. Upload the new API code to EC2
2. Install Python dependencies
3. Configure Nginx as reverse proxy
4. Setup systemd service for auto-restart
5. Install SSL certificate with Let's Encrypt
6. Test the deployment

### Step 3: Update Frontend

The `.env` file has been updated with:
```bash
VITE_RECOMMENDATION_API_URL=https://aptest.prasklatechnology.com
```

Rebuild and redeploy your frontend:
```bash
npm run build
# Upload dist folder to your hosting
```

## Testing

### Test the API

```bash
# Health check
curl https://aptest.prasklatechnology.com/health

# Get recommendations
curl "https://aptest.prasklatechnology.com/api/recommendations/test-user-123?limit=5"
```

### Test from browser

Open your site and check the console - no more mixed content errors!

## Managing the Service

### SSH to EC2

```bash
ssh -i ai/mykeypair.pem ubuntu@3.145.158.194
```

### Service Commands

```bash
# Check status
sudo systemctl status ai-recommendation

# View logs
sudo journalctl -u ai-recommendation -f

# Restart service
sudo systemctl restart ai-recommendation

# Stop service
sudo systemctl stop ai-recommendation

# Start service
sudo systemctl start ai-recommendation
```

### Update the API

1. Make changes to `app_new.py`
2. Run deployment script again:
   ```bash
   ./deploy-with-https.sh
   ```

## What Changed?

### Old API (app.py)
- Used GPT-2 model (heavy, slow)
- Required transformers and torch
- Random recommendations

### New API (app_new.py)
- Collaborative filtering algorithm
- Lightweight (Flask + NumPy only)
- Smart recommendations based on:
  - User's cart items
  - User's liked products
  - Category preferences
  - Price similarity

## API Endpoints

### GET /health
Health check endpoint

**Response:**
```json
{
  "status": "healthy",
  "api_base_url": "https://...",
  "endpoints": {...}
}
```

### GET /api/recommendations/:user_id
Get recommendations for a user

**Query Parameters:**
- `limit` (optional): Number of recommendations (1-20, default: 5)
- `algorithm` (optional): 'collaborative' or 'category' (default: 'collaborative')

**Response:**
```json
{
  "user_id": "test-user-123",
  "user_context": {
    "cart_items_count": 2,
    "liked_items_count": 5
  },
  "recommendations": [
    {
      "product_id": "...",
      "name": "...",
      "price": 299.99,
      "category": "...",
      "description": "...",
      "image_url": "...",
      "sizes": []
    }
  ],
  "recommendation_count": 5,
  "algorithm_used": "collaborative"
}
```

## Troubleshooting

### DNS not resolving
```bash
# Check DNS propagation
nslookup aptest.prasklatechnology.com
dig aptest.prasklatechnology.com
```

### SSL certificate error
```bash
# Check certificate
sudo certbot certificates

# Renew certificate
sudo certbot renew --dry-run
```

### Service not starting
```bash
# Check logs
sudo journalctl -u ai-recommendation -n 50

# Check if port 5000 is in use
sudo lsof -i :5000

# Test manually
cd /home/ubuntu/ai
source venv/bin/activate
python app.py
```

### Nginx errors
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

## SSL Certificate Auto-Renewal

Let's Encrypt certificates expire after 90 days. Certbot automatically sets up renewal:

```bash
# Check renewal timer
sudo systemctl status certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

## Cost Optimization

The new API is much lighter:
- No GPU required
- Lower memory usage (~200MB vs ~2GB)
- Faster response times (<100ms vs ~2s)
- Can run on t2.micro (free tier)

## Next Steps

1. Monitor API performance in production
2. Add caching for frequently requested recommendations
3. Implement A/B testing for different algorithms
4. Add analytics to track recommendation effectiveness
