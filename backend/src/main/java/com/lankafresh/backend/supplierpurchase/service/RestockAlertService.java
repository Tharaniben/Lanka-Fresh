package com.lankafresh.backend.supplierpurchase.service;

import com.lankafresh.backend.productinventory.model.Product;
import com.lankafresh.backend.supplierpurchase.model.NearExpiryProductDto;
import com.lankafresh.backend.supplierpurchase.repository.RestockAlertRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RestockAlertService {

    private final RestockAlertRepository restockAlertRepository;

    public RestockAlertService(RestockAlertRepository restockAlertRepository) {
        this.restockAlertRepository = restockAlertRepository;
    }

    public List<NearExpiryProductDto> getNearExpiryProducts(int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate cutoff = today.plusDays(daysAhead);
        List<Product> products = restockAlertRepository.findNearExpiry(today, cutoff);
        List<NearExpiryProductDto> result = new java.util.ArrayList<>();
        for (Product product : products) {
            result.add(NearExpiryProductDto.from(product));
        }
        return result;
    }
}