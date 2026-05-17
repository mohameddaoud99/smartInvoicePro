package com.smartInvoicePro.modules.product.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String libelle;
    private String code;
    private String description;
    private BigDecimal tva;
    private BigDecimal prix;
    private Long categoryId;
    private String categoryName;
    private String photo1;
    private String photo2;
    private String photo3;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
