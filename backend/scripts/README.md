# Backend Scripts

## Add Food Products

This script adds 50 food products to the DynamoDB products table.

### Usage

```bash
cd backend
npm run add:food-products
```

### What it does

- Adds 50 diverse food products including:
  - Pizzas (various types)
  - Burgers (beef, chicken, veggie, fish, etc.)
  - Fries (regular, curly, sweet potato, loaded, etc.)
  - Buns (cinnamon, chocolate, cream cheese, etc.)
  - Sandwiches (club, BLT, grilled chicken, etc.)
  - Popcorn (butter, caramel, cheese, etc.)

- Each product includes:
  - Unique product ID
  - Name
  - Price (in ₹)
  - Description
  - Category
  - Image URL
  - Timestamps

### Requirements

- AWS credentials configured in `.env`
- DynamoDB table created (`sibilingshoe-products`)
- Node.js and npm installed
