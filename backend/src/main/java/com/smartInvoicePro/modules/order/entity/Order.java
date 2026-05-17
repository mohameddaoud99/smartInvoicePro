package com.smartInvoicePro.modules.order.entity;

import com.smartInvoicePro.modules.customer.entity.Customer;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String numero;

    @Column(length = 20)
    private String prefix;

    private LocalDateTime orderDate;

    @Column(precision = 28, scale = 3)
    private BigDecimal totalHT;

    @Column(precision = 28, scale = 3)
    @Builder.Default
    private BigDecimal discountTotal = BigDecimal.ZERO;

    @Column(precision = 28, scale = 3)
    private BigDecimal totalTVA;

    @Column(precision = 28, scale = 3)
    private BigDecimal totalTTC;

    @Column(precision = 28, scale = 3)
    private BigDecimal remainingAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private OrderStatus status = OrderStatus.DRAFT;

    @Column(nullable = false)
    @Builder.Default
    private boolean tvaExempt = false;

    private String attachment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderLine> lines = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private com.smartInvoicePro.modules.invoice.entity.Invoice invoice;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public void addLine(OrderLine line) {
        lines.add(line);
        line.setOrder(this);
    }

    public void clearLines() {
        lines.forEach(l -> l.setOrder(null));
        lines.clear();
    }
}
