import React, { useState, useEffect } from "react";

const API_BASE = "http://localhost:8080/api/v1/inventory/products";



export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  // Form State for Create / Update
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: 1,
    active: true,
  });

  // 1. READ: Fetch all products from backend
  const fetchProducts = async () => {
    try {
      const res = await fetch(API_BASE);
      const json = await res.json();
      if (json.success && json.data) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch products:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // 2. CREATE & UPDATE Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      active: formData.active,
      category_id: parseInt(formData.categoryId),
    };

    const url = editingId ? `${API_BASE}/${editingId}` : API_BASE;
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        fetchProducts(); // Refresh list after create/update
      } else {
        alert("Action failed. Check backend console.");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
    }
  };

  // Populate form for UPDATE
  const handleEdit = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price || "",
      categoryId: product.category_id || 1,
      active: product.active ?? true,
    });
  };

  // 3. DELETE Handler
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchProducts(); // Refresh list after delete
      } else {
        alert("Failed to delete product.");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      categoryId: 1,
      active: true,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 font-sans">
      <h1 className="text-3xl font-bold mb-6 text-emerald-700">
        LankaFresh Inventory Management
      </h1>

      {/* CREATE / UPDATE FORM */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {editingId ? "Edit Product" : "Add New Product"}
        </h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Price (LKR)</label>
            <input
              type="number"
              step="0.01"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="2"
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500"
            ></textarea>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              name="active"
              id="active"
              checked={formData.active}
              onChange={handleChange}
              className="h-4 w-4 text-emerald-600 border-gray-300 rounded"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700">
              Active / In Stock
            </label>
          </div>

          <div className="md:col-span-2 flex space-x-3 mt-2">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-6 rounded-md shadow"
            >
              {editingId ? "Update Product" : "Create Product"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-400 hover:bg-gray-500 text-white font-medium py-2 px-4 rounded-md shadow"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* READ: PRODUCT TABLE */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <h2 className="text-xl font-semibold p-4 bg-gray-50 border-b text-gray-800">
          Current Inventory Items
        </h2>

        {loading ? (
          <p className="p-4 text-gray-500">Loading products...</p>
        ) : products.length === 0 ? (
          <p className="p-4 text-gray-500">No products found in database.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700 text-sm font-semibold border-b">
                <th className="p-3">ID</th>
                <th className="p-3">Name</th>
                <th className="p-3">Description</th>
                <th className="p-3">Price</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50 text-sm">
                  <td className="p-3 font-mono">{item.id}</td>
                  <td className="p-3 font-semibold text-gray-800">{item.name}</td>
                  <td className="p-3 text-gray-600">{item.description}</td>
                  <td className="p-3 font-medium">LKR {parseFloat(item.price).toFixed(2)}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.active
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-xs px-3 py-1.5 rounded shadow"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs px-3 py-1.5 rounded shadow"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}