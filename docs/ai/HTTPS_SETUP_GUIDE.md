# HTTPS Setup Guide for AI Recommendation API

## Problem
Your site runs on HTTPS but the AI API runs on HTTP, causing browsers to block requests (mixed content error).

## Recommended Solution: Nginx + Let's Encrypt

### Prerequisites
1. A subdomain pointing to your EC2 instance (e.g., `api.recommerceplugin.xyz`)
2. DNS A record: `api.recommerceplugin.xyz` → `3.145.158.194`
3. EC2 Security Group allows ports 80 and 443

### Setup Steps

1. **Configure DNS** (do this first, DNS takes time to propagate)
   ```
   Go to your domain registrar or Route53
   Add A record:
   - Name: api
   - Type: A
   - Value: 3.145.158.194
   - TTL: 300
   ```

2. **Update EC2 Security Group**
   ```
   Inbound Rules:
   - Port 80 (HTTP) - from 0.0.0.0/0
   - Port 443 (HTTPS) - from 0.0.0.0/0
   - Port 5000 - from localhost only (remove public access)
   ```

3. **SSH to EC2 and run setup**
   ```bash
   ssh -i mykeypair.pem ubuntu@3.145.158.194
   cd ai
   
   # Edit the script to set your domain and email
   nano setup-https.sh
   # Update: DOMAIN="api.recommerceplugin.xyz"
   # Update: EMAIL="your-email@example.com"
   
   # Make executable and run
   chmod +x setup-https.sh
   sudo ./setup-https.sh
   ```

4. **Test HTTPS endpoint**
   ```bash
   curl https://api.recommerceplugin.xyz/health
   ```

5. **Update frontend code**
   ```typescript
   // In src/services/recommendationService.ts
   const RECO_BASE_URL = 'https://api.recommerceplugin.xyz';
   ```

6. **Rebuild and deploy frontend**
   ```bash
   npm run build
   # Deploy your dist folder
   ```

## Alternative: Temporary HTTP Workaround (NOT RECOMMENDED)

If you need a quick test and can't set up HTTPS immediately:

1. **Use HTTP version of your site** (not HTTPS)
   - Access via `http://www.recommerceplugin.xyz` instead
   - This is insecure and only for testing

2. **Or use a CORS proxy** (also not recommended for production)
   ```typescript
   const RECO_BASE_URL = 'https://cors-anywhere.herokuapp.com/http://3.145.158.194:5000';
   ```

## SSL Certificate Auto-Renewal

Let's Encrypt certificates expire after 90 days. Certbot automatically sets up a renewal timer:

```bash
# Check renewal timer status
sudo systemctl status certbot.timer

# Test renewal (dry run)
sudo certbot renew --dry-run
```

## Troubleshooting

**DNS not resolving?**
```bash
# Check DNS propagation
nslookup api.recommerceplugin.xyz
dig api.recommerceplugin.xyz
```

**Certificate error?**
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify certificate
sudo certbot certificates
```

**API not responding?**
```bash
# Check if Flask app is running
docker ps
docker-compose logs -f

# Test locally on EC2
curl http://localhost:5000/health
```
