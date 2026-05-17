package com.smartInvoicePro.modules.customer.dto;

import lombok.Data;

@Data
public class CustomerResponse {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private boolean active;
}
