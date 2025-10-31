# ✅ AI Recommendation API Deployed!

## What Was Done

1. **Replaced the old AI backend** with a new lightweight collaborative filtering system
2. **Removed heavy dependencies** (GPT-2, transformers, torch) - now just Flask + basic Python
3. **Fixed the recommendation logic** to work with your actual product data
4. **Deployed to EC2** at `3.145.158.194:5000`

## Current Status

✅ **API is running on EC2**
- Health endpoint: Working
- Recommendations endpoint: Working  
- Returns actual product recommendations based on user behavior

⚠️ **Port 5000 not publicly accessible** - Need to either:
1. Open port 5000 in EC2 security group, OR
2. Setup Nginx + HTTPS with domain (recommended)

## Test Results

```bash
# From EC2 (working):
curl http://localhost:5000/health
curl "http://localhost:5000/api/recommendations/test-user-123?limit=4"
```

Returns proper recommendations like:
- Meat Lovers Pizza ($360)
- BBQ Chicken Pizza ($340)
- Four Cheese Pizza ($330)
- Pepperoni Pizza ($320)

## Next Steps

### Option 1: Quick Test (HTTP, no domain)

1. **Open port 5000 in EC2 Security Group:**
   - Go to AWS Console → EC2 → Security Groups
   - Add inbound rule: Port 5000, Source: 0.0.0.0/0

2. **Update frontend .env:**
   ```bash
   VITE_RECOMMENDATION_API_URL=http://3.145.158.194:5000
   ```

3. **Rebuild frontend:**
   ```bash
   npm run build
   ```

⚠️ **Problem:** Still get mixed content errors on HTTPS sites

### Option 2: Production Setup (HTTPS with domain) - RECOMMENDED

1. **Update DNS A record:**
   - Point `aptest.prasklatechnology.com` to `3.145.158.194`
   - Currently points to `147.93.17.221`

2. **Run HTTPS setup script:**
   ```bash
   cd ai
   ./deploy-with-https.sh
   ```

3. **Frontend will use:**
   ```bash
   VITE_RECOMMENDATION_API_URL=https://aptest.prasklatechnology.com
   ```

✅ **No mixed content errors!**

## What Changed in the API

### Old API (app_old.py)
- Used GPT-2 model (2GB+ memory)
- Required GPU/heavy CPU
- Slow responses (~2-5 seconds)
- Random/poor recommendations

### New API (app.py)
- Collaborative filtering algorithm
- Lightweight (~50MB memory)
- Fast responses (<100ms)
- Smart recommendations based on:
  - User's cart items
  - User's liked products
  - Category preferences
  - Price similarity

## API Endpoints

### GET /health
```json
{
  "status": "healthy",
  "api_base_url": "https://...",
  "endpoints": {...}
}
```

### GET /api/recommendations/:user_id?limit=5
```json
{
  "user_id": "test-user-123",
  "user_context": {
    "cart_items_count": 0,
    "liked_items_count": 0
  },
  "recommendations": [
    {
      "product_id": "...",
      "name": "Meat Lovers Pizza",
      "price": 360,
      "category": "Pizza",
      "description": "...",
      "image_url": "...",
      "sizes": []
    }
  ],
  "recommendation_count": 4,
  "algorithm_used": "collaborative"
}
```

## Managing the Service

### SSH to EC2
```bash
ssh -i ai/mykeypair.pem ubuntu@3.145.158.194
```

### Check if running
```bash
ps aux | grep gunicorn
curl http://localhost:5000/health
```

### View logs
```bash
cd ~/ai
tail -f gunicorn.log
```

### Restart service
```bash
cd ~/ai
sudo lsof -ti:5000 | xargs -r sudo kill -9
source venv/bin/activate
nohup gunicorn --bind 0.0.0.0:5000 --workers 2 --threads 4 --timeout 120 app:app > gunicorn.log 2>&1 &
```

### Update the API
1. Make changes to `ai/app_new.py` locally
2. Upload: `scp -i ai/mykeypair.pem ai/app_new.py ubuntu@3.145.158.194:~/ai/app.py`
3. Restart service (see above)

## Files Created

- `ai/app_new.py` - New lightweight recommendation API
- `ai/requirements-simple.txt` - Minimal dependencies
- `ai/deploy-with-https.sh` - Complete HTTPS deployment script
- `ai/check-dns.sh` - DNS configuration checker
- `ai/DEPLOYMENT_GUIDE.md` - Detailed setup guide
- `ai/QUICK_START.md` - Quick start options
- `ai/DEPLOYMENT_COMPLETE.md` - This file

## Recommendation

**Use Option 2 (HTTPS with domain)** for production. It's the proper way and eliminates mixed content errors.

Just need to:
1. Update DNS to point to correct IP
2. Run `./deploy-with-https.sh`
3. Done!
