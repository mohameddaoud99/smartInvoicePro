package com.smartInvoicePro.modules.category.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CategoryRequestDTO {
    @NotBlank(message = "Category name is required")
    private String name;
    private String description;
    private Long parentId;
}
