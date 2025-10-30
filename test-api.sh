#!/bin/bash

# API Integration Test Script
# Tests the deployed Lambda API endpoints

API_BASE_URL="https://wb16fax93g.execute-api.us-east-2.amazonaws.com/dev"

echo "🧪 Testing API Integration"
echo "=========================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test Products API
echo "📦 Testing Products API..."
echo "--------------------------"

# Test GET all products
echo -n "GET /products: "
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/products")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    PRODUCT_COUNT=$(echo "$RESPONSE" | head -n-1 | jq '.data | length' 2>/dev/null || echo "0")
    echo "  Found $PRODUCT_COUNT products"
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# Test Cart API
echo "🛒 Testing Cart API..."
echo "----------------------"

TEST_USER_ID="test-user-$(date +%s)"
echo "Using test user ID: $TEST_USER_ID"
echo ""

# Test GET cart (should be empty)
echo -n "GET /carts/$TEST_USER_ID: "
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/carts/$TEST_USER_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "  Empty cart retrieved"
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
fi

# Test POST add to cart
echo -n "POST /carts/$TEST_USER_ID (add item): "
CART_ITEM='{
  "productId": "test-product-123",
  "name": "Test Product",
  "price": 99.99,
  "imageUrl": "https://example.com/image.jpg",
  "size": "10",
  "quantity": 1,
  "category": "shoes"
}'
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "$CART_ITEM" \
  "$API_BASE_URL/carts/$TEST_USER_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    ITEM_COUNT=$(echo "$RESPONSE" | head -n-1 | jq '.data.items | length' 2>/dev/null || echo "0")
    echo "  Cart now has $ITEM_COUNT item(s)"
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$RESPONSE" | head -n-1
fi

# Test GET cart (should have 1 item)
echo -n "GET /carts/$TEST_USER_ID (verify): "
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/carts/$TEST_USER_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    ITEM_COUNT=$(echo "$RESPONSE" | head -n-1 | jq '.data.items | length' 2>/dev/null || echo "0")
    echo "  Cart has $ITEM_COUNT item(s)"
    ITEM_ID=$(echo "$RESPONSE" | head -n-1 | jq -r '.data.items[0].id' 2>/dev/null)
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
fi

# Test DELETE item from cart
if [ ! -z "$ITEM_ID" ] && [ "$ITEM_ID" != "null" ]; then
    echo -n "DELETE /carts/$TEST_USER_ID/items/$ITEM_ID: "
    RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
      "$API_BASE_URL/carts/$TEST_USER_ID/items/$ITEM_ID")
    HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Success${NC}"
        echo "  Item removed from cart"
    else
        echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    fi
fi

# Test DELETE clear cart
echo -n "DELETE /carts/$TEST_USER_ID (clear): "
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
  "$API_BASE_URL/carts/$TEST_USER_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "  Cart cleared"
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# Test Liked Products API
echo "❤️  Testing Liked Products API..."
echo "---------------------------------"

# Test GET liked products (should be empty)
echo -n "GET /liked/$TEST_USER_ID: "
RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/liked/$TEST_USER_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "  Empty liked list retrieved"
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
fi

# Test POST add liked product
echo -n "POST /liked/$TEST_USER_ID (add product): "
LIKED_ITEM='{
  "productId": "test-product-123",
  "productName": "Test Product"
}'
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Content-Type: application/json" \
  -d "$LIKED_ITEM" \
  "$API_BASE_URL/liked/$TEST_USER_ID")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    LIKED_COUNT=$(echo "$RESPONSE" | head -n-1 | jq '.data.products | length' 2>/dev/null || echo "0")
    echo "  Liked list has $LIKED_COUNT product(s)"
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
fi

# Test DELETE remove liked product
echo -n "DELETE /liked/$TEST_USER_ID/products/test-product-123: "
RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE \
  "$API_BASE_URL/liked/$TEST_USER_ID/products/test-product-123")
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "  Product removed from liked list"
else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""
echo "=========================="
echo -e "${GREEN}✓ API Integration Tests Complete${NC}"
echo ""
echo "💡 Tips:"
echo "  - Check AWS CloudWatch Logs for detailed backend logs"
echo "  - Use browser DevTools Network tab to monitor API calls"
echo "  - All cart and liked operations are user-specific"
echo ""
