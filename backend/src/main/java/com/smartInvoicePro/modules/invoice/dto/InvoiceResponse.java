package com.smartInvoicePro.modules.invoice.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class InvoiceResponse {
    private Long id;
    private String numero;
    private String prefix;
    private LocalDateTime invoiceDate;
    private LocalDateTime dueDate;
    private BigDecimal totalHT;
    private BigDecimal discountTotal;
    private BigDecimal totalTVA;
    private BigDecimal totalTTC;
    private String status;
    private boolean tvaExempt;
    private String attachment;
    private Long customerId;
    private String customerName;
    private Long quotationId;
    private String quotationNumero;
    private Long orderId;
    private String orderNumero;
    private List<InvoiceLineResponse> lines;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
