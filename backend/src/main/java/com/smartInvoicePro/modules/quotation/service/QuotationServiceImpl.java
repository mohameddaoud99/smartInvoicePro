package com.smartInvoicePro.modules.quotation.service;

import com.smartInvoicePro.exception.BusinessException;
import com.smartInvoicePro.exception.ResourceNotFoundException;
import com.smartInvoicePro.modules.customer.entity.Customer;
import com.smartInvoicePro.modules.customer.repository.CustomerRepository;
import com.smartInvoicePro.modules.order.dto.OrderLineRequest;
import com.smartInvoicePro.modules.order.dto.OrderRequest;
import com.smartInvoicePro.modules.order.dto.OrderResponse;
import com.smartInvoicePro.modules.order.service.OrderService;
import com.smartInvoicePro.modules.order.repository.OrderRepository;
import com.smartInvoicePro.modules.quotation.dto.QuotationLineRequest;
import com.smartInvoicePro.modules.quotation.dto.QuotationRequest;
import com.smartInvoicePro.modules.quotation.dto.QuotationResponse;
import com.smartInvoicePro.modules.quotation.entity.Quotation;
import com.smartInvoicePro.modules.quotation.entity.QuotationLine;
import com.smartInvoicePro.modules.quotation.entity.QuotationStatus;
import com.smartInvoicePro.modules.quotation.mapper.QuotationMapper;
import com.smartInvoicePro.modules.quotation.repository.QuotationRepository;
import com.smartInvoicePro.modules.product.entity.Product;
import com.smartInvoicePro.modules.product.repository.ProductRepository;
import com.smartInvoicePro.utils.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuotationServiceImpl implements QuotationService {

    private final QuotationRepository quotationRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final QuotationMapper quotationMapper;
    private final OrderService orderService;
    private final OrderRepository orderRepository;

    @Override
    public PageResponse<QuotationResponse> findAll(String search, Pageable pageable) {
        return PageResponse.of(
                quotationRepository.searchQuotations(search != null ? search : "", pageable)
                        .map(quotationMapper::toResponse)
        );
    }

    @Override
    public QuotationResponse findById(Long id) {
        Quotation quotation = quotationRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation", id));
        return quotationMapper.toResponse(quotation);
    }

    @Override
    @Transactional
    public QuotationResponse create(QuotationRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        Quotation quotation = Quotation.builder()
                .numero(generateNumero(request.getPrefix()))
                .prefix(request.getPrefix())
                .quotationDate(request.getQuotationDate())
                .validUntil(request.getValidUntil())
                .discountTotal(request.getDiscountTotal() != null ? request.getDiscountTotal() : BigDecimal.ZERO)
                .tvaExempt(request.isTvaExempt())
                .attachment(request.getAttachment())
                .status(QuotationStatus.DRAFT)
                .customer(customer)
                .build();

        buildLines(quotation, request.getLines());
        calculateTotals(quotation);

        return quotationMapper.toResponse(quotationRepository.save(quotation));
    }

    @Override
    @Transactional
    public QuotationResponse update(Long id, QuotationRequest request) {
        Quotation quotation = quotationRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation", id));

        if (quotation.getStatus() != QuotationStatus.DRAFT) {
            throw new BusinessException("Only DRAFT quotations can be edited");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        quotation.setQuotationDate(request.getQuotationDate());
        quotation.setValidUntil(request.getValidUntil());
        quotation.setPrefix(request.getPrefix());
        quotation.setDiscountTotal(request.getDiscountTotal() != null ? request.getDiscountTotal() : BigDecimal.ZERO);
        quotation.setTvaExempt(request.isTvaExempt());
        quotation.setAttachment(request.getAttachment());
        quotation.setCustomer(customer);

        quotation.clearLines();
        buildLines(quotation, request.getLines());
        calculateTotals(quotation);

        return quotationMapper.toResponse(quotationRepository.save(quotation));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Quotation quotation = quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation", id));
        if (quotation.getStatus() != QuotationStatus.DRAFT) {
            throw new BusinessException("Only DRAFT quotations can be deleted");
        }
        quotationRepository.delete(quotation);
    }

    @Override
    @Transactional
    public QuotationResponse updateStatus(Long id, String status) {
        Quotation quotation = quotationRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation", id));

        QuotationStatus newStatus;
        try {
            newStatus = QuotationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid status: " + status);
        }

        validateStatusTransition(quotation.getStatus(), newStatus);
        quotation.setStatus(newStatus);

        return quotationMapper.toResponse(quotationRepository.save(quotation));
    }

    @Override
    @Transactional
    public QuotationResponse convertToOrder(Long id) {
        Quotation quotation = quotationRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation", id));

        if (quotation.getStatus() != QuotationStatus.ACCEPTED) {
            throw new BusinessException("Only ACCEPTED quotations can be converted to an order.");
        }

        if (quotation.getOrder() != null) {
            throw new BusinessException("This quotation has already been converted to an order.");
        }

        // Map quotation to order request
        OrderRequest orderRequest = new OrderRequest();
        orderRequest.setOrderDate(LocalDate.now().atStartOfDay()); // Default to today
        orderRequest.setCustomerId(quotation.getCustomer().getId());
        orderRequest.setDiscountTotal(quotation.getDiscountTotal());
        orderRequest.setTvaExempt(quotation.isTvaExempt());
        orderRequest.setPrefix("CMD");

        List<OrderLineRequest> orderLines = quotation.getLines().stream().map(line -> {
            OrderLineRequest lineRequest = new OrderLineRequest();
            lineRequest.setProductId(line.getProduct().getId());
            lineRequest.setQuantity(line.getQuantity());
            lineRequest.setUnitPrice(line.getUnitPrice());
            return lineRequest;
        }).collect(Collectors.toList());

        orderRequest.setLines(orderLines);

        // Create the order via OrderService
        OrderResponse orderResponse = orderService.create(orderRequest);

        // Link the generated order
        com.smartInvoicePro.modules.order.entity.Order createdOrder = orderRepository.findById(orderResponse.getId())
                .orElseThrow(() -> new BusinessException("Order generation failed."));

        quotation.setOrder(createdOrder);
        quotation.setStatus(QuotationStatus.CONVERTED);

        return quotationMapper.toResponse(quotationRepository.save(quotation));
    }

    // ── Private helpers ──────────────────────────────────────────────

    private String generateNumero(String prefix) {
        String pfx = (prefix != null && !prefix.isBlank()) ? prefix : "DEV";
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String base = pfx + "-" + datePart;
        long count = quotationRepository.countByNumeroPrefix(base);
        return base + "-" + String.format("%04d", count + 1);
    }

    private void buildLines(Quotation quotation, List<QuotationLineRequest> lineRequests) {
        for (QuotationLineRequest lr : lineRequests) {
            Product product = productRepository.findById(lr.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", lr.getProductId()));

            BigDecimal unitPrice = lr.getUnitPrice();
            BigDecimal tvaRate = product.getTva();
            BigDecimal totalHT = unitPrice.multiply(BigDecimal.valueOf(lr.getQuantity()));
            BigDecimal totalTTC;

            if (quotation.isTvaExempt()) {
                totalTTC = totalHT;
            } else {
                BigDecimal tvaAmount = totalHT.multiply(tvaRate).divide(BigDecimal.valueOf(100), 3, RoundingMode.HALF_UP);
                totalTTC = totalHT.add(tvaAmount);
            }

            QuotationLine line = QuotationLine.builder()
                    .product(product)
                    .quantity(lr.getQuantity())
                    .unitPrice(unitPrice)
                    .tvaRate(tvaRate)
                    .totalHT(totalHT)
                    .totalTTC(totalTTC)
                    .build();

            quotation.addLine(line);
        }
    }

    private void calculateTotals(Quotation quotation) {
        BigDecimal totalHT = quotation.getLines().stream()
                .map(QuotationLine::getTotalHT)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTTC = quotation.getLines().stream()
                .map(QuotationLine::getTotalTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTVA = totalTTC.subtract(totalHT);
        BigDecimal discount = quotation.getDiscountTotal() != null ? quotation.getDiscountTotal() : BigDecimal.ZERO;
        BigDecimal finalTTC = totalTTC.subtract(discount);

        quotation.setTotalHT(totalHT);
        quotation.setTotalTVA(totalTVA);
        quotation.setTotalTTC(finalTTC);
    }

    private void validateStatusTransition(QuotationStatus current, QuotationStatus next) {
        if (current == next) return;

        boolean valid = switch (current) {
            case DRAFT -> next == QuotationStatus.SENT || next == QuotationStatus.REJECTED;
            case SENT -> next == QuotationStatus.ACCEPTED || next == QuotationStatus.REJECTED;
            case ACCEPTED -> next == QuotationStatus.CONVERTED || next == QuotationStatus.REJECTED; // allow reject if accepted by mistake
            case REJECTED, CONVERTED -> false;
        };

        if (!valid) {
            throw new BusinessException("Cannot transition from " + current + " to " + next);
        }
    }
}
