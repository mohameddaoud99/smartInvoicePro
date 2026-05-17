package com.smartInvoicePro.modules.auth.dto;

import com.smartInvoicePro.modules.role.dto.RoleResponse;
import lombok.Builder;
import lombok.Data;

import java.util.Set;

@Data
@Builder
public class AuthResponse {
    private String token;
    private String tokenType;
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private Set<RoleResponse> roles;
}
