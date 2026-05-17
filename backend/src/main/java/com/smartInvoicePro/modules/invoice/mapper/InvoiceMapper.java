package com.smartInvoicePro.modules.invoice.mapper;

import com.smartInvoicePro.modules.invoice.dto.InvoiceLineResponse;
import com.smartInvoicePro.modules.invoice.dto.InvoiceResponse;
import com.smartInvoicePro.modules.invoice.entity.Invoice;
import com.smartInvoicePro.modules.invoice.entity.InvoiceLine;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public interface InvoiceMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", expression = "java(invoice.getCustomer().getFirstName() + \" \" + invoice.getCustomer().getLastName())")
    @Mapping(target = "status", expression = "java(invoice.getStatus().name())")
    @Mapping(target = "quotationId", source = "quotation.id")
    @Mapping(target = "quotationNumero", source = "quotation.numero")
    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "orderNumero", source = "order.numero")
    @Mapping(target = "lines", source = "lines")
    InvoiceResponse toResponse(Invoice invoice);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.libelle")
    InvoiceLineResponse toLineResponse(InvoiceLine line);

    List<InvoiceLineResponse> toLineResponses(List<InvoiceLine> lines);
}
