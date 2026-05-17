package com.smartInvoicePro.modules.user.mapper;

import com.smartInvoicePro.modules.role.mapper.RoleMapper;
import com.smartInvoicePro.modules.user.dto.UserRequest;
import com.smartInvoicePro.modules.user.dto.UserResponse;
import com.smartInvoicePro.modules.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(uses = RoleMapper.class)
public interface UserMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "active", ignore = true)
    User toEntity(UserRequest request);

    UserResponse toResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "active", ignore = true)
    void updateEntity(UserRequest request, @MappingTarget User user);
}
