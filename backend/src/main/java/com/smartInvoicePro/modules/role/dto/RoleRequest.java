package com.smartInvoicePro.modules.role.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RoleRequest {

    @NotBlank(message = "Role name is required")
    @Pattern(regexp = "^ROLE_[A-Z_]+$", message = "Role name must start with ROLE_ and contain uppercase letters")
    private String name;
}
