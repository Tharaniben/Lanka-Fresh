# Cart & Order Management — Bruno API Tests

All endpoints for the Shopping Cart, Order Management, and Status-Change Notification modules are covered here:

## 1. Cart (`/api/v1/cart`)
- `cart/get-cart.bru` — GET `/api/v1/cart`
- `cart/add-item.bru` — POST `/api/v1/cart/items`
- `cart/update-item-qty.bru` — PUT `/api/v1/cart/items/{id}`
- `cart/remove-item.bru` — DELETE `/api/v1/cart/items/{id}`
- `cart/clear-cart.bru` — DELETE `/api/v1/cart`

## 2. Orders (`/api/v1/orders`)
- `orders/checkout.bru` — POST `/api/v1/orders/checkout` (Happy path)
- `orders/checkout-card-declined.bru` — POST `/api/v1/orders/checkout` (Declined card testing)
- `orders/get-my-orders.bru` — GET `/api/v1/orders` (Customer order history)
- `orders/get-order-by-id.bru` — GET `/api/v1/orders/{id}`
- `orders/get-all-orders-staff.bru` — GET `/api/v1/orders/all` (Sales & Delivery staff view)
- `orders/update-order-status.bru` — PATCH `/api/v1/orders/{id}/status`
- `orders/cancel-order.bru` — PATCH `/api/v1/orders/{id}/cancel` (Restores inventory stock)

## 3. Notifications (`/api/v1/notifications`)
- `notifications/get-my-notifications.bru` — GET `/api/v1/notifications`
- `notifications/mark-notification-read.bru` — PATCH `/api/v1/notifications/{id}/read`
- `notifications/mark-all-read.bru` — PATCH `/api/v1/notifications/read-all`
