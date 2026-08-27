package com.lankafresh.backend.productinventory.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.lankafresh.backend.config.ResourceNotFoundException;
import com.lankafresh.backend.productinventory.model.Category;
import com.lankafresh.backend.productinventory.model.Product;
import com.lankafresh.backend.productinventory.model.ProductRequestDto;
import com.lankafresh.backend.productinventory.model.ProductResponseDto;
import com.lankafresh.backend.productinventory.model.Stock;
import com.lankafresh.backend.productinventory.repository.CategoryRepository;
import com.lankafresh.backend.productinventory.repository.ProductRepository;
import com.lankafresh.backend.productinventory.repository.StockRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockRepository stockRepository;

    /**
     * Customer listing: Only returns active products whose expiry date
     * has not yet passed. Expired items are excluded from customers.
     */
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getAllActiveProducts() {
        return toDtoList(productRepository.findActiveNonExpired(LocalDate.now()));
    }

    /**
     * Customer category listing: Only returns active, non-expired products.
     */
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getProductsByCategory(Long categoryId) {
        if (!categoryRepository.existsById(categoryId)) {
            throw new ResourceNotFoundException("Category not found with id: " + categoryId);
        }
        return toDtoList(productRepository.findByCategoryIdAndActiveNonExpired(categoryId, LocalDate.now()));
    }

    /**
     * Staff & Branch Manager listing: Returns ALL products including
     * active, inactive, expiring soon, and expired products.
     */
    @Transactional(readOnly = true)
    public List<ProductResponseDto> getAllProducts() {
        return toDtoList(productRepository.findAll());
    }

    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + id));
        return toDto(product);
    }

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

        Stock stock = new Stock(product, 0, 10);
        stockRepository.save(stock);

        return toDto(product);
    }

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

    @Transactional
    public void deactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + id));
        product.setActive(false);
        productRepository.save(product);
    }

    /**
     * Reactivates a previously deactivated product.
     * Makes it visible to customers again.
     */
    @Transactional
    public ProductResponseDto reactivateProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + id));
        product.setActive(true);
        return toDto(productRepository.save(product));
    }

    @Transactional
    public void decrementStock(Long productId, int quantity) {
        Stock stock = stockRepository.findByProductIdForUpdate(productId)
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

    private ProductResponseDto toDto(Product product) {
        Integer stockQty = stockRepository.findByProductId(product.getId())
                .map(Stock::getQuantity)
                .orElse(null);
        return ProductResponseDto.from(product, stockQty);
    }

    private List<ProductResponseDto> toDtoList(List<Product> products) {
        if (products.isEmpty()) {
            return java.util.Collections.emptyList();
        }
        
        List<Long> productIds = products.stream().map(Product::getId).toList();
        java.util.Map<Long, Integer> stockMap = stockRepository.findByProductIdIn(productIds).stream()
                .collect(java.util.stream.Collectors.toMap(
                        stock -> stock.getProduct().getId(),
                        Stock::getQuantity
                ));

        return products.stream()
                .map(p -> ProductResponseDto.from(p, stockMap.get(p.getId())))
                .toList();
    }
}
