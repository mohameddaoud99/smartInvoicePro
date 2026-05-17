package com.smartInvoicePro.modules.category.dto;

import com.smartInvoicePro.modules.category.entity.Category;

public class CategoryMapper {
    
    public static CategoryDTO toDTO(Category category) {
        if (category == null) return null;
        
        return CategoryDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .parentId(category.getParent() != null ? category.getParent().getId() : null)
                .parentName(category.getParent() != null ? category.getParent().getName() : null)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
