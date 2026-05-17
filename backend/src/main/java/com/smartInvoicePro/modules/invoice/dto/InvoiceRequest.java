package com.smartInvoicePro.modules.invoice.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InvoiceRequest {

    @NotNull(message = "Invoice date is required")
    private LocalDateTime invoiceDate;

    private LocalDateTime dueDate;

    @NotNull(message = "Customer is required")
    private Long customerId;

    @Size(max = 20, message = "Prefix must be 20 characters or less")
    private String prefix;

    private BigDecimal discountTotal = BigDecimal.ZERO;

    private boolean tvaExempt = false;

    private String attachment;

    @NotEmpty(message = "At least one invoice line is required")
    @Valid
    private List<InvoiceLineRequest> lines;
}
