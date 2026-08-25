import { useState, useEffect } from "react";
import type { Stock } from "./types";
import { getAllStock, getLowStockItems, updateStock } from "./productService";

function StockTab() {
  const [stock, setStock] = useState<Stock[]>([]);
  const [lowStock, setLowStock] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editQty, setEditQty] = useState("");
  const [editThreshold, setEditThreshold] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [allStock, lowStockItems] = await Promise.all([
        getAllStock(),
        getLowStockItems(),
      ]);
      setStock(allStock);
      setLowStock(lowStockItems);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function startEdit(item: Stock) {
    setEditingId(item.productId);
    setEditQty(item.quantity.toString());
    setEditThreshold(item.lowStockThreshold.toString());
  }

  async function saveEdit(productId: number) {
    setSaving(true);
    try {
      await updateStock(productId, {
        quantity: parseInt(editQty),
        lowStockThreshold: parseInt(editThreshold),
      });
      setEditingId(null);
      load();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p>Loading stock...</p>;

  return (
    <div className="tab-content">
      <h2>Stock Management</h2>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div className="alert alert--warning">
          <strong>⚠ Low stock alert:</strong> {lowStock.length} product(s) need restocking.
        </div>
      )}

      <table className="data-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Low stock threshold</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {stock.map((item) => (
            <tr key={item.id} className={item.lowStock ? "row--warning" : ""}>
              <td>{item.productName}</td>
              <td>
                {editingId === item.productId ? (
                  <input
                    type="number"
                    min="0"
                    value={editQty}
                    onChange={(e) => setEditQty(e.target.value)}
                    className="inline-input"
                  />
                ) : (
                  item.quantity
                )}
              </td>
              <td>
                {editingId === item.productId ? (
                  <input
                    type="number"
                    min="0"
                    value={editThreshold}
                    onChange={(e) => setEditThreshold(e.target.value)}
                    className="inline-input"
                  />
                ) : (
                  item.lowStockThreshold
                )}
              </td>
              <td>
                {item.lowStock ? (
                  <span className="badge badge--warning">Low stock</span>
                ) : (
                  <span className="badge badge--ok">OK</span>
                )}
              </td>
              <td>
                {editingId === item.productId ? (
                  <>
                    <button
                      className="btn-sm"
                      onClick={() => saveEdit(item.productId)}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="btn-secondary btn-sm"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button className="btn-secondary btn-sm" onClick={() => startEdit(item)}>
                    Update
                  </button>
                )}
              </td>
            </tr>
          ))}
          {stock.length === 0 && (
            <tr>
              <td colSpan={5}>No stock records yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default StockTab;
