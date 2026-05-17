package com.smartInvoicePro.modules.invoice.entity;

import com.smartInvoicePro.modules.product.entity.Product;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "invoice_lines")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class InvoiceLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private int quantity;

    @Column(precision = 28, scale = 3, nullable = false)
    private BigDecimal unitPrice;

    @Column(precision = 28, scale = 3)
    private BigDecimal tvaRate;

    @Column(precision = 28, scale = 3)
    private BigDecimal totalHT;

    @Column(precision = 28, scale = 3)
    private BigDecimal totalTTC;
}
