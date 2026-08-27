import { useState } from "react";
import type { Product } from "./types";
import { getExpiryStatus } from "./expiryUtils";

interface ProductCardProps {
  product: Product;
  isStaff: boolean;
  isSignedIn: boolean;
  onAddToCart: (product: Product, quantity: number) => void;
  onEdit: (product: Product) => void;
  onDeactivate: (product: Product) => void;
  onReactivate: (product: Product) => void;
}

function ProductCard({
  product,
  isStaff,
  isSignedIn,
  onAddToCart,
  onEdit,
  onDeactivate,
  onReactivate,
}: ProductCardProps) {
  const [quantity, setQuantity] = useState(1);
  const inStock = product.stockQuantity !== null && product.stockQuantity > 0;
  const expiry = getExpiryStatus(product.expiryDate);

  const cardModifier = !product.active
    ? "product-card--inactive"
    : expiry.isExpired && isStaff
    ? "product-card--expired"
    : expiry.isExpiringSoon && isStaff
    ? "product-card--expiring"
    : "";

  return (
    <div className={`product-card ${cardModifier}`}>
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

        {expiry.formattedDate && (
          <p
            className={`product-card__expiry ${
              isStaff && expiry.isExpired
                ? "product-card__expiry--expired"
                : isStaff && expiry.isExpiringSoon
                ? "product-card__expiry--expiring"
                : ""
            }`}
          >
            Expires: {expiry.formattedDate}
            {isStaff && expiry.isExpired && " (Expired)"}
            {isStaff && expiry.isExpiringSoon && ` (${expiry.label})`}
          </p>
        )}
      </div>

      {/* Customer actions — only for logged-in CUSTOMER with active, non-expired, in-stock products */}
      {isSignedIn && !isStaff && product.active && !expiry.isExpired && inStock && (
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

      {/* Staff actions and status badges */}
      {isStaff && (
        <div className="product-card__staff-actions">
          <div className="product-card__badges">
            {expiry.isExpired && (
              <span className="product-card__badge product-card__badge--expired">
                Expired
              </span>
            )}
            {!expiry.isExpired && expiry.isExpiringSoon && (
              <span className="product-card__badge product-card__badge--expiring">
                {expiry.label}
              </span>
            )}
            {!product.active && (
              <span className="product-card__badge product-card__badge--inactive">
                Inactive
              </span>
            )}
          </div>

          <div className="product-card__buttons">
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
        </div>
      )}
    </div>
  );
}

export default ProductCard;
