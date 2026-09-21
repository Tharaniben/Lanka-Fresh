import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import "./SupplierPurchasePage.css";
import type {
  Supplier,
  SupplierInput,
  PurchaseOrder,
  PurchaseOrderStatus,
} from "./types";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  deletePurchaseOrder,
  getErrorMessage,
} from "./api";

const emptySupplierForm: SupplierInput = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  address: "",
  suppliedItems: "",
};

// One row in the "add items" section of the Purchase Order modal.
// Kept as strings while editing so the input fields aren't fighting the
// user over number formatting - converted to real numbers on submit.
interface ItemRow {
  productName: string;
  quantity: string;
  unitCost: string;
}

const emptyItemRow: ItemRow = { productName: "", quantity: "1", unitCost: "" };

const STATUS_OPTIONS: PurchaseOrderStatus[] = [
  "DRAFT",
  "SENT",
  "RECEIVED",
  "CANCELLED",
];

function SupplierPurchasePage() {
  const [activeTab, setActiveTab] = useState<"suppliers" | "orders">(
    "suppliers",
  );

  return (
    <div className="supplier-container">
      <div className="supplier-header">
        <h1>Supplier &amp; Purchase Order Management</h1>
        <div className="tabs">
          <button
            type="button"
            className={`tab-btn ${activeTab === "suppliers" ? "active" : ""}`}
            onClick={() => setActiveTab("suppliers")}
          >
            Suppliers
          </button>
          <button
            type="button"
            className={`tab-btn ${activeTab === "orders" ? "active" : ""}`}
            onClick={() => setActiveTab("orders")}
          >
            Purchase Orders
          </button>
        </div>
      </div>

      {activeTab === "suppliers" ? <SuppliersTab /> : <PurchaseOrdersTab />}
    </div>
  );
}

// ============================================================
// Suppliers tab
// ============================================================

function SuppliersTab() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter inputs (what the user is typing) vs. applied filters (what was
  // actually last searched) are kept separate so typing doesn't refetch on
  // every keystroke - the user clicks "Search" to apply.
  const [nameInput, setNameInput] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateToInput, setDateToInput] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(
    null,
  );

  const loadSuppliers = useCallback(
    async (overrides?: {
      search?: string;
      contactPerson?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getSuppliers({
  search: overrides?.search ?? (nameInput || undefined),
  contactPerson: overrides?.contactPerson ?? (contactInput || undefined),
  dateFrom: overrides?.dateFrom ?? (dateFromInput || undefined),
  dateTo: overrides?.dateTo ?? (dateToInput || undefined),
});
        setSuppliers(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    loadSuppliers({
      search: nameInput || undefined,
      contactPerson: contactInput || undefined,
      dateFrom: dateFromInput || undefined,
      dateTo: dateToInput || undefined,
    });
  }

  function handleClearFilters() {
    setNameInput("");
    setContactInput("");
    setDateFromInput("");
    setDateToInput("");
    loadSuppliers({
      search: undefined,
      contactPerson: undefined,
      dateFrom: undefined,
      dateTo: undefined,
    });
  }

  async function handleSave(input: SupplierInput) {
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, input);
    } else {
      await createSupplier(input);
    }
    await loadSuppliers();
    setModalOpen(false);
    setEditingSupplier(null);
  }

  async function handleDelete(supplier: Supplier) {
    if (!confirm(`Delete supplier "${supplier.name}"? This cannot be undone.`)) {
      return;
    }
    try {
      await deleteSupplier(supplier.id);
      await loadSuppliers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section>
      <div className="control-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <input
            placeholder="Search suppliers by name..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
          <input
            placeholder="Contact person..."
            value={contactInput}
            onChange={(e) => setContactInput(e.target.value)}
          />
          <label className="date-label">
            From
            <input
              type="date"
              value={dateFromInput}
              onChange={(e) => setDateFromInput(e.target.value)}
            />
          </label>
          <label className="date-label">
            To
            <input
              type="date"
              value={dateToInput}
              onChange={(e) => setDateToInput(e.target.value)}
            />
          </label>
          <button type="submit" className="btn-secondary">
            Search
          </button>
          <button type="button" className="btn-secondary" onClick={handleClearFilters}>
            Clear
          </button>
        </form>

        <button
          type="button"
          className="btn-primary"
          onClick={() => {
            setEditingSupplier(null);
            setModalOpen(true);
          }}
        >
          + Add Supplier
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact Person</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Items Supplied</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr className="empty-row">
              <td colSpan={6}>Loading suppliers...</td>
            </tr>
          ) : suppliers.length === 0 ? (
            <tr className="empty-row">
              <td colSpan={6}>No suppliers found.</td>
            </tr>
          ) : (
            suppliers.map((s) => (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.contactPerson}</td>
                <td>{s.phone}</td>
                <td>{s.email || "—"}</td>
                <td>{s.suppliedItems || "—"}</td>
                <td>
                  <button
                    type="button"
                    className="btn-link"
                    onClick={() => {
                      setEditingSupplier(s);
                      setModalOpen(true);
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-link danger"
                    onClick={() => handleDelete(s)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modalOpen && (
        <SupplierModal
          editingSupplier={editingSupplier}
          onSave={handleSave}
          onClose={() => {
            setModalOpen(false);
            setEditingSupplier(null);
          }}
        />
      )}
    </section>
  );
}

interface SupplierModalProps {
  editingSupplier: Supplier | null;
  onSave: (input: SupplierInput) => Promise<void>;
  onClose: () => void;
}

function SupplierModal({ editingSupplier, onSave, onClose }: SupplierModalProps) {
  const [form, setForm] = useState<SupplierInput>(
    editingSupplier
      ? {
          name: editingSupplier.name,
          contactPerson: editingSupplier.contactPerson,
          phone: editingSupplier.phone,
          email: editingSupplier.email ?? "",
          address: editingSupplier.address ?? "",
          suppliedItems: editingSupplier.suppliedItems ?? "",
        }
      : emptySupplierForm,
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(field: keyof SupplierInput, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSave(form);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</h3>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-banner">{error}</p>}

          <div className="form-group">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Contact person</label>
            <input
              value={form.contactPerson}
              onChange={(e) => handleChange("contactPerson", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone</label>
            <input
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Email (optional)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Address (optional)</label>
            <input
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
            />
          </div>

          <div className="form-group">
            <label>Supplied items (comma-separated)</label>
            <input
              value={form.suppliedItems}
              onChange={(e) => handleChange("suppliedItems", e.target.value)}
              placeholder="e.g. Rice, Coconut Oil, Spices"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================
// Purchase Orders tab
// ============================================================

function PurchaseOrdersTab() {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusInput, setStatusInput] = useState<PurchaseOrderStatus | "">("");
  const [contactInput, setContactInput] = useState("");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateToInput, setDateToInput] = useState("");

  const [modalOpen, setModalOpen] = useState(false);

  const loadOrders = useCallback(
    async (overrides?: {
      status?: PurchaseOrderStatus | "";
      contactPerson?: string;
      dateFrom?: string;
      dateTo?: string;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const data = await getPurchaseOrders({
  status: overrides?.status ?? statusInput,
  contactPerson: overrides?.contactPerson ?? (contactInput || undefined),
  dateFrom: overrides?.dateFrom ?? (dateFromInput || undefined),
  dateTo: overrides?.dateTo ?? (dateToInput || undefined),
});
        setOrders(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // Suppliers are needed to populate the "which supplier is this PO for"
  // dropdown when creating a new order.
  useEffect(() => {
    loadOrders();
    getSuppliers()
      .then(setSuppliers)
      .catch((err) => setError(getErrorMessage(err)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    loadOrders({
      status: statusInput,
      contactPerson: contactInput || undefined,
      dateFrom: dateFromInput || undefined,
      dateTo: dateToInput || undefined,
    });
  }

  function handleClearFilters() {
    setStatusInput("");
    setContactInput("");
    setDateFromInput("");
    setDateToInput("");
    loadOrders({ status: "", contactPerson: undefined, dateFrom: undefined, dateTo: undefined });
  }

  async function handleStatusChange(order: PurchaseOrder, newStatus: PurchaseOrderStatus) {
    try {
      await updatePurchaseOrderStatus(order.id, newStatus);
      await loadOrders();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleDelete(order: PurchaseOrder) {
    if (!confirm(`Delete purchase order #${order.id}? This cannot be undone.`)) {
      return;
    }
    try {
      await deletePurchaseOrder(order.id);
      await loadOrders();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  return (
    <section>
      <div className="control-bar">
        <form className="search-form" onSubmit={handleSearchSubmit}>
          <select
            value={statusInput}
            onChange={(e) =>
              setStatusInput(e.target.value as PurchaseOrderStatus | "")
            }
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <input
            placeholder="Supplier contact person..."
            value={contactInput}
            onChange={(e) => setContactInput(e.target.value)}
          />
          <label className="date-label">
            From
            <input
              type="date"
              value={dateFromInput}
              onChange={(e) => setDateFromInput(e.target.value)}
            />
          </label>
          <label className="date-label">
            To
            <input
              type="date"
              value={dateToInput}
              onChange={(e) => setDateToInput(e.target.value)}
            />
          </label>
          <button type="submit" className="btn-secondary">
            Search
          </button>
          <button type="button" className="btn-secondary" onClick={handleClearFilters}>
            Clear
          </button>
        </form>

        <button type="button" className="btn-primary" onClick={() => setModalOpen(true)}>
          + New Purchase Order
        </button>
      </div>

      {error && <p className="error-banner">{error}</p>}

      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Supplier</th>
            <th>Status</th>
            <th>Order Date</th>
            <th>Expected Delivery</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr className="empty-row">
              <td colSpan={7}>Loading purchase orders...</td>
            </tr>
          ) : orders.length === 0 ? (
            <tr className="empty-row">
              <td colSpan={7}>No purchase orders found.</td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.supplier?.name ?? "—"}</td>
                <td>
                  <span className={`status-badge status-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                <td>
                  {order.expectedDeliveryDate
                    ? new Date(order.expectedDeliveryDate).toLocaleDateString()
                    : "—"}
                </td>
                <td>Rs. {order.totalAmount.toFixed(2)}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order, e.target.value as PurchaseOrderStatus)
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn-link danger"
                    onClick={() => handleDelete(order)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {modalOpen && (
        <PurchaseOrderModal
          suppliers={suppliers}
          onSave={async () => {
            await loadOrders();
            setModalOpen(false);
          }}
          onClose={() => setModalOpen(false)}
        />
      )}
    </section>
  );
}

interface PurchaseOrderModalProps {
  suppliers: Supplier[];
  onSave: () => Promise<void>;
  onClose: () => void;
}

function PurchaseOrderModal({ suppliers, onSave, onClose }: PurchaseOrderModalProps) {
  const [supplierId, setSupplierId] = useState<string>(
    suppliers[0] ? String(suppliers[0].id) : "",
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ ...emptyItemRow }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateItem(index: number, field: keyof ItemRow, value: string) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  }

  function addItemRow() {
    setItems((prev) => [...prev, { ...emptyItemRow }]);
  }

  function removeItemRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  // Live total preview - purely visual, the backend recalculates the real
  // total itself (PurchaseOrder.recalculateTotal()) so this can never drift
  // from what actually gets saved.
  const previewTotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const cost = parseFloat(item.unitCost) || 0;
    return sum + qty * cost;
  }, 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!supplierId) {
      setError("Please select a supplier.");
      return;
    }
    if (items.length === 0) {
      setError("Add at least one item.");
      return;
    }

    setSubmitting(true);
    try {
      await createPurchaseOrder({
        supplier: { id: Number(supplierId) },
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        items: items.map((item) => ({
          productName: item.productName,
          quantity: Number(item.quantity),
          unitCost: Number(item.unitCost),
        })),
      });
      await onSave();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content wide" onClick={(e) => e.stopPropagation()}>
        <h3>New Purchase Order</h3>
        <form onSubmit={handleSubmit}>
          {error && <p className="error-banner">{error}</p>}

          <div className="form-group">
            <label>Supplier</label>
            <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              {suppliers.length === 0 && <option value="">No suppliers yet</option>}
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Expected delivery date (optional)</label>
            <input
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            />
          </div>

          <label>Items</label>
          {items.map((item, index) => (
            <div className="item-row" key={index}>
              <input
                className="item-name"
                placeholder="Product name"
                value={item.productName}
                onChange={(e) => updateItem(index, "productName", e.target.value)}
                required
              />
              <input
                className="item-qty"
                type="number"
                min="1"
                placeholder="Qty"
                value={item.quantity}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                required
              />
              <input
                className="item-cost"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Unit cost"
                value={item.unitCost}
                onChange={(e) => updateItem(index, "unitCost", e.target.value)}
                required
              />
              {items.length > 1 && (
                <button
                  type="button"
                  className="remove-item"
                  onClick={() => removeItemRow(index)}
                  aria-label="Remove item"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button type="button" className="add-item-btn" onClick={addItemRow}>
            + Add another item
          </button>

          <div className="order-total">Estimated total: Rs. {previewTotal.toFixed(2)}</div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? "Creating..." : "Create Purchase Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default SupplierPurchasePage;
