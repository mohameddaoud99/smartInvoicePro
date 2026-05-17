package com.smartInvoicePro.modules.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Data
public class ProductRequestDTO {

    @NotBlank(message = "Libelle is required")
    private String libelle;

    @NotBlank(message = "Code is required")
    private String code;

    private String description;

    @NotNull(message = "TVA is required")
    private BigDecimal tva;

    @NotNull(message = "Prix is required")
    private BigDecimal prix;

    private Long categoryId;

    private MultipartFile photo1;
    private MultipartFile photo2;
    private MultipartFile photo3;
}
