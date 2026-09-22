import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, useUser } from "@clerk/react";
import { useUserRole } from "../auth/useUserRole";
import { getAllCategories } from "../features/product-inventory/productService";
import type { Category } from "../features/product-inventory/types";
import "./HomePage.css";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export default function CartPage() {
  // Initial cart state loaded from localStorage or mock fallback
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem("lankafresh_cart");
    return saved ? JSON.parse(saved) : [
      {
        id: 1,
        name: "Fresh Carrots 1kg",
        price: 350.00,
        quantity: 2,
        imageUrl: "https://images.unsplash.com/photo-1598170845058-12ef4a457939?w=500",
      },
      {
        id: 5,
        name: "Fresh Milk 1L",
        price: 480.00,
        quantity: 1,
        imageUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=500",
      }
    ];
  });

  // Sync cart changes to localStorage
  useEffect(() => {
    localStorage.setItem("lankafresh_cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // 1. UPDATE Quantity (+ / -)
  const updateQuantity = (id: number, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // 2. DELETE Item
  const removeItem = (id: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  // 3. CLEAR Cart
  const clearCart = () => {
    setCartItems([]);
  };

  // 4. CALCULATIONS
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const deliveryFee = subtotal > 3000 || subtotal === 0 ? 0 : 350;
  const grandTotal = subtotal + deliveryFee;

  return (
    <div className="cart-container p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-emerald-800">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <p className="text-gray-600 text-lg mb-4">Your shopping cart is empty.</p>
          <Link
            to="/products"
            className="inline-block bg-emerald-600 text-white px-6 py-2 rounded-md hover:bg-emerald-700 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items List */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between border p-4 rounded-lg bg-white shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-lg text-gray-800">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      Unit Price: LKR {item.price.toFixed(2)}
                    </p>
                    <p className="font-semibold text-emerald-700">
                      Subtotal: LKR {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* Quantity Controls & Remove Action */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded bg-gray-50">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="px-3 py-1 font-bold text-gray-600 hover:bg-gray-200"
                    >
                      -
                    </button>
                    <span className="px-3 font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="px-3 py-1 font-bold text-gray-600 hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700 font-semibold text-sm px-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={clearCart}
              className="text-sm text-red-600 hover:underline font-medium mt-2"
            >
              Clear Entire Cart
            </button>
          </div>

          {/* Checkout & Summary Card */}
          <div className="border p-6 rounded-lg bg-white shadow-sm h-fit">
            <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">
              Order Summary
            </h2>
            <div className="space-y-3 text-gray-700">
              <div className="flex justify-between">
                <span>Items Subtotal:</span>
                <span className="font-medium">LKR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee:</span>
                <span className="font-medium">
                  {deliveryFee === 0 ? "FREE" : `LKR ${deliveryFee.toFixed(2)}`}
                </span>
              </div>
              {subtotal < 3000 && subtotal > 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                  Add LKR {(3000 - subtotal).toFixed(2)} more for FREE delivery!
                </p>
              )}
              <hr />
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-1">
                <span>Grand Total:</span>
                <span className="text-emerald-700">LKR {grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => alert("Proceeding to checkout...")}
              className="w-full mt-6 bg-emerald-600 text-white py-3 rounded-md font-semibold hover:bg-emerald-700 transition"
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}