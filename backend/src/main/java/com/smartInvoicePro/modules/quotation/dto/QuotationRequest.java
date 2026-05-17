package com.smartInvoicePro.modules.quotation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuotationRequest {

    @NotNull(message = "Quotation date is required")
    private LocalDateTime quotationDate;

    private LocalDateTime validUntil;

    @NotNull(message = "Customer is required")
    private Long customerId;

    @Size(max = 20, message = "Prefix must be 20 characters or less")
    private String prefix;

    private BigDecimal discountTotal = BigDecimal.ZERO;

    private boolean tvaExempt = false;

    private String attachment;

    @NotEmpty(message = "At least one quotation line is required")
    @Valid
    private List<QuotationLineRequest> lines;
}
