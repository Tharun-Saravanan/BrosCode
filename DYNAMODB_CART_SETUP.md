# DynamoDB Cart Table Setup

This document explains how to set up the DynamoDB table for user-specific cart storage.

## Table Configuration

**Table Name:** `ShoesUserCarts`

**Primary Key:**
- **Partition Key:** `userId` (String) - The user's Cognito ID
- **Sort Key:** `cartType` (String) - Always "active" for current cart

**Attributes:**
- `userId` (String) - User ID from AWS Cognito
- `cartType` (String) - "active" for current cart (allows future expansion)
- `items` (List) - Array of cart items
- `totalItems` (Number) - Total quantity of items in cart
- `totalPrice` (Number) - Total price of all items
- `createdAt` (String) - ISO timestamp when cart was created
- `updatedAt` (String) - ISO timestamp when cart was last modified
- `expiresAt` (Number) - Unix timestamp for TTL (30 days from last update)

## Manual Setup via AWS Console

1. **Go to DynamoDB Console:**
   - Open AWS Console → DynamoDB → Tables

2. **Create Table:**
   - Click "Create table"
   - Table name: `ShoesUserCarts`
   - Partition key: `userId` (String)
   - Sort key: `cartType` (String)
   - Use default settings for other options
   - Click "Create table"

3. **Enable TTL (Optional):**
   - Go to table → "Additional settings" tab
   - Click "Manage TTL"
   - TTL attribute: `expiresAt`
   - Enable TTL

## Automated Setup via AWS CLI

```bash
# Create the table
aws dynamodb create-table \
    --table-name ShoesUserCarts \
    --attribute-definitions \
        AttributeName=userId,AttributeType=S \
        AttributeName=cartType,AttributeType=S \
    --key-schema \
        AttributeName=userId,KeyType=HASH \
        AttributeName=cartType,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST \
    --region us-east-2

# Enable TTL (optional)
aws dynamodb update-time-to-live \
    --table-name ShoesUserCarts \
    --time-to-live-specification \
        Enabled=true,AttributeName=expiresAt \
    --region us-east-2
```

## Environment Variables

Add to your `.env` file:

```env
VITE_DYNAMODB_CART_TABLE_NAME=ShoesUserCarts
```

## Data Structure Example

```json
{
  "userId": "us-east-2:12345678-1234-1234-1234-123456789012",
  "cartType": "active",
  "items": [
    {
      "id": "product123_size42",
      "productId": "product123",
      "name": "Nike Air Max",
      "price": 120.00,
      "imageUrl": "https://...",
      "size": "42",
      "quantity": 2,
      "category": "SHOES"
    }
  ],
  "totalItems": 2,
  "totalPrice": 240.00,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T11:45:00.000Z",
  "expiresAt": 1708012800
}
```

## Features

✅ **User-Specific Storage:** Each user has their own cart data
✅ **Cross-Device Sync:** Cart syncs across all user's devices
✅ **Fallback Support:** Falls back to localStorage if DynamoDB unavailable
✅ **Automatic Cleanup:** TTL removes old carts after 30 days
✅ **Cost Efficient:** Pay-per-request billing
✅ **Fast Performance:** Single-digit millisecond latency

## Testing

After creating the table, test the integration:

1. **Start the application:** `npm run dev`
2. **Add items to cart as guest** (stored in localStorage)
3. **Sign in** (cart should merge with user's DynamoDB cart)
4. **Check AWS Console** to see the cart data in DynamoDB
5. **Sign out and back in** (cart should persist)

## Troubleshooting

**Table not found:**
- Verify table name matches `VITE_DYNAMODB_CART_TABLE_NAME`
- Check AWS region matches your configuration

**Permission denied:**
- Ensure Cognito Identity Pool has DynamoDB permissions
- Check IAM roles attached to the identity pool

**Fallback to localStorage:**
- Check browser console for DynamoDB errors
- Verify AWS credentials and network connectivity
- Application will continue working with localStorage only

## Cost Estimation

For a typical e-commerce site:
- **Reads:** ~10 per user session = $0.000125 per 1000 reads
- **Writes:** ~5 per user session = $0.00125 per 1000 writes
- **Storage:** ~1KB per cart = $0.25 per GB per month

**Example:** 1000 active users/month ≈ $0.50/month
