import { useState, type FormEvent } from "react";
import type { Category, Product } from "./types";

interface ProductFormProps {
  categories: Category[];
  product?: Product | null;  // if provided, we're editing; if null, we're creating
  onSubmit: (data: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    expiryDate: string | null;
    categoryId: number;
  }) => Promise<void>;
  onCancel: () => void;
}

function ProductForm({ categories, product, onSubmit, onCancel }: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [price, setPrice] = useState(product?.price?.toString() ?? "");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl ?? "");
  const [expiryDate, setExpiryDate] = useState(product?.expiryDate ?? "");
  const [categoryId, setCategoryId] = useState(
    product?.categoryId?.toString() ?? (categories[0]?.id.toString() ?? "")
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!categoryId) { setError("Please select a category"); return; }
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        expiryDate: expiryDate || null,
        categoryId: parseInt(categoryId),
      });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{product ? "Edit Product" : "Add New Product"}</h2>
        <form onSubmit={handleSubmit}>
          <label htmlFor="pf-name">Product name</label>
          <input
            id="pf-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="pf-description">Description</label>
          <textarea
            id="pf-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />

          <label htmlFor="pf-price">Price (LKR)</label>
          <input
            id="pf-price"
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />

          <label htmlFor="pf-category">Category</label>
          <select
            id="pf-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <label htmlFor="pf-image">Image URL</label>
          <input
            id="pf-image"
            type="text"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://..."
          />

          <label htmlFor="pf-expiry">Expiry date (optional)</label>
          <input
            id="pf-expiry"
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />

          {error && <p className="field-error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" disabled={loading}>
              {loading ? "Saving..." : product ? "Save changes" : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
