package com.smartInvoicePro.modules.invoice.entity;

import com.smartInvoicePro.modules.customer.entity.Customer;
import com.smartInvoicePro.modules.order.entity.Order;
import com.smartInvoicePro.modules.quotation.entity.Quotation;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "invoices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String numero;

    @Column(length = 20)
    private String prefix;

    private LocalDateTime invoiceDate;

    private LocalDateTime dueDate;

    @Column(precision = 28, scale = 3)
    private BigDecimal totalHT;

    @Column(precision = 28, scale = 3)
    @Builder.Default
    private BigDecimal discountTotal = BigDecimal.ZERO;

    @Column(precision = 28, scale = 3)
    private BigDecimal totalTVA;

    @Column(precision = 28, scale = 3)
    private BigDecimal totalTTC;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(nullable = false)
    @Builder.Default
    private boolean tvaExempt = false;

    private String attachment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @OneToMany(mappedBy = "invoice", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<InvoiceLine> lines = new ArrayList<>();

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quotation_id")
    private Quotation quotation;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id")
    private Order order;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public void addLine(InvoiceLine line) {
        lines.add(line);
        line.setInvoice(this);
    }

    public void clearLines() {
        lines.forEach(l -> l.setInvoice(null));
        lines.clear();
    }
}
