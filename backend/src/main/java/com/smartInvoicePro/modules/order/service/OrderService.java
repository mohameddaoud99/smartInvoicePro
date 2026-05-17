package com.smartInvoicePro.modules.order.service;

import com.smartInvoicePro.modules.order.dto.OrderRequest;
import com.smartInvoicePro.modules.order.dto.OrderResponse;
import com.smartInvoicePro.utils.PageResponse;
import org.springframework.data.domain.Pageable;

public interface OrderService {

    PageResponse<OrderResponse> findAll(String search, Pageable pageable);

    OrderResponse findById(Long id);

    OrderResponse create(OrderRequest request);

    OrderResponse update(Long id, OrderRequest request);

    void delete(Long id);

    OrderResponse updateStatus(Long id, String status);
}
