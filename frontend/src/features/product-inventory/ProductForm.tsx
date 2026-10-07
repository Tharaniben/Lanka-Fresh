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
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Product name is required");
      return;
    }
    if (!categoryId) {
      setError("Please select a category");
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError("Price must be greater than zero");
      return;
    }
    if (expiryDate && !product) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const chosen = new Date(expiryDate);
      if (chosen < today) {
        setError("Expiry date cannot be in the past for a new product");
        return;
      }
    }
    setError("");
    setLoading(true);
    try {
      await onSubmit({
        name: trimmedName,
        description: description.trim(),
        price: parsedPrice,
        imageUrl: imageUrl.trim(),
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
            maxLength={150}
            required
          />

          <label htmlFor="pf-description">Description</label>
          <textarea
            id="pf-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
          />

          <label htmlFor="pf-price">Price (LKR)</label>
          <input
            id="pf-price"
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onKeyDown={(e) => {
              if (e.key === "-" || e.key === "e" || e.key === "+") {
                e.preventDefault();
              }
            }}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || (!val.includes("-") && Number(val) >= 0)) {
                setPrice(val);
              }
            }}
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
            maxLength={500}
          />

          <label htmlFor="pf-expiry">Expiry date (optional)</label>
          <input
            id="pf-expiry"
            type="date"
            min={!product ? new Date().toISOString().split("T")[0] : undefined}
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
