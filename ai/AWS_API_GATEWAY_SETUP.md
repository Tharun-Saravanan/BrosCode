# AWS API Gateway Setup for HTTPS

If you prefer AWS-managed HTTPS instead of managing Nginx/SSL yourself:

## Steps

1. **Create API Gateway**
   - Go to AWS API Gateway console
   - Create new "HTTP API"
   - Name: `ai-recommendation-api`

2. **Add Integration**
   - Type: HTTP proxy
   - URL: `http://3.145.158.194:5000/{proxy}`
   - Method: ANY

3. **Configure Routes**
   - Route: `/{proxy+}`
   - Integration: Your HTTP proxy integration

4. **Deploy**
   - Create stage: `prod`
   - Deploy API

5. **Get Your HTTPS URL**
   - Format: `https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/prod`
   - Use this in your frontend

6. **Optional: Custom Domain**
   - Add custom domain in API Gateway
   - Point `api.recommerceplugin.xyz` to it
   - Update Route53 DNS

## Pros
- AWS-managed SSL certificates
- Auto-scaling
- No server maintenance

## Cons
- Additional AWS costs (~$1/month + $3.50 per million requests)
- More complex setup
