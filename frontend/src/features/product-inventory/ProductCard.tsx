import { useState } from "react";
import type { Product } from "./types";

interface ProductCardProps {
  product: Product;
  isStaff: boolean;
  onAddToCart: (product: Product, quantity: number) => void;
  onEdit: (product: Product) => void;
  onDeactivate: (product: Product) => void;
  onReactivate: (product: Product) => void;
}

function ProductCard({
  product,
  isStaff,
  onAddToCart,
  onEdit,
  onDeactivate,
  onReactivate,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const inStock = product.stockQuantity !== null && product.stockQuantity > 0;

  return (
    <div className={`product-card ${!product.active ? "product-card--inactive" : ""}`}>
      <div className="product-card__image">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} />
        ) : (
          <div className="product-card__image-placeholder">No image</div>
        )}
      </div>

      <div className="product-card__body">
        <span className="product-card__category">{product.categoryName}</span>
        <h3 className="product-card__name">{product.name}</h3>
        {product.description && (
          <p className="product-card__description">{product.description}</p>
        )}
        <p className="product-card__price">LKR {product.price.toFixed(2)}</p>
        <p className={`product-card__stock ${!inStock ? "product-card__stock--out" : ""}`}>
          {inStock ? `In stock: ${product.stockQuantity}` : "Out of stock"}
        </p>
        {product.expiryDate && (
          <p className="product-card__expiry">
            Expires: {new Date(product.expiryDate).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Customer actions — only for active, in-stock products */}
      {!isStaff && product.active && inStock && (
        <div className="product-card__actions">
          <div className="product-card__quantity">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} disabled={quantity <= 1}>−</button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity((q) => Math.min(product.stockQuantity ?? 1, q + 1))}
              disabled={quantity >= (product.stockQuantity ?? 1)}
            >+</button>
          </div>
          <button className="product-card__add-to-cart" onClick={() => onAddToCart(product, quantity)}>
            Add to cart
          </button>
        </div>
      )}

      {/* Staff actions */}
      {isStaff && (
        <div className="product-card__staff-actions">
          {!product.active && (
            <span className="product-card__badge">Inactive</span>
          )}
          <button className="btn-secondary" onClick={() => onEdit(product)}>
            Edit
          </button>
          {product.active ? (
            <button className="btn-danger" onClick={() => onDeactivate(product)}>
              Deactivate
            </button>
          ) : (
            <button className="btn-success" onClick={() => onReactivate(product)}>
              Reactivate
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductCard;
