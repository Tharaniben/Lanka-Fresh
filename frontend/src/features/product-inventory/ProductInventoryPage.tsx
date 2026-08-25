import { useState, useEffect } from "react";
import { useUserRole } from "./useUserRole";
import type { Category, Product } from "./types";
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

const STAFF_ROLES = ["INVENTORY_STAFF", "BRANCH_MANAGER", "ADMIN"];
type Tab = "products" | "categories" | "stock";

function ProductInventoryPage() {
  const { role: userRole, loading: roleLoading } = useUserRole();
  const isStaff = STAFF_ROLES.includes(userRole);

  // ALL hooks must be called unconditionally — no early returns before this line
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("products");
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    if (!roleLoading) loadData();
  }, [roleLoading, isStaff]);

  async function loadData() {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        getAllCategories(),
        isStaff ? getAllProducts() : getAllActiveProducts(),
      ]);
      setCategories(cats);
      setProducts(prods);
    } finally {
      setLoading(false);
    }
  }

  // Early returns AFTER all hooks
  if (roleLoading) return <p className="pi-loading">Loading...</p>;

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || p.categoryId.toString() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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
    alert(`Added ${quantity}x ${product.name} to cart (cart module coming soon)`);
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
            <h1>Products</h1>
            {isStaff && (
              <button onClick={() => { setEditingProduct(null); setShowForm(true); }}>
                + Add product
              </button>
            )}
          </div>

          <div className="pi-filters">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pi-search"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="pi-filter-select"
            >
              <option value="all">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <p className="pi-loading">Loading products...</p>
          ) : filteredProducts.length === 0 ? (
            <p className="pi-empty">No products found.</p>
          ) : (
            <div className="pi-grid">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isStaff={isStaff}
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
