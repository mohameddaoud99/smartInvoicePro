package com.smartInvoicePro.modules.invoice.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class InvoiceLineResponse {
    private Long id;
    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal tvaRate;
    private BigDecimal totalHT;
    private BigDecimal totalTTC;
}
