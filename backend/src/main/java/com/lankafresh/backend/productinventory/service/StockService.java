package com.lankafresh.backend.productinventory.service;

import com.lankafresh.backend.config.ResourceNotFoundException;
import com.lankafresh.backend.productinventory.model.Stock;
import com.lankafresh.backend.productinventory.model.StockResponseDto;
import com.lankafresh.backend.productinventory.model.StockUpdateRequestDto;
import com.lankafresh.backend.productinventory.repository.StockRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StockService {

    private final StockRepository stockRepository;

    /**
     * Returns all stock records — inventory staff view of the whole warehouse.
     */
    @Transactional(readOnly = true)
    public List<StockResponseDto> getAllStock() {
        return stockRepository.findAll()
                .stream()
                .map(StockResponseDto::from)
                .toList();
    }

    /**
     * Returns stock for one specific product.
     */
    @Transactional(readOnly = true)
    public StockResponseDto getStockByProductId(Long productId) {
        Stock stock = stockRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Stock not found for product id: " + productId));
        return StockResponseDto.from(stock);
    }

    /**
     * Returns all products with quantity at or below their low stock threshold.
     * This powers the low-stock alert dashboard for inventory staff.
     */
    @Transactional(readOnly = true)
    public List<StockResponseDto> getLowStockItems() {
        return stockRepository.findLowStockItems()
                .stream()
                .map(StockResponseDto::from)
                .toList();
    }

    /**
     * Updates stock quantity and/or low stock threshold.
     * Used when new stock arrives from a supplier (restocking).
     * If lowStockThreshold is not provided in the request, keeps the existing value.
     */
    @Transactional
    public StockResponseDto updateStock(Long productId, StockUpdateRequestDto request) {
        Stock stock = stockRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Stock not found for product id: " + productId));

        stock.setQuantity(request.getQuantity());

        // Only update threshold if provided in the request
        if (request.getLowStockThreshold() != null) {
            stock.setLowStockThreshold(request.getLowStockThreshold());
        }

        return StockResponseDto.from(stockRepository.save(stock));
    }
}
