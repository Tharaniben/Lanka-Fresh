package com.lankafresh.backend.productinventory.service;

import com.lankafresh.backend.config.ResourceNotFoundException;
import com.lankafresh.backend.productinventory.model.*;
import com.lankafresh.backend.productinventory.repository.CategoryRepository;
import com.lankafresh.backend.productinventory.repository.ProductRepository;
import com.lankafresh.backend.productinventory.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Business logic for Product management.
 *
 * Key design decisions:
 * - Stock quantity is fetched alongside product data so the frontend
 *   gets everything in one response (no second API call needed)
 * - Inactive products are hidden from customers but visible to staff
 * - decrementStock() is a public method — Cart & Order Management will
 *   call this when a customer places an order
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockRepository stockRepository;

    /**
     * Returns all ACTIVE products with stock quantities.
     * This is what the customer-facing product listing page calls.
     */
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getAllActiveProducts() {
        return productRepository.findByActiveTrue()
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Returns all active products in a specific category.
     */
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getProductsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }
        return productRepository.findByCategoryIdAndActiveTrue(categoryId)
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Returns ALL products (including inactive) — for inventory staff view.
     */
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Returns one product by ID.
     */
    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + id));
        return toDto(product);
    }

    /**
     * Creates a new product.
     * After creating the product, a Stock record is automatically created
     * with quantity 0 — inventory staff then update it separately.
     */
    @Transactional
    public ProductResponseDto createProduct(ProductRequestDto request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        Product product = new Product(
                request.getName(),
                request.getDescription(),
                request.getPrice(),
                request.getImageUrl(),
                request.getExpiryDate(),
                category
        );
        product = productRepository.save(product);

        // Auto-create a Stock record with 0 quantity for this new product
        Stock stock = new Stock(product, 0, 10);
        stockRepository.save(stock);

        return toDto(product);
    }

    /**
     * Updates an existing product's details.
     * Does not affect stock quantity — use StockService for that.
     */
    @Transactional
    public ProductResponseDto updateProduct(Long id, ProductRequestDto request) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Category not found with id: " + request.getCategoryId()));

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setImageUrl(request.getImageUrl());
        product.setExpiryDate(request.getExpiryDate());
        product.setCategory(category);

        return toDto(productRepository.save(product));
    }

    /**
     * Soft delete — sets active=false instead of deleting.
     * This preserves the product in order history even after it's removed
     * from the catalogue. Real deletion would break past order records.
     */
    @Transactional
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + id));
        product.setActive(false);
        productRepository.save(product);
    }

    /**
     * Called by Cart & Order Management when a customer places an order.
     * Reduces stock by the ordered quantity.
     * Throws IllegalStateException if not enough stock — order placement
     * should check this and show an error to the customer.
     */
    @Transactional
    public void decrementStock(Long productId, int quantity) {
        Stock stock = stockRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Stock not found for product id: " + productId));

        if (stock.getQuantity() < quantity) {
            throw new IllegalStateException(
                    "Insufficient stock for product id: " + productId +
                    ". Available: " + stock.getQuantity() + ", Requested: " + quantity);
        }
        stock.setQuantity(stock.getQuantity() - quantity);
        stockRepository.save(stock);
    }

    /**
     * Helper — converts a Product entity to a ProductResponseDto.
     * Fetches current stock quantity and includes it in the response.
     */
    private ProductResponseDto toDto(Product product) {
        Integer stockQty = stockRepository.findByProductId(product.getId())
                .map(Stock::getQuantity)
                .orElse(null);
        return ProductResponseDto.from(product, stockQty);
    }
}
