package com.smartInvoicePro.modules.order.mapper;

import com.smartInvoicePro.modules.order.dto.OrderLineResponse;
import com.smartInvoicePro.modules.order.dto.OrderResponse;
import com.smartInvoicePro.modules.order.entity.Order;
import com.smartInvoicePro.modules.order.entity.OrderLine;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public interface OrderMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", expression = "java(order.getCustomer().getFirstName() + \" \" + order.getCustomer().getLastName())")
    @Mapping(target = "status", expression = "java(order.getStatus().name())")
    @Mapping(target = "invoiceId", source = "invoice.id")
    @Mapping(target = "invoiceNumero", source = "invoice.numero")
    @Mapping(target = "lines", source = "lines")
    OrderResponse toResponse(Order order);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.libelle")
    OrderLineResponse toLineResponse(OrderLine line);

    List<OrderLineResponse> toLineResponses(List<OrderLine> lines);
}
