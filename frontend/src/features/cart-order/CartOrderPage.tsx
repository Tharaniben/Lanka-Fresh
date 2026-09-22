import { useEffect, useState } from "react";
import type { CartItem as CartItemType, CartSummary, Order } from "./types";
import {
  getMyCart,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
} from "./cartService";
import { checkout, getMyOrders } from "./orderService";
import { getAllActiveProducts } from "../product-inventory/productService";
import type { Product } from "../product-inventory/types";
import "./CartOrderPage.css";

const money = (n: number) => `LKR ${n.toFixed(2)}`;

type Tab = "cart" | "orders";

function CartOrderPage() {
  const [tab, setTab] = useState<Tab>("cart");

  const [cart, setCart] = useState<CartSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [showCheckout, setShowCheckout] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  async function loadInitialData() {
    setLoading(true);
    setError(null);
    try {
      const [cartData, productData] = await Promise.all([
        getMyCart(),
        getAllActiveProducts(),
      ]);
      setCart(cartData);
      setProducts(productData);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  function openOrdersTab() {
    setTab("orders");
    loadOrders();
  }

  // -- CREATE: add a product to the cart --
  async function handleAddToCart(productId: number) {
    setActionError(null);
    try {
      const updated = await addItemToCart(productId, 1);
      setCart(updated);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    }
  }

  // -- UPDATE: +/- quantity buttons --
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

  // -- DELETE: remove one line / clear the whole cart --
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

  // -- Checkout flow --
  async function handlePlaceOrder() {
    if (!deliveryAddress.trim()) {
      setActionError("Please enter a delivery address.");
      return;
    }
    setPlacingOrder(true);
    setActionError(null);
    try {
      const order = await checkout(deliveryAddress.trim());
      setLastOrder(order);
      setShowCheckout(false);
      setDeliveryAddress("");
      const refreshedCart = await getMyCart(); // now empty
      setCart(refreshedCart);
    } catch (err) {
      setActionError(extractErrorMessage(err));
    } finally {
      setPlacingOrder(false);
    }
  }

  if (loading) return <div className="co-page">Loading your cart...</div>;
  if (error) {
    return (
      <div className="co-page">
        <p className="co-error">{error}</p>
        <button className="co-btn" onClick={loadInitialData}>Retry</button>
      </div>
    );
  }

  const items = cart?.items ?? [];

  return (
    <div className="co-page">
      <h1>Shopping Cart & Order Management</h1>

      <div className="co-tabs">
        <button
          className={`co-tab ${tab === "cart" ? "co-tab-active" : ""}`}
          onClick={() => setTab("cart")}
        >
          Cart
        </button>
        <button
          className={`co-tab ${tab === "orders" ? "co-tab-active" : ""}`}
          onClick={openOrdersTab}
        >
          My Orders
        </button>
      </div>

      {actionError && <p className="co-error">{actionError}</p>}

      {lastOrder && tab === "cart" && (
        <div className="co-success-banner">
          Order #{lastOrder.id} placed! Grand total {money(lastOrder.grandTotal)}.{" "}
          <button className="co-link-btn" onClick={openOrdersTab}>
            View my orders
          </button>
        </div>
      )}

      {tab === "cart" && (
        <>
          {/* Quick add -- pick from active products (this is the "CREATE" step) */}
          <div className="co-quick-add">
            <strong>Add a product:</strong>
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
              {/* CART READ / UPDATE / DELETE */}
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
                      <button className="co-qty-btn" onClick={() => handleDecrement(item)}>
                        -
                      </button>
                      <span className="co-qty">{item.quantity}</span>
                      <button className="co-qty-btn" onClick={() => handleIncrement(item)}>
                        +
                      </button>
                      <button className="co-remove-btn" onClick={() => handleRemove(item)}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}

                <button className="co-link-btn co-clear-btn" onClick={handleClearCart}>
                  Clear Cart
                </button>
              </div>

              {/* CALCULATIONS + CHECKOUT */}
              <div className="co-summary">
                <h3>Order Summary</h3>
                <p>
                  Subtotal: <strong>{money(cart!.subtotal)}</strong>
                </p>
                <p>
                  Delivery Fee: <strong>{money(cart!.deliveryFee)}</strong>
                </p>
                <hr />
                <h3 className="co-grand-total">
                  Grand Total: <span>{money(cart!.grandTotal)}</span>
                </h3>

                {!showCheckout ? (
                  <button className="co-btn co-checkout-btn" onClick={() => setShowCheckout(true)}>
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

      {tab === "orders" && (
        <div className="co-orders">
          {orders.length === 0 ? (
            <p className="co-empty">You haven't placed any orders yet.</p>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="co-order-card">
                <div className="co-order-header">
                  <strong>Order #{order.id}</strong>
                  <span className={`co-status co-status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </div>
                <p className="co-muted">
                  Placed {new Date(order.createdAt).toLocaleString()} - Deliver to:{" "}
                  {order.deliveryAddress}
                </p>
                <ul className="co-order-items">
                  {order.items.map((oi, idx) => (
                    <li key={idx}>
                      {oi.productName} x {oi.quantity} -- {money(oi.lineTotal)}
                    </li>
                  ))}
                </ul>
                <p>
                  Subtotal {money(order.subtotal)} + Delivery {money(order.deliveryFee)} ={" "}
                  <strong>{money(order.grandTotal)}</strong>
                </p>
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
