# BrosCode Backend - Serverless API

A serverless backend built with AWS Lambda, API Gateway, and DynamoDB for the BrosCode e-commerce application.

## 🚀 Features

- **Serverless Architecture**: Built with AWS Lambda and API Gateway
- **TypeScript**: Type-safe code with full TypeScript support
- **DynamoDB**: NoSQL database for products, carts, and liked items
- **CORS Enabled**: All APIs are publicly accessible from anywhere
- **RESTful APIs**: Complete CRUD operations for all resources

## 📋 Prerequisites

- Node.js 18.x or later
- AWS CLI configured with appropriate credentials
- Serverless Framework CLI (`npm install -g serverless`)

## 🛠️ Installation

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Configure AWS credentials (if not already done):
```bash
aws configure
```

## 📊 DynamoDB Tables

The backend uses three DynamoDB tables:

1. **sibilingshoe-products** - Product catalog
   - Primary Key: `products_id` (String)

2. **sibilingshoe-carts** - User shopping carts
   - Primary Key: `userId` (String)

3. **sibilingshoe-liked** - User liked products
   - Primary Key: `userId` (String)

### Setup Tables

Run the setup script to create the required tables:

```bash
npm run setup:tables
```

## 🚀 Deployment

### Deploy to AWS

Deploy to development:
```bash
npm run deploy:dev
```

Deploy to production:
```bash
npm run deploy:prod
```

Deploy with default stage:
```bash
npm run deploy
```

### Local Development

Run the API locally with serverless-offline:
```bash
npm run local
```

The API will be available at `http://localhost:3000`

## 📚 API Endpoints

### Products

- **GET** `/products` - Get all products
- **GET** `/products/{id}` - Get a specific product
- **GET** `/products/category/{category}` - Get products by category
- **POST** `/products` - Create a new product
- **PUT** `/products/{id}` - Update a product
- **DELETE** `/products/{id}` - Delete a product

### Carts

- **GET** `/carts/{userId}` - Get user's cart
- **POST** `/carts/{userId}` - Add item to cart
- **PUT** `/carts/{userId}` - Update cart
- **DELETE** `/carts/{userId}/items/{itemId}` - Remove item from cart
- **DELETE** `/carts/{userId}` - Clear cart

### Liked Products

- **GET** `/liked/{userId}` - Get user's liked products
- **POST** `/liked/{userId}` - Add product to liked list
- **DELETE** `/liked/{userId}/products/{productId}` - Remove product from liked list
- **DELETE** `/liked/{userId}` - Clear all liked products

## 📖 API Documentation

### Product API Examples

#### Create Product
```bash
POST /products
{
  "name": "Nike Air Max",
  "price": 129.99,
  "description": "Comfortable running shoes",
  "category": "Sneakers",
  "sizes": ["8", "9", "10", "11"],
  "images": ["https://example.com/image.jpg"]
}
```

#### Get All Products
```bash
GET /products
```

### Cart API Examples

#### Add to Cart
```bash
POST /carts/{userId}
{
  "productId": "123",
  "name": "Nike Air Max",
  "price": 129.99,
  "imageUrl": "https://example.com/image.jpg",
  "size": "10",
  "quantity": 1,
  "category": "Sneakers"
}
```

#### Update Cart Item Quantity
```bash
PUT /carts/{userId}
{
  "itemId": "cart-item-id",
  "quantity": 3
}
```

### Liked Products API Examples

#### Add to Liked
```bash
POST /liked/{userId}
{
  "productId": "123",
  "productName": "Nike Air Max"
}
```

## 🔧 Environment Variables

Set these in `serverless.yml` or via AWS Systems Manager:

- `PRODUCTS_TABLE` - Products table name (default: sibilingshoe-products)
- `CARTS_TABLE` - Carts table name (default: sibilingshoe-carts)
- `LIKED_TABLE` - Liked products table name (default: sibilingshoe-liked)
- `REGION` - AWS region (default: us-east-2)

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── dynamodb.ts       # DynamoDB client configuration
│   ├── handlers/
│   │   ├── products/         # Product Lambda handlers
│   │   ├── carts/            # Cart Lambda handlers
│   │   └── liked/            # Liked products Lambda handlers
│   ├── types/
│   │   └── index.ts          # TypeScript type definitions
│   └── utils/
│       └── response.ts       # Response helpers
├── scripts/
│   └── setupTables.ts        # DynamoDB table setup script
├── package.json
├── serverless.yml            # Serverless Framework configuration
└── tsconfig.json             # TypeScript configuration
```

## 🔒 Security

- All APIs have CORS enabled with `Access-Control-Allow-Origin: *`
- No authentication required (all endpoints are public)
- IAM roles are automatically created for Lambda functions
- DynamoDB access is restricted to Lambda functions only

## 🧪 Testing

Build the TypeScript code:
```bash
npm run build
```

## 📝 Notes

- All APIs return JSON responses
- Error responses include descriptive messages
- Cart totals are automatically calculated
- Timestamps are automatically managed (createdAt, updatedAt)
- All IDs are UUID v4

## 🤝 Integration with Frontend

Update your frontend environment variables with the deployed API Gateway URL:

```env
VITE_API_BASE_URL=https://<api-id>.execute-api.us-east-2.amazonaws.com/dev
```

## 📄 License

MIT
