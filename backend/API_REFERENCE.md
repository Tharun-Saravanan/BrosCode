# API Reference

Complete API documentation for BrosCode Backend.

## Base URL

```
https://{api-id}.execute-api.us-east-2.amazonaws.com/{stage}
```

Replace `{api-id}` with your API Gateway ID and `{stage}` with `dev` or `prod`.

## Response Format

All responses follow this format:

### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "message": "Error message",
  "error": "Detailed error (optional)"
}
```

---

## 📦 Products API

### Get All Products

**GET** `/products`

Returns all products in the catalog.

**Response:** `200 OK`
```json
{
  "message": "Products retrieved successfully",
  "data": [
    {
      "products_id": "uuid",
      "name": "Nike Air Max",
      "price": 129.99,
      "description": "Comfortable running shoes",
      "category": "Sneakers",
      "sizes": ["8", "9", "10", "11"],
      "images": ["https://..."],
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### Get Product by ID

**GET** `/products/{id}`

Get details of a specific product.

**Parameters:**
- `id` (path) - Product ID

**Response:** `200 OK`
```json
{
  "message": "Product retrieved successfully",
  "data": {
    "products_id": "uuid",
    "name": "Nike Air Max",
    "price": 129.99,
    "description": "Comfortable running shoes",
    "category": "Sneakers",
    "sizes": ["8", "9", "10", "11"],
    "images": ["https://..."],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response:** `404 Not Found`
```json
{
  "message": "Product not found"
}
```

---

### Get Products by Category

**GET** `/products/category/{category}`

Get all products in a specific category.

**Parameters:**
- `category` (path) - Category name (Sneakers, Boots, Sandals, etc.)

**Response:** `200 OK`
```json
{
  "message": "Products retrieved successfully",
  "data": [...]
}
```

---

### Create Product

**POST** `/products`

Create a new product.

**Request Body:**
```json
{
  "name": "Nike Air Max",
  "price": 129.99,
  "description": "Comfortable running shoes",
  "category": "Sneakers",
  "sizes": ["8", "9", "10", "11"],
  "images": ["https://example.com/image.jpg"]
}
```

**Required Fields:**
- `name` (string)
- `price` (number)
- `description` (string)
- `category` (string)
- `sizes` (array of strings)

**Optional Fields:**
- `images` (array of strings)
- `imageKeys` (array of strings)

**Response:** `201 Created`
```json
{
  "message": "Product created successfully",
  "data": {
    "products_id": "generated-uuid",
    "name": "Nike Air Max",
    "price": 129.99,
    ...
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "message": "Missing required fields: name, price"
}
```

---

### Update Product

**PUT** `/products/{id}`

Update an existing product.

**Parameters:**
- `id` (path) - Product ID

**Request Body:**
```json
{
  "price": 139.99,
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "message": "Product updated successfully",
  "data": { ... }
}
```

**Error Response:** `404 Not Found`
```json
{
  "message": "Product not found"
}
```

---

### Delete Product

**DELETE** `/products/{id}`

Delete a product.

**Parameters:**
- `id` (path) - Product ID

**Response:** `200 OK`
```json
{
  "message": "Product deleted successfully",
  "data": {
    "productId": "uuid"
  }
}
```

---

## 🛒 Cart API

### Get Cart

**GET** `/carts/{userId}`

Get user's shopping cart.

**Parameters:**
- `userId` (path) - User ID

**Response:** `200 OK`
```json
{
  "message": "Cart retrieved successfully",
  "data": {
    "userId": "user123",
    "items": [
      {
        "id": "cart-item-id",
        "productId": "product-id",
        "name": "Nike Air Max",
        "price": 129.99,
        "imageUrl": "https://...",
        "size": "10",
        "quantity": 2,
        "category": "Sneakers"
      }
    ],
    "totalItems": 2,
    "totalPrice": 259.98,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Empty Cart Response:**
```json
{
  "message": "Cart is empty",
  "data": {
    "userId": "user123",
    "items": [],
    "totalItems": 0,
    "totalPrice": 0
  }
}
```

---

### Add to Cart

**POST** `/carts/{userId}`

Add an item to the cart.

**Parameters:**
- `userId` (path) - User ID

**Request Body:**
```json
{
  "productId": "product-123",
  "name": "Nike Air Max",
  "price": 129.99,
  "imageUrl": "https://example.com/image.jpg",
  "size": "10",
  "quantity": 1,
  "category": "Sneakers"
}
```

**Required Fields:**
- `productId` (string)
- `name` (string)
- `price` (number)
- `imageUrl` (string)
- `size` (string)
- `category` (string)

**Optional Fields:**
- `quantity` (number, default: 1)

**Response:** `200 OK`
```json
{
  "message": "Item added to cart successfully",
  "data": { ... }
}
```

**Note:** If the same product with the same size already exists in the cart, the quantity will be incremented.

---

### Update Cart

**PUT** `/carts/{userId}`

Update cart item quantity or replace entire cart.

**Parameters:**
- `userId` (path) - User ID

**Option 1: Update specific item quantity**
```json
{
  "itemId": "cart-item-id",
  "quantity": 3
}
```

**Option 2: Replace entire cart**
```json
{
  "items": [
    {
      "id": "cart-item-id",
      "productId": "product-id",
      "name": "Nike Air Max",
      "price": 129.99,
      "imageUrl": "https://...",
      "size": "10",
      "quantity": 2,
      "category": "Sneakers"
    }
  ]
}
```

**Response:** `200 OK`
```json
{
  "message": "Cart updated successfully",
  "data": { ... }
}
```

**Note:** Setting quantity to 0 will remove the item from cart.

---

### Remove from Cart

**DELETE** `/carts/{userId}/items/{itemId}`

Remove a specific item from cart.

**Parameters:**
- `userId` (path) - User ID
- `itemId` (path) - Cart item ID

**Response:** `200 OK`
```json
{
  "message": "Item removed from cart successfully",
  "data": { ... }
}
```

---

### Clear Cart

**DELETE** `/carts/{userId}`

Remove all items from cart.

**Parameters:**
- `userId` (path) - User ID

**Response:** `200 OK`
```json
{
  "message": "Cart cleared successfully",
  "data": {
    "userId": "user123"
  }
}
```

---

## ❤️ Liked Products API

### Get Liked Products

**GET** `/liked/{userId}`

Get user's liked products list.

**Parameters:**
- `userId` (path) - User ID

**Response:** `200 OK`
```json
{
  "message": "Liked products retrieved successfully",
  "data": {
    "userId": "user123",
    "products": [
      {
        "productId": "product-123",
        "productName": "Nike Air Max",
        "addedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "totalLiked": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Empty Liked List:**
```json
{
  "message": "No liked products found",
  "data": {
    "userId": "user123",
    "products": [],
    "totalLiked": 0
  }
}
```

---

### Add Liked Product

**POST** `/liked/{userId}`

Add a product to liked list.

**Parameters:**
- `userId` (path) - User ID

**Request Body:**
```json
{
  "productId": "product-123",
  "productName": "Nike Air Max"
}
```

**Required Fields:**
- `productId` (string)
- `productName` (string)

**Response:** `200 OK`
```json
{
  "message": "Product added to liked list successfully",
  "data": { ... }
}
```

**Error Response:** `409 Conflict`
```json
{
  "message": "Product already in liked list"
}
```

---

### Remove Liked Product

**DELETE** `/liked/{userId}/products/{productId}`

Remove a product from liked list.

**Parameters:**
- `userId` (path) - User ID
- `productId` (path) - Product ID

**Response:** `200 OK`
```json
{
  "message": "Product removed from liked list successfully",
  "data": { ... }
}
```

---

### Clear Liked Products

**DELETE** `/liked/{userId}`

Remove all products from liked list.

**Parameters:**
- `userId` (path) - User ID

**Response:** `200 OK`
```json
{
  "message": "Liked products cleared successfully",
  "data": {
    "userId": "user123"
  }
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request - Invalid input |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 500 | Internal Server Error |

---

## CORS Headers

All endpoints return these CORS headers:

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Credentials: false
Access-Control-Allow-Headers: Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
```

This allows public access from any domain.

---

## Rate Limiting

Currently no rate limiting is enforced. For production, consider adding:
- API Gateway throttling
- DynamoDB provisioned capacity
- CloudWatch alarms

---

## Examples

### cURL Examples

```bash
# Get all products
curl https://YOUR-API/dev/products

# Create product
curl -X POST https://YOUR-API/dev/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Shoe","price":99.99,"description":"Great shoe","category":"Sneakers","sizes":["8","9"]}'

# Add to cart
curl -X POST https://YOUR-API/dev/carts/user123 \
  -H "Content-Type: application/json" \
  -d '{"productId":"123","name":"Shoe","price":99.99,"imageUrl":"url","size":"10","category":"Sneakers"}'

# Add to liked
curl -X POST https://YOUR-API/dev/liked/user123 \
  -H "Content-Type: application/json" \
  -d '{"productId":"123","productName":"Shoe"}'
```

### JavaScript/Fetch Examples

```javascript
// Get all products
const products = await fetch('https://YOUR-API/dev/products')
  .then(res => res.json());

// Create product
const newProduct = await fetch('https://YOUR-API/dev/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Nike Air Max',
    price: 129.99,
    description: 'Great shoes',
    category: 'Sneakers',
    sizes: ['8', '9', '10']
  })
}).then(res => res.json());

// Add to cart
const cart = await fetch('https://YOUR-API/dev/carts/user123', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    productId: '123',
    name: 'Nike Air Max',
    price: 129.99,
    imageUrl: 'https://...',
    size: '10',
    quantity: 1,
    category: 'Sneakers'
  })
}).then(res => res.json());
```
