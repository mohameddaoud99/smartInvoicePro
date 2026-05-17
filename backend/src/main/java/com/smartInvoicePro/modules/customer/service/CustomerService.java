package com.smartInvoicePro.modules.customer.service;

import com.smartInvoicePro.modules.customer.dto.CustomerRequest;
import com.smartInvoicePro.modules.customer.dto.CustomerResponse;
import com.smartInvoicePro.utils.PageResponse;
import org.springframework.data.domain.Pageable;

public interface CustomerService {

    PageResponse<CustomerResponse> findAll(String search, Pageable pageable);

    CustomerResponse findById(Long id);

    CustomerResponse create(CustomerRequest request);

    CustomerResponse update(Long id, CustomerRequest request);

    void delete(Long id);

    void toggleActive(Long id);
}
