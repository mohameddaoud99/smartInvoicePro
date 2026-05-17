package com.smartInvoicePro.modules.customer.mapper;

import com.smartInvoicePro.modules.customer.dto.CustomerRequest;
import com.smartInvoicePro.modules.customer.dto.CustomerResponse;
import com.smartInvoicePro.modules.customer.entity.Customer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper
public interface CustomerMapper {

    @Mapping(target = "id", ignore = true)
    Customer toEntity(CustomerRequest request);

    CustomerResponse toResponse(Customer customer);

    @Mapping(target = "id", ignore = true)
    void updateEntity(CustomerRequest request, @MappingTarget Customer customer);
}
