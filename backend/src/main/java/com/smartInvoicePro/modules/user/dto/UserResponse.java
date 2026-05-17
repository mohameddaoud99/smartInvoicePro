package com.smartInvoicePro.modules.user.dto;

import com.smartInvoicePro.modules.role.dto.RoleResponse;
import lombok.Data;

import java.util.Set;

@Data
public class UserResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private boolean active;
    private Set<RoleResponse> roles;
}
