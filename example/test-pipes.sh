#!/bin/bash

# Test script to demonstrate all pipes in the OrdersController
# This will generate requests that showcase the request tracing feature

BASE_URL="http://localhost:3001"

echo "🧪 Testing OrdersController Pipes"
echo "=================================="
echo ""

# Test 1: POST /orders with ValidationPipe, SanitizeInputPipe, and TransformOrderDtoPipe
echo "1️⃣  Testing POST /orders (ValidationPipe + SanitizeInputPipe + TransformOrderDtoPipe)"
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "  CUST-001  ",
    "items": [
      {
        "productId": "  PROD-123  ",
        "quantity": "2",
        "price": "29.99"
      },
      {
        "productId": "PROD-456",
        "quantity": 1,
        "price": 49.99
      }
    ],
    "paymentMethod": "  CREDIT_CARD  "
  }' \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Test 2: GET /orders with ParseQueryParamsPipe
echo "2️⃣  Testing GET /orders (ParseQueryParamsPipe with pagination)"
curl -X GET "$BASE_URL/orders?page=1&limit=5&sortBy=createdAt&sortOrder=desc" \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Test 3: GET /orders with status filter
echo "3️⃣  Testing GET /orders (ParseQueryParamsPipe with status filter)"
curl -X GET "$BASE_URL/orders?status=pending&page=1&limit=10" \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Test 4: GET /orders/stats with DefaultValuePipe and ParseIntPipe
echo "4️⃣  Testing GET /orders/stats (DefaultValuePipe + ParseIntPipe)"
curl -X GET "$BASE_URL/orders/stats" \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Test 5: GET /orders/stats with custom days parameter
echo "5️⃣  Testing GET /orders/stats?days=7 (ParseIntPipe)"
curl -X GET "$BASE_URL/orders/stats?days=7" \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Test 6: GET /orders/:id with ParseOrderIdPipe
echo "6️⃣  Testing GET /orders/:id (ParseOrderIdPipe)"
curl -X GET "$BASE_URL/orders/ORD-00001" \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Test 7: PATCH /orders/:id with ValidationPipe and SanitizeInputPipe
echo "7️⃣  Testing PATCH /orders/:id (ValidationPipe + SanitizeInputPipe)"
curl -X PATCH "$BASE_URL/orders/ORD-00001" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing",
    "trackingNumber": "  TRACK-12345  "
  }' \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Test 8: POST /orders with validation error (to test ValidationPipe error handling)
echo "8️⃣  Testing POST /orders with validation error (ValidationPipe)"
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "",
    "items": [],
    "paymentMethod": ""
  }' \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Test 9: GET /orders with invalid query params (to test ParseQueryParamsPipe error handling)
echo "9️⃣  Testing GET /orders with invalid params (ParseQueryParamsPipe)"
curl -X GET "$BASE_URL/orders?page=invalid&limit=200" \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Test 10: GET /orders/stats with invalid days (to test ParseIntPipe error handling)
echo "🔟 Testing GET /orders/stats with invalid days (ParseIntPipe)"
curl -X GET "$BASE_URL/orders/stats?days=invalid" \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Test 11: DELETE /orders/:id with ParseOrderIdPipe
echo "1️⃣1️⃣  Testing DELETE /orders/:id (ParseOrderIdPipe)"
curl -X DELETE "$BASE_URL/orders/ORD-00001" \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Test 12: Create another order to populate the graph
echo "1️⃣2️⃣  Creating another order for visualization"
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-002",
    "items": [
      {
        "productId": "PROD-789",
        "quantity": 3,
        "price": 19.99
      }
    ],
    "paymentMethod": "paypal"
  }' \
  -w "\n" -s | jq '.'
echo ""

echo ""
echo "✅ All pipe tests completed!"
echo ""
echo "📊 Open Graph Studio to see the request traces:"
echo "   http://localhost:3001/graph-studio"
echo ""
echo "🔍 Click on any request in the request panel to see:"
echo "   - ValidationPipe validating DTOs"
echo "   - SanitizeInputPipe cleaning input data"
echo "   - TransformOrderDtoPipe transforming order data"
echo "   - ParseQueryParamsPipe parsing query parameters"
echo "   - ParseIntPipe converting string to number"
echo "   - DefaultValuePipe providing default values"
echo "   - ParseOrderIdPipe validating order IDs"
echo ""

