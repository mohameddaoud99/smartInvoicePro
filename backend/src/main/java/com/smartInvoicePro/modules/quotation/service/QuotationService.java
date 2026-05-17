package com.smartInvoicePro.modules.quotation.service;

import com.smartInvoicePro.modules.quotation.dto.QuotationRequest;
import com.smartInvoicePro.modules.quotation.dto.QuotationResponse;
import com.smartInvoicePro.utils.PageResponse;
import org.springframework.data.domain.Pageable;

public interface QuotationService {

    PageResponse<QuotationResponse> findAll(String search, Pageable pageable);

    QuotationResponse findById(Long id);

    QuotationResponse create(QuotationRequest request);

    QuotationResponse update(Long id, QuotationRequest request);

    void delete(Long id);

    QuotationResponse updateStatus(Long id, String status);

    QuotationResponse convertToOrder(Long id);
}
