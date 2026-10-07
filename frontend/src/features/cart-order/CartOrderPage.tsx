import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import type { CartItem as CartItemType, CartSummary, Order, OrderStatus, Notification } from "./types";
import {
  getMyCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "./cartService";
import {
  checkout,
  getMyOrders,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "./orderService";
import { getAllActiveProducts } from "../product-inventory/productService";
import type { Product } from "../product-inventory/types";
import { useUserRole } from "../../auth/useUserRole";
import "./CartOrderPage.css";

const money = (n: number) => `LKR ${Number(n || 0).toFixed(2)}`;

type Tab = "cart" | "orders" | "all-orders" | "notifications";

function CartOrderPage() {
  const { role } = useUserRole();
  const isStaff = role === "SALES_STAFF" || role === "BRANCH_MANAGER" || role === "DELIVERY_STAFF";

  const [tab, setTab] = useState<Tab>("cart");
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  // Set default tab for staff
  useEffect(() => {
    if (role === "SALES_STAFF") {
      setTab("all-orders");
    }
  }, [role]);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cartData, productData, notifs] = await Promise.all([
        getMyCart(),
        getAllActiveProducts(),
        getMyNotifications().catch(() => []),
      ]);
      setCart(cartData);
      setProducts(productData);
      setNotifications(notifs);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  const loadOrders = useCallback(async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }, []);

  const loadAllOrders = useCallback(async () => {
    try {
      const data = await getAllOrders();
      setAllOrders(data);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const notifs = await getMyNotifications();
      setNotifications(notifs);
    } catch {
      // silent background refresh
    }
  }, []);

  // Polling ref for near real-time updates as per PRD Section 4.7
  const tabRef = useRef(tab);
  useEffect(() => {
    tabRef.current = tab;
  }, [tab]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (tabRef.current === "orders") {
        loadOrders();
      } else if (tabRef.current === "all-orders" && isStaff) {
        loadAllOrders();
      }
      loadNotifications();
    }, 8000);

    return () => clearInterval(timer);
  }, [loadOrders, loadAllOrders, loadNotifications, isStaff]);

  function openTab(newTab: Tab) {
    setTab(newTab);
    setActionError(null);
    setActionSuccess(null);
    if (newTab === "orders") {
      loadOrders();
    } else if (newTab === "all-orders") {
      loadAllOrders();
    } else if (newTab === "notifications") {
      loadNotifications();
    }
  }

  // Cart operations
  async function handleAddToCart(productId: number) {
    setActionError(null);
    setActionSuccess(null);
    try {
      const updated = await addItemToCart(productId, 1);
      setCart(updated);
      setActionSuccess("Item added to cart!");
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  async function handleIncrement(item: CartItemType) {
    setActionError(null);
    try {
      const updated = await updateCartItemQuantity(item.cartItemId, item.quantity + 1);
      setCart(updated);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  async function handleDecrement(item: CartItemType) {
    setActionError(null);
    try {
      const updated =
        item.quantity <= 1
          ? await removeCartItem(item.cartItemId)
          : await updateCartItemQuantity(item.cartItemId, item.quantity - 1);
      setCart(updated);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  async function handleRemove(item: CartItemType) {
    setActionError(null);
    try {
      const updated = await removeCartItem(item.cartItemId);
      setCart(updated);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  async function handleClearCart() {
    if (!window.confirm("Remove everything from your cart?")) return;
    setActionError(null);
    try {
      const updated = await clearCart();
      setCart(updated);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  // Checkout flow
  async function handlePlaceOrder() {
    if (
      !deliveryAddress.trim() ||
      !cardNumber.trim() ||
      !cardHolderName.trim() ||
      !expiryDate.trim() ||
      !cvv.trim()
    ) {
      setActionError("Please fill in the delivery address and all card details.");
      return;
    }
    setPlacingOrder(true);
    setActionError(null);
    try {
      const order = await checkout({
        deliveryAddress: deliveryAddress.trim(),
        cardNumber: cardNumber.trim(),
        cardHolderName: cardHolderName.trim(),
        expiryDate: expiryDate.trim(),
        cvv: cvv.trim(),
      });
      setLastOrder(order);
      setShowCheckout(false);
      setDeliveryAddress("");
      setCardNumber("");
      setCardHolderName("");
      setExpiryDate("");
      setCvv("");
      const refreshedCart = await getMyCart();
      setCart(refreshedCart);
      loadNotifications();
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setPlacingOrder(false);
    }
  }

  // Order cancellation (Customer)
  async function handleCancelOrder(orderId: number) {
    if (!window.confirm(`Are you sure you want to cancel Order #${orderId}?`)) return;
    setActionError(null);
    try {
      await cancelOrder(orderId);
      setActionSuccess(`Order #${orderId} was cancelled.`);
      await Promise.all([loadOrders(), loadNotifications()]);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  // Staff status change
  async function handleStatusChange(orderId: number, newStatus: OrderStatus) {
    setActionError(null);
    try {
      await updateOrderStatus(orderId, newStatus);
      setActionSuccess(`Order #${orderId} updated to ${newStatus}.`);
      await loadAllOrders();
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  // Notifications
  async function handleMarkNotificationRead(id: number) {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readStatus: true } : n))
      );
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  async function handleMarkAllNotificationsRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, readStatus: true })));
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  if (loading) return <div className="co-page">Loading your cart and orders...</div>;
  if (error) {
    return (
      <div className="co-page">
        <p className="co-error">{error}</p>
        <button className="co-btn" onClick={loadInitialData}>
          Retry
        </button>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const unreadNotifsCount = notifications.filter((n) => !n.readStatus).length;

  const filteredAllOrders = allOrders.filter((o) =>
    statusFilter === "ALL" ? true : o.status === statusFilter
  );

  return (
    <div className="co-page">
      <div className="co-header">
        <h1>Shopping Cart & Order Management</h1>
        <span className="co-role-badge">Role: {role}</span>
      </div>

      <div className="co-tabs">
        <button
          className={`co-tab ${tab === "cart" ? "co-tab-active" : ""}`}
          onClick={() => openTab("cart")}
        >
          Cart ({items.reduce((sum, i) => sum + i.quantity, 0)})
        </button>

        <button
          className={`co-tab ${tab === "orders" ? "co-tab-active" : ""}`}
          onClick={() => openTab("orders")}
        >
          My Orders
        </button>

        {isStaff && (
          <button
            className={`co-tab ${tab === "all-orders" ? "co-tab-active" : ""}`}
            onClick={() => openTab("all-orders")}
          >
            All Orders (Staff)
          </button>
        )}

        <button
          className={`co-tab ${tab === "notifications" ? "co-tab-active" : ""}`}
          onClick={() => openTab("notifications")}
        >
          Notifications
          {unreadNotifsCount > 0 && (
            <span className="co-notif-badge">{unreadNotifsCount}</span>
          )}
        </button>
      </div>

      {actionError && <p className="co-error">{actionError}</p>}
      {actionSuccess && <p className="co-success-banner">{actionSuccess}</p>}

      {lastOrder && tab === "cart" && (
        <div className="co-success-banner">
          Order #{lastOrder.id} placed! Grand total {money(lastOrder.grandTotal)}.{" "}
          {lastOrder.paymentTransactionId && (
            <>Payment ref: <code>{lastOrder.paymentTransactionId}</code> (Status: {lastOrder.paymentStatus}).{" "}</>
          )}
          <div style={{ marginTop: "8px", display: "flex", gap: "10px", alignItems: "center" }}>
            <Link
              to={`/delivery?orderId=${lastOrder.id}`}
              className="co-track-link"
            >
              Track Delivery 🚚
            </Link>
            <button className="co-link-btn" onClick={() => openTab("orders")}>
              View my orders
            </button>
          </div>
        </div>
      )}

      {/* TAB 1: CART */}
      {tab === "cart" && (
        <>
          <div className="co-quick-add">
            <strong>Quick Add Products:</strong>
            <div className="co-quick-add-list">
              {products.map((p) => (
                <button
                  key={p.id}
                  className="co-quick-add-btn"
                  onClick={() => handleAddToCart(p.id)}
                  disabled={!p.stockQuantity}
                  title={!p.stockQuantity ? "Out of stock" : undefined}
                >
                  + {p.name} ({money(p.price)})
                </button>
              ))}
            </div>
          </div>

          {items.length === 0 ? (
            <p className="co-empty">Your cart is empty. Add something above!</p>
          ) : (
            <div className="co-grid">
              <div className="co-items">
                {items.map((item) => (
                  <div key={item.cartItemId} className="co-item">
                    <img
                      src={item.productImageUrl ?? undefined}
                      alt={item.productName}
                      className="co-item-img"
                    />
                    <div className="co-item-info">
                      <h4>{item.productName}</h4>
                      <p className="co-muted">
                        {money(item.unitPrice)} x {item.quantity} ={" "}
                        <strong>{money(item.lineTotal)}</strong>
                      </p>
                    </div>
                    <div className="co-item-controls">
                      <button
                        type="button"
                        className="co-qty-btn"
                        onClick={() => handleDecrement(item)}
                        aria-label="Decrease quantity"
                      >
                        -
                      </button>
                      <span className="co-qty">{item.quantity}</span>
                      <button
                        type="button"
                        className="co-qty-btn"
                        onClick={() => handleIncrement(item)}
                        aria-label="Increase quantity"
                      >
                        +
                      </button>
                      <button type="button" className="co-remove-btn" onClick={() => handleRemove(item)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <button className="co-link-btn co-clear-btn" onClick={handleClearCart}>
                  Clear Cart
                </button>
              </div>

              <div className="co-summary">
                <h3>Order Summary</h3>
                <p>
                  Subtotal: <strong>{money(cart!.subtotal)}</strong>
                </p>
                <p>
                  Delivery Fee:{" "}
                  <strong>
                    {cart!.deliveryFee === 0 ? "FREE" : money(cart!.deliveryFee)}
                  </strong>
                </p>
                <p className="co-muted co-hint">Free delivery on orders over LKR 3,000.00</p>
                <hr />
                <h3 className="co-grand-total">
                  Grand Total: <span>{money(cart!.grandTotal)}</span>
                </h3>

                {!showCheckout ? (
                  <button
                    className="co-btn co-checkout-btn"
                    onClick={() => setShowCheckout(true)}
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <div className="co-checkout-form">
                    <label htmlFor="deliveryAddress">Delivery Address</label>
                    <textarea
                      id="deliveryAddress"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="House no, street, city"
                      rows={3}
                    />

                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      id="cardNumber"
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4111 1111 1111 1111"
                    />
                    <p className="co-muted co-hint">
                      Mock payment: Tip — end card number with 0000 to test card decline.
                    </p>

                    <label htmlFor="cardHolderName">Name on Card</label>
                    <input
                      id="cardHolderName"
                      type="text"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value)}
                      placeholder="As shown on card"
                    />

                    <div className="co-card-row">
                      <div>
                        <label htmlFor="expiryDate">Expiry (MM/YY)</label>
                        <input
                          id="expiryDate"
                          type="text"
                          value={expiryDate}
                          onChange={(e) => setExpiryDate(e.target.value)}
                          placeholder="12/28"
                        />
                      </div>
                      <div>
                        <label htmlFor="cvv">CVV</label>
                        <input
                          id="cvv"
                          type="text"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="123"
                        />
                      </div>
                    </div>

                    <div className="co-checkout-actions">
                      <button
                        className="co-btn co-checkout-btn"
                        onClick={handlePlaceOrder}
                        disabled={placingOrder}
                      >
                        {placingOrder ? "Placing Order..." : "Place Order"}
                      </button>
                      <button
                        className="co-link-btn"
                        onClick={() => setShowCheckout(false)}
                        disabled={placingOrder}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: MY ORDERS (Customer) */}
      {tab === "orders" && (
        <div className="co-orders">
          <div className="co-orders-bar">
            <h2>Order History</h2>
            <span className="co-muted">Auto-refreshes every 8 seconds</span>
          </div>

          {orders.length === 0 ? (
            <p className="co-empty">You haven't placed any orders yet.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="co-order-card">
                <div className="co-order-header">
                  <div>
                    <strong>Order #{order.id}</strong>
                    <span className="co-muted co-order-time">
                      {" • "}
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="co-badges-row">
                    <span className={`co-status co-status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                    {order.paymentStatus && (
                      <span className={`co-pay-badge co-pay-${order.paymentStatus.toLowerCase()}`}>
                        Payment: {order.paymentStatus}
                      </span>
                    )}
                  </div>
                </div>

                <p className="co-muted">
                  Deliver to: <strong>{order.deliveryAddress}</strong>
                </p>

                {order.paymentTransactionId && (
                  <p className="co-muted co-hint">
                    Transaction ID: <code>{order.paymentTransactionId}</code>
                  </p>
                )}

                <ul className="co-order-items">
                  {order.items.map((oi, idx) => (
                    <li key={idx}>
                      {oi.productName} x {oi.quantity} — {money(oi.lineTotal)}
                    </li>
                  ))}
                </ul>

                <div className="co-order-footer">
                  <p className="co-order-totals">
                    Subtotal {money(order.subtotal)} + Delivery {money(order.deliveryFee)} ={" "}
                    <strong>{money(order.grandTotal)}</strong>
                  </p>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <Link
                      to={`/delivery?orderId=${order.id}`}
                      className="co-track-link"
                    >
                      Track Delivery 🚚
                    </Link>
                    {order.status === "PLACED" && (
                      <button
                        className="co-cancel-btn"
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 3: ALL ORDERS (Staff Management) */}
      {tab === "all-orders" && isStaff && (
        <div className="co-orders">
          <div className="co-orders-bar">
            <h2>Customer Orders Management</h2>
            <div className="co-filter-row">
              <label htmlFor="filterStatus">Status:</label>
              <select
                id="filterStatus"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="co-select"
              >
                <option value="ALL">All Statuses ({allOrders.length})</option>
                <option value="PLACED">Placed</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredAllOrders.length === 0 ? (
            <p className="co-empty">No orders found matching status filter.</p>
          ) : (
            filteredAllOrders.map((order) => (
              <div key={order.id} className="co-order-card">
                <div className="co-order-header">
                  <div>
                    <strong>Order #{order.id}</strong>
                    {order.customerName && (
                      <span className="co-customer-label"> — Customer: {order.customerName}</span>
                    )}
                    {order.customerEmail && (
                      <span className="co-muted"> ({order.customerEmail})</span>
                    )}
                  </div>
                  <div className="co-badges-row">
                    <span className={`co-status co-status-${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                    {order.paymentStatus && (
                      <span className={`co-pay-badge co-pay-${order.paymentStatus.toLowerCase()}`}>
                        {order.paymentStatus}
                      </span>
                    )}
                  </div>
                </div>

                <p className="co-muted">
                  Address: {order.deliveryAddress} | Placed: {new Date(order.createdAt).toLocaleString()}
                </p>

                <ul className="co-order-items">
                  {order.items.map((oi, idx) => (
                    <li key={idx}>
                      {oi.productName} x {oi.quantity} — {money(oi.lineTotal)}
                    </li>
                  ))}
                </ul>

                <div className="co-order-footer">
                  <p className="co-order-totals">
                    Total: <strong>{money(order.grandTotal)}</strong>
                  </p>

                  <div className="co-staff-actions">
                    {order.status === "PLACED" && (
                      <>
                        <button
                          className="co-btn-sm co-btn-confirm"
                          onClick={() => handleStatusChange(order.id, "CONFIRMED")}
                        >
                          Confirm Order
                        </button>
                        <button
                          className="co-btn-sm co-btn-cancel"
                          onClick={() => handleStatusChange(order.id, "CANCELLED")}
                        >
                          Cancel Order
                        </button>
                      </>
                    )}

                    {order.status === "CONFIRMED" && (
                      <>
                        <button
                          className="co-btn-sm co-btn-dispatch"
                          onClick={() => handleStatusChange(order.id, "OUT_FOR_DELIVERY")}
                        >
                          Out for Delivery
                        </button>
                        <button
                          className="co-btn-sm co-btn-cancel"
                          onClick={() => handleStatusChange(order.id, "CANCELLED")}
                        >
                          Cancel Order
                        </button>
                      </>
                    )}

                    {order.status === "OUT_FOR_DELIVERY" && (
                      <button
                        className="co-btn-sm co-btn-delivered"
                        onClick={() => handleStatusChange(order.id, "DELIVERED")}
                      >
                        Mark Delivered
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 4: STATUS NOTIFICATIONS */}
      {tab === "notifications" && (
        <div className="co-notifs-page">
          <div className="co-notifs-header">
            <h2>Order Status Notifications</h2>
            {unreadNotifsCount > 0 && (
              <button
                className="co-btn-sm co-btn-readall"
                onClick={handleMarkAllNotificationsRead}
              >
                Mark all as read
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="co-empty">
              No notifications yet. You will receive real-time notifications here as your orders are
              processed and dispatched.
            </p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`co-notif-item ${notif.readStatus ? "co-notif-read" : "co-notif-unread"}`}
              >
                <div className="co-notif-content">
                  <div className="co-notif-title-row">
                    <strong>{notif.title}</strong>
                    <span className="co-muted co-hint">
                      {new Date(notif.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="co-notif-msg">{notif.message}</p>
                </div>
                {!notif.readStatus && (
                  <button
                    className="co-btn-sm"
                    onClick={() => handleMarkNotificationRead(notif.id)}
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function extractErrorMessage(err: unknown): string {
  const anyErr = err as { response?: { data?: { message?: string } }; message?: string };
  return anyErr?.response?.data?.message ?? anyErr?.message ?? "Something went wrong.";
}

export default CartOrderPage;