package com.smartInvoicePro.modules.product.dto;

import com.smartInvoicePro.modules.product.entity.Product;

public class ProductMapper {
    
    public static ProductDTO toDTO(Product product) {
        if (product == null) return null;
        
        return ProductDTO.builder()
                .id(product.getId())
                .libelle(product.getLibelle())
                .code(product.getCode())
                .description(product.getDescription())
                .tva(product.getTva())
                .prix(product.getPrix())
                .categoryId(product.getCategory() != null ? product.getCategory().getId() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .photo1(product.getPhoto1())
                .photo2(product.getPhoto2())
                .photo3(product.getPhoto3())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }
}
