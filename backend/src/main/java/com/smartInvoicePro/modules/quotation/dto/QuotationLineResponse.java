package com.smartInvoicePro.modules.quotation.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class QuotationLineResponse {
    private Long id;
    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal tvaRate;
    private BigDecimal totalHT;
    private BigDecimal totalTTC;
}
