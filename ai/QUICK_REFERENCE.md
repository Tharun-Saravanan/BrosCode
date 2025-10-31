# Quick Reference Card

## 🎯 Current Status

✅ API Deployed & Running on EC2
⚠️ SSL Pending (waiting for DNS update)

## 🔧 To Complete (3 Steps)

### 1. Update DNS (5 min)
```
Domain: aptest.prasklatechnology.com
Change IP: 147.93.17.221 → 3.145.158.194
```

### 2. Check DNS (15-30 min wait)
```bash
./ai/check-dns.sh
```

### 3. Install SSL (2 min)
```bash
ssh -i ai/mykeypair.pem ubuntu@3.145.158.194
sudo certbot --nginx -d aptest.prasklatechnology.com \
  --non-interactive --agree-tos -m tharun.s@prasklatechnology.com --redirect
```

## 🧪 Test Commands

### Test API (works now)
```bash
ssh -i ai/mykeypair.pem ubuntu@3.145.158.194
curl http://localhost:5000/health
curl "http://localhost:5000/api/recommendations/test-user-123?limit=4"
```

### Test HTTPS (after DNS + SSL)
```bash
curl https://aptest.prasklatechnology.com/health
```

## 📊 Manage Service

```bash
# SSH to EC2
ssh -i ai/mykeypair.pem ubuntu@3.145.158.194

# Check status
sudo systemctl status ai-recommendation

# View logs
sudo journalctl -u ai-recommendation -f

# Restart
sudo systemctl restart ai-recommendation
```

## 🔄 Update API

```bash
# Upload new code
scp -i ai/mykeypair.pem ai/app_new.py ubuntu@3.145.158.194:~/ai/app.py

# Restart service
ssh -i ai/mykeypair.pem ubuntu@3.145.158.194
sudo systemctl restart ai-recommendation
```

## 📱 Frontend

Already configured in `.env`:
```bash
VITE_RECOMMENDATION_API_URL=https://aptest.prasklatechnology.com
```

After SSL is ready:
```bash
npm run build
# Deploy dist folder
```

## 📚 Full Docs

- `DEPLOYMENT_COMPLETE_SUMMARY.md` - Complete overview
- `ai/DEPLOYMENT_STATUS.md` - Detailed status
- `ai/DNS_UPDATE_GUIDE.md` - DNS instructions
- `ai/DEPLOYMENT_GUIDE.md` - Full guide

## ⚡ Quick Links

- EC2 IP: `3.145.158.194`
- Domain: `aptest.prasklatechnology.com`
- API Port: `5000`
- Email: `tharun.s@prasklatechnology.com`
