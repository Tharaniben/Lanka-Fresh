import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import "./SupplierPurchasePage.css";
import type {
  Supplier,
  SupplierInput,
  PurchaseOrder,
  PurchaseOrderStatus,
  Product,
  LowStockItem,
  NearExpiryItem,
} from "./types";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  updatePurchaseOrderStatus,
  confirmStockReceipt,
  deletePurchaseOrder,
  getProducts,
  getLowStockItems,
  getNearExpiryItems,
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

interface ItemRow {
  productId: string;
  quantity: string;
  unitCost: string;
}

const emptyItemRow: ItemRow = { productId: "", quantity: "1", unitCost: "" };

const SELECTABLE_STATUS_OPTIONS: { status: PurchaseOrderStatus; label: string; desc: string }[] = [
  { status: "DRAFT", label: "Draft", desc: "Order drafted but not yet transmitted." },
  { status: "SENT", label: "Sent", desc: "Purchase order sent to supplier." },
  { status: "RECEIVED", label: "Received", desc: "Shipment physically received at facility." },
  { status: "CANCELLED", label: "Cancelled", desc: "Order voided or discarded." },
];

const ALL_FILTER_STATUSES: PurchaseOrderStatus[] = [
  "DRAFT",
  "SENT",
  "RECEIVED",
  "COMPLETED",
  "CANCELLED",
];

// ============================================================
// MAIN PAGE COMPONENT
// ============================================================

export function SupplierPurchasePage() {
  const [activeTab, setActiveTab] = useState<"suppliers" | "orders">("suppliers");
  const [supplierCount, setSupplierCount] = useState<number>(0);
  const [orderCount, setOrderCount] = useState<number>(0);

  return (
    <div className="sp-page">
      {/* Header */}
      <div className="sp-header">
        <div>
          <h1>Supplier &amp; Purchase Order Management</h1>
          <p>Coordinate vendor suppliers, manage purchase orders, and monitor restocking workflows.</p>
        </div>
      </div>

      {/* Tabs (matching ProductInventory & DeliveryManagement tabs) */}
      <div className="sp-tabs">
        <button
          type="button"
          className={`sp-tab ${activeTab === "suppliers" ? "sp-tab--active" : ""}`}
          onClick={() => setActiveTab("suppliers")}
        >
          Suppliers {supplierCount > 0 && <span className="sp-tab-badge">{supplierCount}</span>}
        </button>
        <button
          type="button"
          className={`sp-tab ${activeTab === "orders" ? "sp-tab--active" : ""}`}
          onClick={() => setActiveTab("orders")}
        >
          Purchase Orders {orderCount > 0 && <span className="sp-tab-badge">{orderCount}</span>}
        </button>
      </div>

      {activeTab === "suppliers" ? (
        <SuppliersTab onCountChange={setSupplierCount} />
      ) : (
        <PurchaseOrdersTab onCountChange={setOrderCount} />
      )}
    </div>
  );
}

// ============================================================
// RESTOCK ALERTS
// ============================================================

function RestockAlertsPanel({ onQuickCreatePO }: { onQuickCreatePO?: () => void }) {
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [nearExpiry, setNearExpiry] = useState<NearExpiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    Promise.all([getLowStockItems(), getNearExpiryItems(7)])
      .then(([low, expiring]) => {
        setLowStock(low);
        setNearExpiry(expiring);
      })
      .catch(() => {
        setLowStock([]);
        setNearExpiry([]);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || (lowStock.length === 0 && nearExpiry.length === 0)) return null;

  return (
    <div className="sp-alert-banner">
      <div className="sp-alert-banner__header" onClick={() => setCollapsed((c) => !c)}>
        <span>
          ⚠️ Restock Alert: {lowStock.length} low stock product(s), {nearExpiry.length} product(s) expiring within 7 days.
        </span>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {onQuickCreatePO && !collapsed && (
            <button
              type="button"
              className="btn-secondary btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                onQuickCreatePO();
              }}
            >
              + Create PO
            </button>
          )}
          <button type="button" className="btn-secondary btn-sm" style={{ padding: "2px 8px" }}>
            {collapsed ? "Show" : "Hide"}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="sp-alert-banner__body">
          {lowStock.length > 0 && (
            <div className="sp-alert-banner__section">
              <h4>Low Stock Items</h4>
              <ul className="sp-alert-banner__list">
                {lowStock.map((item) => (
                  <li key={item.id}>
                    {item.productName} — <strong>{item.quantity}</strong> remaining (Threshold: {item.lowStockThreshold})
                  </li>
                ))}
              </ul>
            </div>
          )}

          {nearExpiry.length > 0 && (
            <div className="sp-alert-banner__section">
              <h4>Expiring Soon (7 Days)</h4>
              <ul className="sp-alert-banner__list">
                {nearExpiry.map((item) => (
                  <li key={item.id}>
                    {item.name} — Expires {new Date(item.expiryDate).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================
// SUPPLIERS TAB
// ============================================================

interface SuppliersTabProps {
  onCountChange?: (count: number) => void;
}

function SuppliersTab({ onCountChange }: SuppliersTabProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState("");
  const [contactInput, setContactInput] = useState("");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateToInput, setDateToInput] = useState("");

  // Popup Modal States
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);

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
        onCountChange?.(data.length);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [nameInput, contactInput, dateFromInput, dateToInput, onCountChange],
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

  async function handleSaveSupplier(input: SupplierInput) {
    if (editingSupplier) {
      await updateSupplier(editingSupplier.id, input);
    } else {
      await createSupplier(input);
    }
    await loadSuppliers();
    setFormModalOpen(false);
    setEditingSupplier(null);
  }

  async function handleConfirmDelete() {
    if (!deletingSupplier) return;
    try {
      await deleteSupplier(deletingSupplier.id);
      await loadSuppliers();
      setDeletingSupplier(null);
    } catch (err) {
      setError(getErrorMessage(err));
      setDeletingSupplier(null);
    }
  }

  return (
    <>
      {/* Stats Summary Row */}
      <div className="sp-stats-row">
        <div className="sp-stats-card">
          <span className="sp-stats-value">{suppliers.length}</span>
          <span className="sp-stats-label">Total Suppliers</span>
        </div>
        <div className="sp-stats-card">
          <span className="sp-stats-value">{suppliers.filter((s) => s.email && s.phone).length}</span>
          <span className="sp-stats-label">Complete Profiles</span>
        </div>
        <div className="sp-stats-card">
          <span className="sp-stats-value">{suppliers.filter((s) => s.suppliedItems).length}</span>
          <span className="sp-stats-label">Catalog Suppliers</span>
        </div>
      </div>

      {/* Filters & Actions */}
      <form className="sp-filters" onSubmit={handleSearchSubmit}>
        <div className="sp-search-wrapper">
          <input
            className="sp-search"
            placeholder="Search supplier name..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
          />
        </div>

        <input
          className="sp-filter-input"
          placeholder="Contact person..."
          value={contactInput}
          onChange={(e) => setContactInput(e.target.value)}
        />

        <div className="sp-filter-date">
          <span>From</span>
          <input
            type="date"
            className="sp-filter-input"
            value={dateFromInput}
            onChange={(e) => setDateFromInput(e.target.value)}
          />
        </div>

        <div className="sp-filter-date">
          <span>To</span>
          <input
            type="date"
            className="sp-filter-input"
            value={dateToInput}
            onChange={(e) => setDateToInput(e.target.value)}
          />
        </div>

        {/* Filter buttons - kept a little distant from each other */}
        <div className="sp-filter-actions">
          <button type="submit" className="btn-secondary">
            Filter
          </button>
          <button type="button" className="btn-secondary" onClick={handleClearFilters}>
            Reset
          </button>
        </div>

        <button
          type="button"
          style={{ marginLeft: "auto" }}
          onClick={() => {
            setEditingSupplier(null);
            setFormModalOpen(true);
          }}
        >
          + Add Supplier
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      {/* Table Card */}
      <div className="sp-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Supplier Name</th>
              <th>Contact Person</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Supplied Items</th>
              <th style={{ width: "230px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="sp-table-empty">
                  Loading suppliers...
                </td>
              </tr>
            ) : suppliers.length === 0 ? (
              <tr>
                <td colSpan={6} className="sp-table-empty">
                  No suppliers found matching current filters.
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr key={s.id}>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.contactPerson}</td>
                  <td>{s.phone}</td>
                  <td>{s.email || "—"}</td>
                  <td>{s.suppliedItems || "—"}</td>
                  <td>
                    {/* Action buttons kept distant from each other with gap: 12px */}
                    <div className="sp-table-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => setViewingSupplier(s)}
                      >
                        Details
                      </button>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => {
                          setEditingSupplier(s);
                          setFormModalOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-outline-danger btn-sm"
                        onClick={() => setDeletingSupplier(s)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Create / Edit Supplier */}
      {formModalOpen && (
        <SupplierFormModal
          editingSupplier={editingSupplier}
          onSave={handleSaveSupplier}
          onClose={() => {
            setFormModalOpen(false);
            setEditingSupplier(null);
          }}
        />
      )}

      {/* MODAL 2: View Supplier Details */}
      {viewingSupplier && (
        <SupplierViewModal
          supplier={viewingSupplier}
          onEdit={() => {
            setEditingSupplier(viewingSupplier);
            setViewingSupplier(null);
            setFormModalOpen(true);
          }}
          onClose={() => setViewingSupplier(null)}
        />
      )}

      {/* MODAL 3: Delete Supplier Confirmation */}
      {deletingSupplier && (
        <SupplierDeleteModal
          supplier={deletingSupplier}
          onConfirm={handleConfirmDelete}
          onClose={() => setDeletingSupplier(null)}
        />
      )}
    </>
  );
}

// ============================================================
// SUPPLIER MODALS (POPUP WINDOWS)
// ============================================================

interface SupplierFormModalProps {
  editingSupplier: Supplier | null;
  onSave: (input: SupplierInput) => Promise<void>;
  onClose: () => void;
}

function SupplierFormModal({ editingSupplier, onSave, onClose }: SupplierFormModalProps) {
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{editingSupplier ? "Edit Supplier" : "Add Supplier"}</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}

          <label>Company Name *</label>
          <input
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g. Ceylon Agro Ltd"
            required
          />

          <label>Contact Person *</label>
          <input
            value={form.contactPerson}
            onChange={(e) => handleChange("contactPerson", e.target.value)}
            placeholder="e.g. Kasun Perera"
            required
          />

          <label>Phone Number *</label>
          <input
            value={form.phone}
            onChange={(e) => handleChange("phone", e.target.value)}
            placeholder="e.g. +94 77 123 4567"
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="e.g. contact@agro.lk"
          />

          <label>Address / Facility</label>
          <textarea
            rows={2}
            value={form.address}
            onChange={(e) => handleChange("address", e.target.value)}
            placeholder="e.g. Main Produce Terminal, Dambulla"
          />

          <label>Supplied Goods</label>
          <input
            value={form.suppliedItems}
            onChange={(e) => handleChange("suppliedItems", e.target.value)}
            placeholder="e.g. Carrots, Potatoes, Red Rice"
          />
          <div className="modal-hint">Comma-separated list of items provided by this supplier.</div>

          {/* Action buttons kept distant with gap: 14px */}
          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : editingSupplier ? "Update Supplier" : "Create Supplier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface SupplierViewModalProps {
  supplier: Supplier;
  onEdit: () => void;
  onClose: () => void;
}

function SupplierViewModal({ supplier, onEdit, onClose }: SupplierViewModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Supplier Details</h2>

        <div className="detail-list">
          <div className="detail-row">
            <span className="detail-label">Supplier Name</span>
            <span className="detail-value">{supplier.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Contact Person</span>
            <span className="detail-value">{supplier.contactPerson}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Phone</span>
            <span className="detail-value">{supplier.phone}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Email</span>
            <span className="detail-value">{supplier.email || "—"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Address</span>
            <span className="detail-value">{supplier.address || "—"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Supplied Goods</span>
            <span className="detail-value">{supplier.suppliedItems || "—"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Registered Date</span>
            <span className="detail-value">
              {supplier.createdAt ? new Date(supplier.createdAt).toLocaleDateString() : "—"}
            </span>
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          <button type="button" onClick={onEdit}>
            Edit Supplier
          </button>
        </div>
      </div>
    </div>
  );
}

interface SupplierDeleteModalProps {
  supplier: Supplier;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

function SupplierDeleteModal({ supplier, onConfirm, onClose }: SupplierDeleteModalProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Delete Supplier</h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 20px" }}>
          Are you sure you want to delete supplier <strong>{supplier.name}</strong>? This action cannot be undone.
        </p>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={handleDelete} disabled={submitting}>
            {submitting ? "Deleting..." : "Delete Supplier"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PURCHASE ORDERS TAB
// ============================================================

interface PurchaseOrdersTabProps {
  onCountChange?: (count: number) => void;
}

function PurchaseOrdersTab({ onCountChange }: PurchaseOrdersTabProps) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusInput, setStatusInput] = useState<PurchaseOrderStatus | "">("");
  const [contactInput, setContactInput] = useState("");
  const [dateFromInput, setDateFromInput] = useState("");
  const [dateToInput, setDateToInput] = useState("");

  // Modals for CRUD operations
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [viewingOrder, setViewingOrder] = useState<PurchaseOrder | null>(null);
  const [statusChangeOrder, setStatusChangeOrder] = useState<PurchaseOrder | null>(null);
  const [confirmingOrder, setConfirmingOrder] = useState<PurchaseOrder | null>(null);
  const [deletingOrder, setDeletingOrder] = useState<PurchaseOrder | null>(null);

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
        onCountChange?.(data.length);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    },
    [statusInput, contactInput, dateFromInput, dateToInput, onCountChange],
  );

  useEffect(() => {
    loadOrders();
    getSuppliers()
      .then(setSuppliers)
      .catch((err) => setError(getErrorMessage(err)));
    getProducts()
      .then(setProducts)
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

  async function handleApplyStatusChange(newStatus: PurchaseOrderStatus) {
    if (!statusChangeOrder) return;
    try {
      await updatePurchaseOrderStatus(statusChangeOrder.id, newStatus);
      await loadOrders();
      setStatusChangeOrder(null);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  async function handleConfirmDeleteOrder() {
    if (!deletingOrder) return;
    try {
      await deletePurchaseOrder(deletingOrder.id);
      await loadOrders();
      setDeletingOrder(null);
    } catch (err) {
      setError(getErrorMessage(err));
      setDeletingOrder(null);
    }
  }

  const activeOrdersCount = orders.filter((o) => o.status === "DRAFT" || o.status === "SENT").length;
  const receivedOrdersCount = orders.filter((o) => o.status === "RECEIVED").length;
  const completedOrdersCount = orders.filter((o) => o.status === "COMPLETED").length;
  const totalSpend = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <>
      <RestockAlertsPanel onQuickCreatePO={() => setCreateModalOpen(true)} />

      {/* Stats Summary Row */}
      <div className="sp-stats-row">
        <div className="sp-stats-card">
          <span className="sp-stats-value">{orders.length}</span>
          <span className="sp-stats-label">Total Purchase Orders</span>
        </div>
        <div className="sp-stats-card">
          <span className="sp-stats-value">{activeOrdersCount}</span>
          <span className="sp-stats-label">Active / Sent</span>
        </div>
        <div className="sp-stats-card">
          <span className="sp-stats-value">{receivedOrdersCount}</span>
          <span className="sp-stats-label">Awaiting Stock Check</span>
        </div>
        <div className="sp-stats-card">
          <span className="sp-stats-value">{completedOrdersCount}</span>
          <span className="sp-stats-label">Completed</span>
        </div>
        <div className="sp-stats-card">
          <span className="sp-stats-value" style={{ fontSize: "1.25rem" }}>
            Rs. {totalSpend.toFixed(2)}
          </span>
          <span className="sp-stats-label">Total Order Value</span>
        </div>
      </div>

      {/* Filters & Actions */}
      <form className="sp-filters" onSubmit={handleSearchSubmit}>
        <select
          className="sp-filter-select"
          value={statusInput}
          onChange={(e) => setStatusInput(e.target.value as PurchaseOrderStatus | "")}
        >
          <option value="">All statuses</option>
          {ALL_FILTER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="sp-search-wrapper">
          <input
            className="sp-search"
            placeholder="Search supplier contact..."
            value={contactInput}
            onChange={(e) => setContactInput(e.target.value)}
          />
        </div>

        <div className="sp-filter-date">
          <span>From</span>
          <input
            type="date"
            className="sp-filter-input"
            value={dateFromInput}
            onChange={(e) => setDateFromInput(e.target.value)}
          />
        </div>

        <div className="sp-filter-date">
          <span>To</span>
          <input
            type="date"
            className="sp-filter-input"
            value={dateToInput}
            onChange={(e) => setDateToInput(e.target.value)}
          />
        </div>

        {/* Spaced filter buttons */}
        <div className="sp-filter-actions">
          <button type="submit" className="btn-secondary">
            Filter
          </button>
          <button type="button" className="btn-secondary" onClick={handleClearFilters}>
            Reset
          </button>
        </div>

        <button
          type="button"
          style={{ marginLeft: "auto" }}
          onClick={() => setCreateModalOpen(true)}
        >
          + New Purchase Order
        </button>
      </form>

      {error && <div className="error-msg">{error}</div>}

      {/* Orders Table Card */}
      <div className="sp-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>PO #</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Order Date</th>
              <th>Expected Delivery</th>
              <th>Total Amount</th>
              <th style={{ width: "300px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="sp-table-empty">
                  Loading purchase orders...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="sp-table-empty">
                  No purchase orders found matching current filters.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>#{order.id}</strong></td>
                  <td>{order.supplier?.name ?? "—"}</td>
                  <td>
                    <span className={`badge badge--${order.status.toLowerCase()}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>
                    {order.expectedDeliveryDate
                      ? new Date(order.expectedDeliveryDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td><strong>Rs. {order.totalAmount.toFixed(2)}</strong></td>
                  <td>
                    {/* Action buttons kept distant with gap: 12px */}
                    <div className="sp-table-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => setViewingOrder(order)}
                      >
                        Details
                      </button>

                      {order.status !== "COMPLETED" && (
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => setStatusChangeOrder(order)}
                        >
                          Status
                        </button>
                      )}

                      {order.status === "RECEIVED" && (
                        <button
                          type="button"
                          className="btn-sm"
                          onClick={() => setConfirmingOrder(order)}
                        >
                          Confirm Stock
                        </button>
                      )}

                      <button
                        type="button"
                        className="btn-outline-danger btn-sm"
                        onClick={() => setDeletingOrder(order)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: Create Purchase Order */}
      {createModalOpen && (
        <PurchaseOrderCreateModal
          suppliers={suppliers}
          products={products}
          onSave={async () => {
            await loadOrders();
            setCreateModalOpen(false);
          }}
          onClose={() => setCreateModalOpen(false)}
        />
      )}

      {/* MODAL 2: View Purchase Order Details */}
      {viewingOrder && (
        <PurchaseOrderViewModal
          order={viewingOrder}
          onOpenStatusModal={() => {
            setStatusChangeOrder(viewingOrder);
            setViewingOrder(null);
          }}
          onOpenConfirmStock={() => {
            setConfirmingOrder(viewingOrder);
            setViewingOrder(null);
          }}
          onClose={() => setViewingOrder(null)}
        />
      )}

      {/* MODAL 3: Update Order Status */}
      {statusChangeOrder && (
        <PurchaseOrderStatusModal
          order={statusChangeOrder}
          onUpdateStatus={handleApplyStatusChange}
          onClose={() => setStatusChangeOrder(null)}
        />
      )}

      {/* MODAL 4: Confirm Stock Receipt */}
      {confirmingOrder && (
        <ConfirmStockModal
          order={confirmingOrder}
          onConfirm={async () => {
            await loadOrders();
            setConfirmingOrder(null);
          }}
          onClose={() => setConfirmingOrder(null)}
        />
      )}

      {/* MODAL 5: Delete Order Confirmation */}
      {deletingOrder && (
        <PurchaseOrderDeleteModal
          order={deletingOrder}
          onConfirm={handleConfirmDeleteOrder}
          onClose={() => setDeletingOrder(null)}
        />
      )}
    </>
  );
}

// ============================================================
// PURCHASE ORDER MODALS (POPUP WINDOWS)
// ============================================================

interface PurchaseOrderCreateModalProps {
  suppliers: Supplier[];
  products: Product[];
  onSave: () => Promise<void>;
  onClose: () => void;
}

function PurchaseOrderCreateModal({
  suppliers,
  products,
  onSave,
  onClose,
}: PurchaseOrderCreateModalProps) {
  const [supplierId, setSupplierId] = useState<string>(
    suppliers[0] ? String(suppliers[0].id) : "",
  );
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ ...emptyItemRow }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateItem(index: number, field: keyof ItemRow, value: string) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === "productId" && !item.unitCost) {
          const picked = products.find((p) => String(p.id) === value);
          if (picked) updated.unitCost = String(picked.price);
        }
        return updated;
      }),
    );
  }

  function addItemRow() {
    setItems((prev) => [...prev, { ...emptyItemRow }]);
  }

  function removeItemRow(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const previewTotal = items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const cost = parseFloat(item.unitCost) || 0;
    return sum + qty * cost;
  }, 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!supplierId) {
      setError("Please select a vendor supplier.");
      return;
    }
    if (items.length === 0 || items.some((item) => !item.productId)) {
      setError("Each item row requires a product selection.");
      return;
    }

    setSubmitting(true);
    try {
      await createPurchaseOrder({
        supplier: { id: Number(supplierId) },
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        items: items.map((item) => ({
          product: { id: Number(item.productId) },
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
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <h2>New Purchase Order</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label>Supplier *</label>
              <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
                {suppliers.length === 0 && <option value="">No suppliers available</option>}
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.contactPerson})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Expected Delivery Date</label>
              <input
                type="date"
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              />
            </div>
          </div>

          <label style={{ marginTop: "16px" }}>Order Items</label>
          {items.map((item, index) => {
            const subtotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unitCost) || 0);
            return (
              <div className="po-item-row" key={index}>
                <select
                  value={item.productId}
                  onChange={(e) => updateItem(index, "productId", e.target.value)}
                  required
                >
                  <option value="">Select product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} {p.stockQuantity != null ? `(${p.stockQuantity} in stock)` : ""}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  min="1"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, "quantity", e.target.value)}
                  required
                />

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  placeholder="Cost (Rs.)"
                  value={item.unitCost}
                  onChange={(e) => updateItem(index, "unitCost", e.target.value)}
                  required
                />

                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", minWidth: "50px", textAlign: "right" }}>
                    Rs. {subtotal.toFixed(2)}
                  </span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      className="po-item-remove-btn"
                      onClick={() => removeItemRow(index)}
                      title="Remove"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          <button type="button" className="btn-add-item" onClick={addItemRow}>
            + Add Another Product
          </button>

          <div className="po-total-box">
            <span>Estimated Total:</span>
            <span className="po-total-value">Rs. {previewTotal.toFixed(2)}</span>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create Purchase Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PurchaseOrderViewModalProps {
  order: PurchaseOrder;
  onOpenStatusModal: () => void;
  onOpenConfirmStock: () => void;
  onClose: () => void;
}

function PurchaseOrderViewModal({
  order,
  onOpenStatusModal,
  onOpenConfirmStock,
  onClose,
}: PurchaseOrderViewModalProps) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <h2>Purchase Order #{order.id}</h2>

        <div className="detail-list" style={{ marginBottom: "20px" }}>
          <div className="detail-row">
            <span className="detail-label">Status</span>
            <span className="detail-value">
              <span className={`badge badge--${order.status.toLowerCase()}`}>
                {order.status}
              </span>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Supplier</span>
            <span className="detail-value">{order.supplier?.name ?? "—"}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Contact Person</span>
            <span className="detail-value">{order.supplier?.contactPerson ?? "—"} ({order.supplier?.phone ?? "—"})</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Order Date</span>
            <span className="detail-value">{new Date(order.orderDate).toLocaleString()}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Expected Delivery</span>
            <span className="detail-value">
              {order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toLocaleDateString() : "—"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Received Date</span>
            <span className="detail-value">
              {order.receivedDate ? new Date(order.receivedDate).toLocaleString() : "Not yet received"}
            </span>
          </div>
        </div>

        <h3 style={{ fontSize: "15px", margin: "16px 0 8px", color: "var(--text)" }}>Order Items</h3>
        <table className="data-table" style={{ marginBottom: "16px" }}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Ordered Qty</th>
              <th>Accepted Qty</th>
              <th>Unit Cost</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items && order.items.length > 0 ? (
              order.items.map((item, idx) => {
                const subtotal = item.subtotal ?? item.quantity * item.unitCost;
                return (
                  <tr key={item.id ?? idx}>
                    <td><strong>{item.productName}</strong></td>
                    <td>{item.quantity}</td>
                    <td>{item.acceptedQuantity != null ? item.acceptedQuantity : "—"}</td>
                    <td>Rs. {item.unitCost.toFixed(2)}</td>
                    <td>Rs. {subtotal.toFixed(2)}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="sp-table-empty">
                  No items in this order.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="po-total-box">
          <span>Total Order Value:</span>
          <span className="po-total-value">Rs. {order.totalAmount.toFixed(2)}</span>
        </div>

        {/* Modal actions kept distant with gap: 14px */}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
          {order.status !== "COMPLETED" && (
            <button type="button" className="btn-secondary" onClick={onOpenStatusModal}>
              Change Status
            </button>
          )}
          {order.status === "RECEIVED" && (
            <button type="button" onClick={onOpenConfirmStock}>
              Confirm Stock
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface PurchaseOrderStatusModalProps {
  order: PurchaseOrder;
  onUpdateStatus: (newStatus: PurchaseOrderStatus) => Promise<void>;
  onClose: () => void;
}

function PurchaseOrderStatusModal({
  order,
  onUpdateStatus,
  onClose,
}: PurchaseOrderStatusModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<PurchaseOrderStatus>(order.status);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (selectedStatus === order.status) {
      onClose();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await onUpdateStatus(selectedStatus);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Update Order Status — #{order.id}</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}

          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 16px" }}>
            Current Status:{" "}
            <span className={`badge badge--${order.status.toLowerCase()}`}>{order.status}</span>
          </p>

          <label>Select Next Status</label>
          {SELECTABLE_STATUS_OPTIONS.map((opt) => (
            <label
              key={opt.status}
              className={`status-radio-option ${selectedStatus === opt.status ? "selected" : ""}`}
            >
              <input
                type="radio"
                name="status"
                value={opt.status}
                checked={selectedStatus === opt.status}
                onChange={() => setSelectedStatus(opt.status)}
              />
              <div>
                <strong>{opt.label}</strong>
                <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>
                  {opt.desc}
                </p>
              </div>
            </label>
          ))}

          <div
            style={{
              fontSize: "12px",
              color: "var(--text-muted)",
              background: "#f8fafc",
              border: "1px solid var(--border)",
              padding: "10px",
              borderRadius: "6px",
              marginTop: "12px",
            }}
          >
            🔔 Status transitions trigger registered <strong>Observer Pattern</strong> components (Stock Restock, Alert Notifications, and Audit Trail).
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ConfirmStockModalProps {
  order: PurchaseOrder;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

function ConfirmStockModal({ order, onConfirm, onClose }: ConfirmStockModalProps) {
  const [accepted, setAccepted] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    order.items.forEach((item) => {
      if (item.id != null) initial[item.id] = String(item.quantity);
    });
    return initial;
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const payload: Record<number, number> = {};
      Object.entries(accepted).forEach(([itemId, qty]) => {
        payload[Number(itemId)] = Number(qty);
      });
      await confirmStockReceipt(order.id, payload);
      await onConfirm();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal--wide" onClick={(e) => e.stopPropagation()}>
        <h2>Confirm Stock Receipt — #{order.id}</h2>
        <form onSubmit={handleSubmit}>
          {error && <div className="error-msg">{error}</div>}

          <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 16px" }}>
            Inspect arrived goods and verify quantities. Confirming advances order to{" "}
            <strong>COMPLETED</strong> and updates stock levels in Product &amp; Inventory.
          </p>

          <table className="data-table" style={{ marginBottom: "16px" }}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Ordered Qty</th>
                <th style={{ width: "150px" }}>Accepted Quantity</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id}>
                  <td><strong>{item.productName}</strong></td>
                  <td>{item.quantity} units</td>
                  <td>
                    <input
                      type="number"
                      min="0"
                      max={item.quantity}
                      style={{ padding: "6px 8px" }}
                      value={item.id != null ? accepted[item.id] ?? "" : ""}
                      onChange={(e) =>
                        item.id != null &&
                        setAccepted((prev) => ({ ...prev, [item.id!]: e.target.value }))
                      }
                      required
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" disabled={submitting}>
              {submitting ? "Updating..." : "Confirm & Update Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface PurchaseOrderDeleteModalProps {
  order: PurchaseOrder;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

function PurchaseOrderDeleteModal({
  order,
  onConfirm,
  onClose,
}: PurchaseOrderDeleteModalProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleDelete() {
    setSubmitting(true);
    try {
      await onConfirm();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>Delete Purchase Order</h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "0 0 20px" }}>
          Are you sure you want to delete <strong>Purchase Order #{order.id}</strong>
          {order.supplier?.name ? ` from supplier ${order.supplier.name}` : ""}? This cannot be undone.
        </p>

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger" onClick={handleDelete} disabled={submitting}>
            {submitting ? "Deleting..." : "Delete Order"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SupplierPurchasePage;
