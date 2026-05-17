package com.smartInvoicePro.modules.quotation.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuotationResponse {
    private Long id;
    private String numero;
    private String prefix;
    private LocalDateTime quotationDate;
    private LocalDateTime validUntil;
    private BigDecimal totalHT;
    private BigDecimal discountTotal;
    private BigDecimal totalTVA;
    private BigDecimal totalTTC;
    private String status;
    private boolean tvaExempt;
    private String attachment;
    private Long customerId;
    private String customerName;
    private Long orderId;
    private String orderNumero;
    private Long invoiceId;
    private String invoiceNumero;
    private List<QuotationLineResponse> lines;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
