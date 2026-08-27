import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@clerk/react";
import { useUserRole } from "./useUserRole";
import type { Category, Product } from "./types";
import { getExpiryStatus } from "./expiryUtils";
import {
  reactivateProduct,
  getAllActiveProducts,
  getAllProducts,
  getAllCategories,
  createProduct,
  updateProduct,
  deactivateProduct,
} from "./productService";
import ProductCard from "./ProductCard";
import ProductForm from "./ProductForm";
import CategoryTab from "./CategoryTab";
import StockTab from "./StockTab";
import "./ProductInventoryPage.css";

const STAFF_ROLES = ["INVENTORY_STAFF", "BRANCH_MANAGER"];
type Tab = "products" | "categories" | "stock";
type StaffFilter = "all" | "expiring_soon" | "expired" | "inactive";

function ProductInventoryPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { role: userRole, loading: roleLoading } = useUserRole();
  const isStaff = Boolean(isSignedIn) && STAFF_ROLES.includes(userRole);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [staffFilter, setStaffFilter] = useState<StaffFilter>("all");

  useEffect(() => {
    if (isAuthLoaded) {
      loadData();
    }
  }, [isAuthLoaded, isStaff]);

  // Sync category from URL search params (e.g. /products?category=Fruits or /products?category=1)
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (!categoryParam) return;

    if (categories.length > 0) {
      // Check exact ID match first
      const byId = categories.find((c) => c.id.toString() === categoryParam);
      if (byId) {
        setSelectedCategory(byId.id.toString());
        return;
      }
      // Check partial/case-insensitive name match
      const byName = categories.find((c) =>
        c.name.toLowerCase().includes(categoryParam.toLowerCase()) ||
        categoryParam.toLowerCase().includes(c.name.toLowerCase())
      );
      if (byName) {
        setSelectedCategory(byName.id.toString());
      }
    }
  }, [searchParams, categories]);

  async function loadData() {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        getAllCategories(),
        isStaff ? getAllProducts() : getAllActiveProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error("Failed to load products/categories:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleCategoryChange(newCat: string) {
    setSelectedCategory(newCat);
    const nextParams = new URLSearchParams(searchParams);
    if (newCat === "all") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", newCat);
    }
    setSearchParams(nextParams, { replace: true });
  }

  function handleResetFilters() {
    setSearchTerm("");
    setSelectedCategory("all");
    setStaffFilter("all");
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("category");
    setSearchParams(nextParams, { replace: true });
  }

  if (!isAuthLoaded || (isSignedIn && roleLoading)) {
    return <p className="pi-loading">Loading...</p>;
  }

  // Filter products
  const term = searchTerm.trim().toLowerCase();
  const filteredProducts = products.filter((p) => {
    const expiry = getExpiryStatus(p.expiryDate);

    // Rule: Expired products are NEVER shown to customers or guest visitors
    if (!isStaff && expiry.isExpired) {
      return false;
    }

    // Safe, case-insensitive multi-field search
    const matchesSearch =
      term === "" ||
      (p.name ? p.name.toLowerCase().includes(term) : false) ||
      (p.categoryName ? p.categoryName.toLowerCase().includes(term) : false) ||
      (p.description ? p.description.toLowerCase().includes(term) : false);

    const matchesCategory =
      selectedCategory === "all" || p.categoryId.toString() === selectedCategory;

    // Staff filter checks
    let matchesStaffFilter = true;
    if (isStaff) {
      if (staffFilter === "expiring_soon") {
        matchesStaffFilter = expiry.isExpiringSoon;
      } else if (staffFilter === "expired") {
        matchesStaffFilter = expiry.isExpired;
      } else if (staffFilter === "inactive") {
        matchesStaffFilter = !p.active;
      }
    }

    return matchesSearch && matchesCategory && matchesStaffFilter;
  });

  // Calculate stats for staff alerts
  const expiredCount = isStaff
    ? products.filter((p) => getExpiryStatus(p.expiryDate).isExpired).length
    : 0;
  const expiringSoonCount = isStaff
    ? products.filter((p) => getExpiryStatus(p.expiryDate).isExpiringSoon).length
    : 0;

  const hasActiveFilters =
    searchTerm !== "" ||
    selectedCategory !== "all" ||
    (isStaff && staffFilter !== "all");

  async function handleCreateProduct(data: Parameters<typeof createProduct>[0]) {
    await createProduct(data);
    setShowForm(false);
    loadData();
  }

  async function handleUpdateProduct(data: Parameters<typeof updateProduct>[1]) {
    if (!editingProduct) return;
    await updateProduct(editingProduct.id, data);
    setEditingProduct(null);
    setShowForm(false);
    loadData();
  }

  async function handleDeactivate(product: Product) {
    if (!confirm(`Deactivate "${product.name}"? It will be hidden from customers.`)) return;
    await deactivateProduct(product.id);
    loadData();
  }

  async function handleReactivate(product: Product) {
    if (!confirm(`Reactivate "${product.name}"? It will be visible to customers again.`)) return;
    await reactivateProduct(product.id);
    loadData();
  }

  function handleAddToCart(product: Product, quantity: number) {
    console.log("Add to cart:", product.name, "x", quantity);
    alert(`Added ${quantity}x ${product.name} to cart`);
  }

  return (
    <div className="pi-page">
      {isStaff && (
        <div className="pi-tabs">
          <button
            className={`pi-tab ${activeTab === "products" ? "pi-tab--active" : ""}`}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>
          <button
            className={`pi-tab ${activeTab === "categories" ? "pi-tab--active" : ""}`}
            onClick={() => setActiveTab("categories")}
          >
            Categories
          </button>
          <button
            className={`pi-tab ${activeTab === "stock" ? "pi-tab--active" : ""}`}
            onClick={() => setActiveTab("stock")}
          >
            Stock
          </button>
        </div>
      )}

      {isStaff && activeTab === "categories" && (
        <CategoryTab categories={categories} onRefresh={loadData} />
      )}

      {isStaff && activeTab === "stock" && <StockTab />}

      {(!isStaff || activeTab === "products") && (
        <>
          <div className="pi-header">
            <div>
              <h1>{isStaff ? "Product Catalogue & Inventory" : "Fresh Grocery & Products"}</h1>
              {!isSignedIn && (
                <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: "4px 0 0" }}>
                  Browsing catalogue in view-only mode. <a href="/sign-in" style={{ color: "var(--primary)", fontWeight: 500 }}>Sign in</a> to add items to your cart.
                </p>
              )}
            </div>
            {isStaff && (
              <button onClick={() => { setEditingProduct(null); setShowForm(true); }}>
                + Add product
              </button>
            )}
          </div>

          {/* Staff Expiry Alert Banners with toggle buttons */}
          {isStaff && (expiredCount > 0 || expiringSoonCount > 0) && (
            <div className="pi-expiry-banner">
              {expiredCount > 0 && (
                <div className="alert alert--danger">
                  <span>🚨 <strong>{expiredCount}</strong> product(s) expired (hidden from customers).</span>
                  <button
                    className="btn-sm btn-danger"
                    onClick={() => setStaffFilter(staffFilter === "expired" ? "all" : "expired")}
                  >
                    {staffFilter === "expired" ? "Show All Products" : "View Expired"}
                  </button>
                </div>
              )}
              {expiringSoonCount > 0 && (
                <div className="alert alert--warning">
                  <span>⚠️ <strong>{expiringSoonCount}</strong> expiring product(s) within 7 days.</span>
                  <button
                    className="btn-sm btn-secondary"
                    onClick={() => setStaffFilter(staffFilter === "expiring_soon" ? "all" : "expiring_soon")}
                  >
                    {staffFilter === "expiring_soon" ? "Show All Products" : "View Expiring Soon"}
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="pi-filters">
            <div className="pi-search-wrapper">
              <input
                type="text"
                placeholder="Search products by name or category..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pi-search"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="pi-search-clear"
                  onClick={() => setSearchTerm("")}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="pi-filter-select"
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>

            {isStaff && (
              <select
                value={staffFilter}
                onChange={(e) => setStaffFilter(e.target.value as StaffFilter)}
                className="pi-filter-select"
              >
                <option value="all">All products ({products.length})</option>
                <option value="expiring_soon">Expiring soon ({expiringSoonCount})</option>
                <option value="expired">Expired ({expiredCount})</option>
                <option value="inactive">Inactive</option>
              </select>
            )}

            {hasActiveFilters && (
              <button
                type="button"
                className="pi-reset-btn"
                onClick={handleResetFilters}
              >
                Reset filters
              </button>
            )}
          </div>

          {loading ? (
            <p className="pi-loading">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <div className="pi-empty-container">
              <p className="pi-empty">No products match your filters.</p>
              {hasActiveFilters && (
                <button
                  className="btn-secondary btn-sm"
                  onClick={handleResetFilters}
                >
                  Show All Products
                </button>
              )}
            </div>
          ) : (
            <div className="pi-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isStaff={isStaff}
                  isSignedIn={Boolean(isSignedIn)}
                  onAddToCart={handleAddToCart}
                  onEdit={(p) => { setEditingProduct(p); setShowForm(true); }}
                  onDeactivate={handleDeactivate}
                  onReactivate={handleReactivate}
                />
              ))}
            </div>
          )}
        </>
      )}

      {showForm && (
        <ProductForm
          categories={categories}
          product={editingProduct}
          onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
          onCancel={() => { setShowForm(false); setEditingProduct(null); }}
        />
      )}
    </div>
  );
}

export default ProductInventoryPage;
