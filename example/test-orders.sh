#!/bin/bash

# Test script for Orders API
# This script demonstrates the complex execution paths through guards, interceptors, and services

echo "🧪 Testing Orders API with complex execution paths..."
echo ""

# Set the base URL
BASE_URL="http://localhost:3001"

# Add authorization header (required by AuthGuard)
AUTH_HEADER="Authorization: Bearer test-token-123"

echo "1️⃣  Creating a new order (POST /orders)"
echo "   This will trigger: AuthGuard → RolesGuard → ValidationPipe → LoggingInterceptor → TransformInterceptor"
echo "   Services: OrdersService → PaymentService + InventoryService + NotificationService"
echo ""

curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "customerId": "CUST-001",
    "items": [
      {
        "productId": "PROD-001",
        "quantity": 2,
        "price": 29.99
      },
      {
        "productId": "PROD-002",
        "quantity": 1,
        "price": 49.99
      }
    ],
    "paymentMethod": "credit_card"
  }' | jq '.'

echo ""
echo "✅ Order created successfully!"
echo ""
sleep 1

echo "2️⃣  Fetching all orders (GET /orders)"
echo "   This will trigger: AuthGuard → RolesGuard → LoggingInterceptor → TransformInterceptor"
echo "   Services: OrdersService"
echo ""

curl -X GET "$BASE_URL/orders" \
  -H "$AUTH_HEADER" | jq '.'

echo ""
sleep 1

echo "3️⃣  Fetching order stats (GET /orders/stats)"
echo "   This will trigger: AuthGuard → RolesGuard (admin role) → LoggingInterceptor → TransformInterceptor"
echo "   Services: OrdersService"
echo ""

curl -X GET "$BASE_URL/orders/stats" \
  -H "$AUTH_HEADER" | jq '.'

echo ""
sleep 1

echo "4️⃣  Fetching a specific order (GET /orders/ORD-00001)"
echo "   This will trigger: AuthGuard → RolesGuard → ParseOrderIdPipe → LoggingInterceptor → TransformInterceptor"
echo "   Services: OrdersService"
echo ""

curl -X GET "$BASE_URL/orders/ORD-00001" \
  -H "$AUTH_HEADER" | jq '.'

echo ""
sleep 1

echo "5️⃣  Updating order status (PATCH /orders/ORD-00001)"
echo "   This will trigger: AuthGuard → RolesGuard (admin) → ParseOrderIdPipe → ValidationPipe → LoggingInterceptor → TransformInterceptor"
echo "   Services: OrdersService → NotificationService"
echo ""

curl -X PATCH "$BASE_URL/orders/ORD-00001" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "status": "processing",
    "trackingNumber": "TRACK-123456"
  }' | jq '.'

echo ""
sleep 1

echo "6️⃣  Creating another order"
echo ""

curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -H "$AUTH_HEADER" \
  -d '{
    "customerId": "CUST-002",
    "items": [
      {
        "productId": "PROD-003",
        "quantity": 5,
        "price": 19.99
      }
    ],
    "paymentMethod": "paypal"
  }' | jq '.'

echo ""
echo "✅ All tests completed!"
echo ""
echo "📊 Now open http://localhost:3001/graph-studio to see the dependency graph"
echo "🔍 Click on any request in the request panel to see the execution path highlighted!"
echo ""

