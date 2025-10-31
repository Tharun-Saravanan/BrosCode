# Fixing Mixed Content Error

## What's the Problem?

Your site loads over HTTPS (`https://www.recommerceplugin.xyz`) but tries to fetch recommendations from HTTP (`http://3.145.158.194:5000`). Browsers block this for security (mixed content error).

## Quick Fix Applied

I've made two changes to stop the errors:

1. **Fixed AWS SDK middleware error** - Removed broken health checks in `src/config/aws.ts`
2. **Updated recommendation service** - Now reads from environment variable in `src/services/RecommendationService.ts`

## Current Status

The app will try to use HTTP for now (which will still be blocked by browsers). To actually fix this, you need HTTPS on your EC2.

## Permanent Solution: Set Up HTTPS

### Option 1: Use a Subdomain (Recommended)

1. **Create DNS A record** in your domain registrar:
   - Name: `api`
   - Type: A
   - Value: `3.145.158.194`
   - Result: `api.recommerceplugin.xyz` → your EC2

2. **Wait for DNS** (5-30 minutes for propagation)

3. **SSH to EC2 and run the setup script**:
   ```bash
   ssh -i ai/mykeypair.pem ubuntu@3.145.158.194
   cd ai
   
   # Edit the script first
   nano setup-https.sh
   # Change: DOMAIN="api.recommerceplugin.xyz"
   # Change: EMAIL="your-email@example.com"
   
   # Run it
   chmod +x setup-https.sh
   sudo ./setup-https.sh
   ```

4. **Update your .env file**:
   ```bash
   VITE_RECOMMENDATION_API_URL=https://api.recommerceplugin.xyz
   ```

5. **Rebuild and redeploy**:
   ```bash
   npm run build
   # Upload your dist folder to hosting
   ```

### Option 2: Use AWS API Gateway (Alternative)

If you don't want to manage SSL certificates:

1. Create an API Gateway in AWS
2. Point it to your EC2 instance
3. API Gateway provides HTTPS automatically
4. Update `.env` with the API Gateway URL

## Testing

After HTTPS is set up:

```bash
# Test the API
curl https://api.recommerceplugin.xyz/health
curl https://api.recommerceplugin.xyz/api/recommendations/test-user-123?limit=4

# Check your site - no more mixed content errors!
```

## Need Help?

See `ai/HTTPS_SETUP_GUIDE.md` for detailed instructions and troubleshooting.
