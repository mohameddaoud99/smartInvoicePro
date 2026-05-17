package com.smartInvoicePro.modules.quotation.controller;

import com.smartInvoicePro.modules.order.dto.StatusUpdateRequest;
import com.smartInvoicePro.modules.quotation.dto.QuotationRequest;
import com.smartInvoicePro.modules.quotation.dto.QuotationResponse;
import com.smartInvoicePro.modules.quotation.service.QuotationService;
import com.smartInvoicePro.utils.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/quotations")
@RequiredArgsConstructor
public class QuotationController {

    private final QuotationService quotationService;

    @GetMapping
    public ResponseEntity<PageResponse<QuotationResponse>> getAll(
            @RequestParam(required = false, defaultValue = "") String search,
            @PageableDefault(size = 10, sort = "id") Pageable pageable) {
        return ResponseEntity.ok(quotationService.findAll(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<QuotationResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(quotationService.findById(id));
    }

    @PostMapping
    public ResponseEntity<QuotationResponse> create(@Valid @RequestBody QuotationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(quotationService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<QuotationResponse> update(@PathVariable Long id, @Valid @RequestBody QuotationRequest request) {
        return ResponseEntity.ok(quotationService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        quotationService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<QuotationResponse> updateStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateRequest request) {
        return ResponseEntity.ok(quotationService.updateStatus(id, request.getStatus()));
    }

    @PostMapping("/{id}/convert")
    public ResponseEntity<QuotationResponse> convertToOrder(@PathVariable Long id) {
        return ResponseEntity.ok(quotationService.convertToOrder(id));
    }

    @Autowired
    private com.smartInvoicePro.modules.invoice.service.InvoiceService invoiceService;

    @PostMapping("/{id}/convert-to-invoice")
    public ResponseEntity<com.smartInvoicePro.modules.invoice.dto.InvoiceResponse> convertToInvoice(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.createFromQuotation(id));
    }
}
