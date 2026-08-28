import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth, useUser } from "@clerk/react";
import { useUserRole } from "../auth/useUserRole";
import { getAllCategories } from "../features/product-inventory/productService";
import type { Category } from "../features/product-inventory/types";
import "./HomePage.css";

function HomePage() {
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getAllCategories()
      .then((cats) => setCategories(cats || []))
      .catch((err) => console.debug("Categories fetch on home:", err));
  }, []);

  const isReady = isAuthLoaded && isUserLoaded;

  const rawUsername =
    user?.username ||
    user?.firstName ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "User";

  // Capitalize first letter of username
  const username =
    rawUsername.charAt(0).toUpperCase() + rawUsername.slice(1);

  const formattedRole = role
    ? role
        .toLowerCase()
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ")
    : "";

  const isStaff = Boolean(isSignedIn) && role !== "CUSTOMER";
  const isCustomer = Boolean(isSignedIn) && role === "CUSTOMER";
  const isGuest = isReady && !isSignedIn;

  // Fallback category items if none in DB yet
  const fallbackCategories = [
    { id: 1, name: "Fresh Vegetables" },
    { id: 2, name: "Fresh Fruits" },
    { id: 3, name: "Dairy & Eggs" },
    { id: 4, name: "Bakery & Pantry" },
    { id: 5, name: "Herbs & Spices" },
  ];

  const categoryPills = categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="home-container">
      {/* ── Hero Section ──────────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-badge">
          🌿 Sri Lanka's Fresh Produce & Daily Supermarket Platform
        </div>

        {/* Dynamic Heading based on User Auth / Role */}
        {isGuest && (
          <h1 className="home-title">
            Fresh Fruits, Vegetables & Daily Supermarket Essentials
          </h1>
        )}

        {isCustomer && (
          <h1 className="home-title">
            Welcome to LankaFresh, {username}!
          </h1>
        )}

        {isStaff && (
          <div>
            <h1 className="home-title">
              Welcome back, {username}!
            </h1>
            {!isRoleLoading && (
              <span className="home-staff-badge">
                {formattedRole}
              </span>
            )}
          </div>
        )}

        {/* Dynamic Description */}
        {isGuest && (
          <p className="home-description">
            Shop farm-fresh fruits & vegetables sourced directly from certified local growers, alongside your daily groceries, dairy, bakery items, and household essentials delivered fresh to your door.
          </p>
        )}

        {isCustomer && (
          <p className="home-description">
            Order your everyday groceries, pantry staples, and daily-harvested fruits & vegetables with guaranteed freshness, real-time tracking, and fast doorstep delivery.
          </p>
        )}

        {isStaff && (
          <p className="home-description">
            Access your operational tools, manage supermarket inventory, oversee customer orders, and track fulfillment in real time.
          </p>
        )}

        {/* Dynamic Action Buttons (Consistent green styling with arrows) */}
        <div className="home-actions">
          {/* 1. For Guest (Logged out): View Products & Sign In */}
          {isGuest && (
            <>
              <Link to="/products" className="home-btn-primary">
                View Products →
              </Link>
              <Link to="/sign-in" className="home-btn-primary">
                Sign In / Sign Up →
              </Link>
            </>
          )}

          {/* 2. For Logged-in Customer: Start Shopping & Order Management */}
          {isCustomer && (
            <>
              <Link to="/products" className="home-btn-primary">
                Start Shopping →
              </Link>
              <Link to="/cart" className="home-btn-primary">
                My Cart & Orders →
              </Link>
              <Link to="/delivery" className="home-btn-primary">
                Track Delivery →
              </Link>
            </>
          )}

          {/* 3. For Logged-in Staff: Role-specific Quick Navigation */}
          {isStaff && (
            <>
              {role === "INVENTORY_STAFF" && (
                <>
                  <Link to="/products" className="home-btn-primary">
                    Manage Products & Stock →
                  </Link>
                  <Link to="/suppliers" className="home-btn-primary">
                    Suppliers & Purchases →
                  </Link>
                </>
              )}

              {role === "SALES_STAFF" && (
                <Link to="/cart" className="home-btn-primary">
                  Manage Orders & Payments →
                </Link>
              )}

              {role === "DELIVERY_STAFF" && (
                <Link to="/delivery" className="home-btn-primary">
                  View Assigned Deliveries →
                </Link>
              )}

              {role === "CRO" && (
                <Link to="/complaints" className="home-btn-primary">
                  Manage Complaints & Feedback →
                </Link>
              )}

              {role === "BRANCH_MANAGER" && (
                <>
                  <Link to="/reports" className="home-btn-primary">
                    Reports & Dashboard →
                  </Link>
                  <Link to="/admin/users" className="home-btn-primary">
                    User Management →
                  </Link>
                  <Link to="/products" className="home-btn-primary">
                    Inventory Overview →
                  </Link>
                  <Link to="/cart" className="home-btn-primary">
                    Orders →
                  </Link>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── Grocery Pillars / Feature Cards ────────────────────── */}
      <section className="home-features">
        <div className="home-feature-card">
          <div className="home-feature-icon">🥑</div>
          <h3>Fresh Fruits & Veggies</h3>
          <p>Directly sourced from certified local growers with strict freshness standards, alongside all your daily grocery essentials.</p>
        </div>

        <div className="home-feature-card">
          <div className="home-feature-icon">⏱️</div>
          <h3>Expiry Tracked</h3>
          <p>Real-time perishables and expiry monitoring to guarantee only fresh, safe items reach your home.</p>
        </div>

        <div className="home-feature-card">
          <div className="home-feature-icon">🚚</div>
          <h3>Fast Delivery</h3>
          <p>Reliable door-to-door delivery with live tracking for all your daily grocery & supermarket orders.</p>
        </div>

        <div className="home-feature-card">
          <div className="home-feature-icon">🛡️</div>
          <h3>Fair & Transparent</h3>
          <p>Direct marketplace pricing, transparent stock availability, and dedicated customer support.</p>
        </div>
      </section>

      {/* ── Functional Category Quick Links (Clean text only) ───── */}
      <section className="home-categories">
        <h2>Explore by Category</h2>
        <div className="home-category-list">
          {categoryPills.map((cat) => (
            <Link
              key={cat.id}
              to={`/products?category=${encodeURIComponent(cat.name)}`}
              className="home-category-pill"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

export default HomePage;
