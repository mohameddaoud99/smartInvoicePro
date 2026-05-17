package com.smartInvoicePro.modules.role.service;

import com.smartInvoicePro.modules.role.dto.RoleRequest;
import com.smartInvoicePro.modules.role.dto.RoleResponse;

import java.util.List;

public interface RoleService {

    List<RoleResponse> findAll();

    RoleResponse findById(Long id);

    RoleResponse create(RoleRequest request);

    RoleResponse update(Long id, RoleRequest request);

    void delete(Long id);
}
