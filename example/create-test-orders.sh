#!/bin/bash

# Скрипт для создания тестовых заказов
# Script to create test orders

BASE_URL="http://localhost:3001"

echo "🛒 Создание тестовых заказов / Creating test orders"
echo "=================================================="
echo ""

# Заказ 1: Простой заказ с одним товаром
echo "📦 Заказ 1: Один товар (PROD-001)"
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-001",
    "items": [
      {
        "productId": "PROD-001",
        "quantity": 2,
        "price": 29.99
      }
    ],
    "paymentMethod": "credit_card"
  }' \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Заказ 2: Заказ с несколькими товарами
echo "📦 Заказ 2: Несколько товаров"
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-002",
    "items": [
      {
        "productId": "PROD-001",
        "quantity": 1,
        "price": 29.99
      },
      {
        "productId": "PROD-002",
        "quantity": 3,
        "price": 19.99
      },
      {
        "productId": "PROD-003",
        "quantity": 2,
        "price": 39.99
      }
    ],
    "paymentMethod": "paypal"
  }' \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Заказ 3: Большой заказ
echo "📦 Заказ 3: Большой заказ"
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-003",
    "items": [
      {
        "productId": "PROD-004",
        "quantity": 5,
        "price": 49.99
      },
      {
        "productId": "PROD-005",
        "quantity": 10,
        "price": 9.99
      }
    ],
    "paymentMethod": "credit_card"
  }' \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Заказ 4: Заказ от другого клиента
echo "📦 Заказ 4: Клиент CUST-004"
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-004",
    "items": [
      {
        "productId": "PROD-002",
        "quantity": 2,
        "price": 19.99
      }
    ],
    "paymentMethod": "debit_card"
  }' \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Заказ 5: Заказ с разными товарами
echo "📦 Заказ 5: Микс товаров"
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-001",
    "items": [
      {
        "productId": "PROD-003",
        "quantity": 1,
        "price": 39.99
      },
      {
        "productId": "PROD-004",
        "quantity": 2,
        "price": 49.99
      }
    ],
    "paymentMethod": "paypal"
  }' \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Заказ 6: Еще один заказ
echo "📦 Заказ 6: Клиент CUST-005"
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-005",
    "items": [
      {
        "productId": "PROD-001",
        "quantity": 3,
        "price": 29.99
      },
      {
        "productId": "PROD-005",
        "quantity": 5,
        "price": 9.99
      }
    ],
    "paymentMethod": "credit_card"
  }' \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Заказ 7: Маленький заказ
echo "📦 Заказ 7: Маленький заказ"
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-002",
    "items": [
      {
        "productId": "PROD-005",
        "quantity": 1,
        "price": 9.99
      }
    ],
    "paymentMethod": "paypal"
  }' \
  -w "\n" -s | jq '.'
echo ""
sleep 1

# Заказ 8: Последний заказ
echo "📦 Заказ 8: Клиент CUST-003"
curl -X POST "$BASE_URL/orders" \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-003",
    "items": [
      {
        "productId": "PROD-002",
        "quantity": 4,
        "price": 19.99
      },
      {
        "productId": "PROD-003",
        "quantity": 3,
        "price": 39.99
      }
    ],
    "paymentMethod": "debit_card"
  }' \
  -w "\n" -s | jq '.'
echo ""

echo ""
echo "✅ Создано 8 тестовых заказов!"
echo ""
echo "📊 Проверьте заказы:"
echo "   GET http://localhost:3001/orders"
echo ""
echo "📈 Статистика заказов:"
echo "   GET http://localhost:3001/orders/stats"
echo ""
echo "🎨 Откройте Graph Studio:"
echo "   http://localhost:3001/graph-studio"
echo ""

