import { useState } from "react";
import type { Category } from "./types";
import { createCategory, updateCategory, deleteCategory } from "./productService";

interface CategoryTabProps {
  categories: Category[];
  onRefresh: () => void;
}

function CategoryTab({ categories, onRefresh }: CategoryTabProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [editing, setEditing] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (!name.trim()) { setError("Name is required"); return; }
    setError("");
    setLoading(true);
    try {
      if (editing) {
        await updateCategory(editing.id, { name, description });
      } else {
        await createCategory({ name, description });
      }
      setName("");
      setDescription("");
      setEditing(null);
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  function startEdit(cat: Category) {
    setEditing(cat);
    setName(cat.name);
    setDescription(cat.description ?? "");
    setError("");
  }

  function cancelEdit() {
    setEditing(null);
    setName("");
    setDescription("");
    setError("");
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete category "${cat.name}"? Products in this category must be reassigned first.`)) return;
    try {
      await deleteCategory(cat.id);
      onRefresh();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      alert(e.response?.data?.message ?? "Could not delete category");
    }
  }

  return (
    <div className="tab-content">
      <h2>Categories</h2>

      {/* Add / Edit form */}
      <div className="form-card">
        <h3>{editing ? `Editing: ${editing.name}` : "Add new category"}</h3>
        <label htmlFor="cat-name">Name</label>
        <input
          id="cat-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Fruits"
        />
        <label htmlFor="cat-desc">Description</label>
        <input
          id="cat-desc"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional"
        />
        {error && <p className="field-error">{error}</p>}
        <div className="form-actions">
          {editing && (
            <button className="btn-secondary" onClick={cancelEdit}>
              Cancel
            </button>
          )}
          <button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : editing ? "Save changes" : "Add category"}
          </button>
        </div>
      </div>

      {/* Category list */}
      <table className="data-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>{cat.description ?? "—"}</td>
              <td>
                <button className="btn-secondary btn-sm" onClick={() => startEdit(cat)}>
                  Edit
                </button>
                <button className="btn-danger btn-sm" onClick={() => handleDelete(cat)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {categories.length === 0 && (
            <tr>
              <td colSpan={3}>No categories yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default CategoryTab;
