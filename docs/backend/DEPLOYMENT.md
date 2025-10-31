# BrosCode Backend - Deployment Guide

## 📋 Prerequisites

1. **AWS Account**: You need an active AWS account
2. **AWS CLI**: Install and configure AWS CLI
3. **Node.js**: Version 18.x or later
4. **Serverless Framework**: Install globally

## 🔧 Setup Steps

### 1. Install Node.js Dependencies

```bash
cd backend
npm install
```

### 2. Configure AWS Credentials

If you haven't configured AWS CLI yet:

```bash
aws configure
```

Enter your AWS credentials:
- AWS Access Key ID: (from .env file or AWS Console)
- AWS Secret Access Key: (from .env file or AWS Console)
- Default region: us-east-2
- Default output format: json

### 3. Create DynamoDB Tables

Run the setup script to create the required DynamoDB tables:

```bash
npm run setup:tables
```

This will create:
- `sibilingshoe-products` - Product catalog
- `sibilingshoe-carts` - User shopping carts
- `sibilingshoe-liked` - User liked products

### 4. Deploy to AWS

#### Deploy to Development Environment

```bash
npm run deploy:dev
```

#### Deploy to Production Environment

```bash
npm run deploy:prod
```

After deployment, you'll see output like:

```
Service Information
service: broscode-backend
stage: dev
region: us-east-2
stack: broscode-backend-dev
api keys:
  None
endpoints:
  GET - https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/dev/products
  POST - https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/dev/products
  ... (all other endpoints)
```

**Save the base URL** (e.g., `https://xxxxxxxxxx.execute-api.us-east-2.amazonaws.com/dev`)

## 🧪 Testing the Deployment

### Test Products API

```bash
# Get all products
curl https://YOUR-API-URL/dev/products

# Create a product
curl -X POST https://YOUR-API-URL/dev/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nike Air Max",
    "price": 129.99,
    "description": "Comfortable running shoes",
    "category": "Sneakers",
    "sizes": ["8", "9", "10", "11"],
    "images": ["https://example.com/image.jpg"]
  }'
```

### Test Cart API

```bash
# Get user cart
curl https://YOUR-API-URL/dev/carts/user123

# Add to cart
curl -X POST https://YOUR-API-URL/dev/carts/user123 \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "123",
    "name": "Nike Air Max",
    "price": 129.99,
    "imageUrl": "https://example.com/image.jpg",
    "size": "10",
    "quantity": 1,
    "category": "Sneakers"
  }'
```

### Test Liked Products API

```bash
# Get liked products
curl https://YOUR-API-URL/dev/liked/user123

# Add to liked
curl -X POST https://YOUR-API-URL/dev/liked/user123 \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "123",
    "productName": "Nike Air Max"
  }'
```

## 🔄 Update Your Frontend

After deployment, update your frontend `.env` file:

```env
VITE_API_BASE_URL=https://YOUR-API-URL/dev
```

Then update your frontend services to use the new API URL.

## 📊 Monitor Your Deployment

### View CloudWatch Logs

```bash
serverless logs -f getAllProducts -t
```

### View All Functions

```bash
serverless info
```

### Remove Deployment

```bash
serverless remove
```

## 🐛 Troubleshooting

### Issue: "No such file or directory"
- Make sure you're in the `backend` directory
- Run `npm install` to install dependencies

### Issue: "Credentials not found"
- Run `aws configure` and enter your credentials
- Check that credentials are in `~/.aws/credentials`

### Issue: "Table already exists"
- This is normal if tables were created before
- The setup script will skip existing tables

### Issue: "Access Denied"
- Check your IAM user has appropriate permissions
- Required permissions: DynamoDB, Lambda, API Gateway, CloudFormation, S3, IAM

### Issue: "Serverless command not found"
- Install serverless globally: `npm install -g serverless`
- Or use npx: `npx serverless deploy`

## 🔐 Security Recommendations

While the APIs are currently public (no authentication), consider adding:

1. **API Keys**: Add API Gateway API keys for basic security
2. **AWS Cognito**: Integrate with existing Cognito for user authentication
3. **Rate Limiting**: Configure throttling in API Gateway
4. **WAF**: Add AWS WAF for additional protection

## 💰 Cost Estimation

With AWS Free Tier:
- **Lambda**: 1M requests/month free
- **DynamoDB**: 25GB storage, 25 RCU/WCU free
- **API Gateway**: 1M API calls/month free

After free tier, costs are minimal for small to medium traffic:
- Lambda: ~$0.20 per 1M requests
- DynamoDB: Pay-per-request pricing
- API Gateway: ~$3.50 per 1M requests

## 📈 Scaling Considerations

The serverless architecture automatically scales:
- Lambda functions scale automatically
- DynamoDB uses on-demand billing (auto-scaling)
- API Gateway handles high request volumes

For production:
- Monitor CloudWatch metrics
- Set up alarms for errors and throttling
- Consider DynamoDB reserved capacity for predictable workloads

## 🚀 Next Steps

1. Test all endpoints with Postman or cURL
2. Update frontend to use deployed API
3. Set up CI/CD pipeline (GitHub Actions, AWS CodePipeline)
4. Configure custom domain name
5. Add authentication and authorization
6. Set up monitoring and alerting
