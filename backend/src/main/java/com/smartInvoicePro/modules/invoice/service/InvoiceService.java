package com.smartInvoicePro.modules.invoice.service;

import com.smartInvoicePro.modules.invoice.dto.InvoiceRequest;
import com.smartInvoicePro.modules.invoice.dto.InvoiceResponse;
import com.smartInvoicePro.utils.PageResponse;
import org.springframework.data.domain.Pageable;

public interface InvoiceService {

    PageResponse<InvoiceResponse> findAll(String search, Pageable pageable);

    InvoiceResponse findById(Long id);

    InvoiceResponse create(InvoiceRequest request);

    InvoiceResponse update(Long id, InvoiceRequest request);

    void delete(Long id);

    InvoiceResponse updateStatus(Long id, String status);

    InvoiceResponse createFromQuotation(Long quotationId);

    InvoiceResponse createFromOrder(Long orderId);

    byte[] generatePdf(Long id);
}
