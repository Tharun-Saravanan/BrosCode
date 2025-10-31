# 🚀 Quick Start Guide

Get your BrosCode backend up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- AWS account with credentials configured

## Step 1: Install Dependencies

```bash
cd backend
npm install
```

## Step 2: Setup DynamoDB Tables

```bash
npm run setup:tables
```

This creates three tables:
- ✅ sibilingshoe-products
- ✅ sibilingshoe-carts
- ✅ sibilingshoe-liked

## Step 3: Test Locally (Optional)

```bash
npm run local
```

Your API will be available at `http://localhost:3000`

Test it:
```bash
curl http://localhost:3000/dev/products
```

## Step 4: Deploy to AWS

```bash
npm run deploy:dev
```

After deployment completes, you'll see your API endpoints:

```
endpoints:
  GET - https://xxxxx.execute-api.us-east-2.amazonaws.com/dev/products
  POST - https://xxxxx.execute-api.us-east-2.amazonaws.com/dev/products
  ...
```

## Step 5: Test Your Deployment

Copy your API base URL and test:

```bash
# Replace YOUR-API-URL with your actual URL
curl https://YOUR-API-URL/dev/products
```

## Step 6: Update Frontend

Update your frontend `.env`:

```env
VITE_API_BASE_URL=https://YOUR-API-URL/dev
```

## 🎉 Done!

Your serverless backend is live and ready to use!

### Next Steps:

1. Import `postman-collection.json` into Postman for easy testing
2. Read `README.md` for full API documentation
3. Check `DEPLOYMENT.md` for advanced deployment options

### Need Help?

- Check logs: `serverless logs -f getAllProducts -t`
- View all endpoints: `serverless info`
- Remove deployment: `serverless remove`
