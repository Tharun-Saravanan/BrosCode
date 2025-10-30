# API Integration Guide

## Overview

The application has been updated to use the deployed AWS Lambda API endpoints instead of direct DynamoDB connections. This provides:

- **User-specific data**: Cart and liked items are now stored per user ID
- **Better security**: API handles authentication and authorization
- **Scalability**: Backend can be scaled independently
- **Consistent data access**: Single source of truth through the API

## Architecture Changes

### Before
```
Frontend → DynamoDB Client → DynamoDB Tables
```

### After
```
Frontend → API Gateway → Lambda Functions → DynamoDB Tables
```

## API Endpoints

Your deployed API base URL:
```
https://wb16fax93g.execute-api.us-east-2.amazonaws.com/dev
```

### Products API
- `GET /products` - Get all products
- `GET /products/{id}` - Get product by ID
- `GET /products/category/{category}` - Get products by category
- `POST /products` - Create product (admin)
- `PUT /products/{id}` - Update product (admin)
- `DELETE /products/{id}` - Delete product (admin)

### Cart API (User-specific)
- `GET /carts/{userId}` - Get user's cart
- `POST /carts/{userId}` - Add item to cart
- `PUT /carts/{userId}` - Update cart item quantity
- `DELETE /carts/{userId}/items/{itemId}` - Remove item from cart
- `DELETE /carts/{userId}` - Clear cart

### Liked Products API (User-specific)
- `GET /liked/{userId}` - Get user's liked products
- `POST /liked/{userId}` - Add product to liked list
- `DELETE /liked/{userId}/products/{productId}` - Remove from liked list
- `DELETE /liked/{userId}` - Clear all liked products

## New Services

### 1. ApiClient (`src/services/apiClient.ts`)
Base HTTP client for making API requests with:
- Automatic authentication header injection
- Consistent error handling
- Response parsing

### 2. ApiProductService (`src/services/apiProductService.ts`)
Handles all product-related API calls:
```typescript
import { ApiProductService } from './services/apiProductService';

// Get all products
const products = await ApiProductService.getAllProducts();

// Get product by ID
const product = await ApiProductService.getProductById('product-123');

// Get products by category
const shoes = await ApiProductService.getProductsByCategory('shoes');
```

### 3. ApiCartService (`src/services/apiCartService.ts`)
Manages user-specific cart operations:
```typescript
import { ApiCartService } from './services/apiCartService';

// Get user's cart
const cartItems = await ApiCartService.getUserCart(userId);

// Add item to cart
await ApiCartService.addToCart(userId, {
  productId: 'product-123',
  name: 'Nike Shoes',
  price: 99.99,
  imageUrl: '...',
  size: '10',
  quantity: 1,
  category: 'shoes'
});

// Update item quantity
await ApiCartService.updateCartItem(userId, itemId, 2);

// Remove item
await ApiCartService.removeFromCart(userId, itemId);

// Clear cart
await ApiCartService.clearCart(userId);
```

### 4. ApiLikedService (`src/services/apiLikedService.ts`)
Manages user-specific liked products:
```typescript
import { ApiLikedService } from './services/apiLikedService';

// Get liked products
const liked = await ApiLikedService.getLikedProducts(userId);

// Add to liked list
await ApiLikedService.addLikedProduct(userId, 'product-123', 'Nike Shoes');

// Remove from liked list
await ApiLikedService.removeLikedProduct(userId, 'product-123');

// Check if product is liked
const isLiked = await ApiLikedService.isProductLiked(userId, 'product-123');
```

## Updated Services

### ProductService
Now uses `ApiProductService` instead of `DynamoProductService`:
- Fetches from API first
- Falls back to localStorage when offline
- Caches responses for better performance

### CartService
Updated to use `ApiCartService`:
- Syncs cart to API when user is authenticated
- Maintains localStorage for guest users
- Automatically merges guest cart when user logs in

## User Authentication Flow

### 1. Guest User
```
User browses → Cart stored in localStorage (key: 'sibiling_shoes_guest_cart')
```

### 2. User Signs In
```
User signs in → Cognito provides userId
→ Cart fetched from API (/carts/{userId})
→ Guest cart merged with user cart
→ Synced to API
→ Guest cart cleared
```

### 3. Authenticated User
```
All cart/liked operations → API with userId
→ Also cached in localStorage (key: 'sibiling_shoes_user_cart_{userId}')
```

### 4. User Signs Out
```
User cart → Transferred to guest storage
→ User-specific storage cleared
```

## Environment Configuration

Create a `.env` file (copy from `.env.example`):

```bash
# API Configuration
VITE_API_BASE_URL=https://wb16fax93g.execute-api.us-east-2.amazonaws.com/dev

# AWS Cognito (for authentication)
VITE_AWS_REGION=us-east-2
VITE_AWS_USER_POOL_ID=us-east-2_YNAdCDe2j
VITE_AWS_USER_POOL_CLIENT_ID=32vbughavo7m26avsop9rhuf94
```

## Data Storage Strategy

### Cart Data
1. **API (Primary)**: User-specific cart stored in DynamoDB via API
2. **localStorage (Fallback)**: 
   - Guest: `sibiling_shoes_guest_cart`
   - User: `sibiling_shoes_user_cart_{userId}`

### Liked Products
1. **API (Primary)**: User-specific liked list in DynamoDB via API
2. **localStorage (Future)**: Can be added for offline support

### Products
1. **API (Primary)**: Always fresh data from DynamoDB
2. **localStorage (Cache)**: `temp_products` for offline browsing

## Benefits of This Architecture

### 1. User-Specific Data
- Each user has their own cart and liked items
- Data persists across devices when logged in
- Guest users still have full functionality

### 2. Security
- No direct DynamoDB access from frontend
- API handles authentication and authorization
- Sensitive operations protected by Lambda

### 3. Performance
- localStorage provides instant UI updates
- API syncs in background
- Offline support with cached data

### 4. Scalability
- Backend can be scaled independently
- API rate limiting and throttling
- CloudWatch monitoring and logging

## Testing

### Test Cart Functionality
1. Browse as guest → Add items to cart
2. Sign in → Cart should merge
3. Add more items → Should sync to API
4. Sign out → Cart preserved as guest
5. Sign in again → Cart restored from API

### Test User Isolation
1. Create User A → Add items to cart
2. Sign out
3. Create User B → Add different items
4. Sign in as User A → Should only see User A's items

## Migration Notes

### Existing Users
- Old DynamoDB client code still exists but is not used
- Can be removed in future cleanup
- No breaking changes to existing functionality

### Data Migration
- Existing localStorage data will be automatically synced to API on next login
- No manual migration needed

## Troubleshooting

### Cart not syncing
1. Check console for API errors
2. Verify userId is available (user is logged in)
3. Check network tab for API calls
4. Verify API endpoint in `.env`

### Authentication issues
1. Check Cognito configuration
2. Verify user pool and client IDs
3. Check token expiry
4. Clear localStorage and try again

### API errors
1. Check CloudWatch logs in AWS Console
2. Verify DynamoDB table permissions
3. Check API Gateway configuration
4. Ensure Lambda functions are deployed

## Next Steps

1. ✅ Copy `.env.example` to `.env`
2. ✅ Configure API endpoint
3. ✅ Test guest cart functionality
4. ✅ Test user authentication
5. ✅ Test cart persistence across login/logout
6. ✅ Test liked products (if implemented in UI)
7. ✅ Monitor API usage in AWS Console

## Support

For issues or questions:
1. Check console logs for errors
2. Review CloudWatch logs for backend issues
3. Verify environment configuration
4. Test API endpoints directly using Postman/curl
