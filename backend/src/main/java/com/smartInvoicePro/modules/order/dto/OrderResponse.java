package com.smartInvoicePro.modules.order.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {
    private Long id;
    private String numero;
    private String prefix;
    private LocalDateTime orderDate;
    private BigDecimal totalHT;
    private BigDecimal discountTotal;
    private BigDecimal totalTVA;
    private BigDecimal totalTTC;
    private BigDecimal remainingAmount;
    private String status;
    private boolean tvaExempt;
    private String attachment;
    private Long customerId;
    private String customerName;
    private Long invoiceId;
    private String invoiceNumero;
    private List<OrderLineResponse> lines;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
