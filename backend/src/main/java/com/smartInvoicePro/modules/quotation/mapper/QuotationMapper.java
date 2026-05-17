package com.smartInvoicePro.modules.quotation.mapper;

import com.smartInvoicePro.modules.quotation.dto.QuotationLineResponse;
import com.smartInvoicePro.modules.quotation.dto.QuotationResponse;
import com.smartInvoicePro.modules.quotation.entity.Quotation;
import com.smartInvoicePro.modules.quotation.entity.QuotationLine;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper
public interface QuotationMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerName", expression = "java(quotation.getCustomer().getFirstName() + \" \" + quotation.getCustomer().getLastName())")
    @Mapping(target = "status", expression = "java(quotation.getStatus().name())")
    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "orderNumero", source = "order.numero")
    @Mapping(target = "invoiceId", source = "invoice.id")
    @Mapping(target = "invoiceNumero", source = "invoice.numero")
    @Mapping(target = "lines", source = "lines")
    QuotationResponse toResponse(Quotation quotation);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.libelle")
    QuotationLineResponse toLineResponse(QuotationLine line);

    List<QuotationLineResponse> toLineResponses(List<QuotationLine> lines);
}
