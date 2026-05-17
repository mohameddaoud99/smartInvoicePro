package com.smartInvoicePro.modules.role.mapper;

import com.smartInvoicePro.modules.role.dto.RoleRequest;
import com.smartInvoicePro.modules.role.dto.RoleResponse;
import com.smartInvoicePro.modules.role.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper
public interface RoleMapper {

    Role toEntity(RoleRequest request);

    RoleResponse toResponse(Role role);

    void updateEntity(RoleRequest request, @MappingTarget Role role);
}
