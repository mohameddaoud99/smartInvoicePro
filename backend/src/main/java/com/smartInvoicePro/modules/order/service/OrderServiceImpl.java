package com.smartInvoicePro.modules.order.service;

import com.smartInvoicePro.exception.BusinessException;
import com.smartInvoicePro.exception.ResourceNotFoundException;
import com.smartInvoicePro.modules.customer.entity.Customer;
import com.smartInvoicePro.modules.customer.repository.CustomerRepository;
import com.smartInvoicePro.modules.order.dto.OrderLineRequest;
import com.smartInvoicePro.modules.order.dto.OrderRequest;
import com.smartInvoicePro.modules.order.dto.OrderResponse;
import com.smartInvoicePro.modules.order.entity.Order;
import com.smartInvoicePro.modules.order.entity.OrderLine;
import com.smartInvoicePro.modules.order.entity.OrderStatus;
import com.smartInvoicePro.modules.order.mapper.OrderMapper;
import com.smartInvoicePro.modules.order.repository.OrderRepository;
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

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final OrderMapper orderMapper;

    @Override
    public PageResponse<OrderResponse> findAll(String search, Pageable pageable) {
        return PageResponse.of(
                orderRepository.searchOrders(search != null ? search : "", pageable)
                        .map(orderMapper::toResponse)
        );
    }

    @Override
    public OrderResponse findById(Long id) {
        Order order = orderRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        return orderMapper.toResponse(order);
    }

    @Override
    @Transactional
    public OrderResponse create(OrderRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        Order order = Order.builder()
                .numero(generateNumero(request.getPrefix()))
                .prefix(request.getPrefix())
                .orderDate(request.getOrderDate())
                .discountTotal(request.getDiscountTotal() != null ? request.getDiscountTotal() : BigDecimal.ZERO)
                .tvaExempt(request.isTvaExempt())
                .attachment(request.getAttachment())
                .status(OrderStatus.DRAFT)
                .customer(customer)
                .build();

        buildLines(order, request.getLines());
        calculateTotals(order);

        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public OrderResponse update(Long id, OrderRequest request) {
        Order order = orderRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        if (order.getStatus() != OrderStatus.DRAFT) {
            throw new BusinessException("Only DRAFT orders can be edited");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        order.setOrderDate(request.getOrderDate());
        order.setPrefix(request.getPrefix());
        order.setDiscountTotal(request.getDiscountTotal() != null ? request.getDiscountTotal() : BigDecimal.ZERO);
        order.setTvaExempt(request.isTvaExempt());
        order.setAttachment(request.getAttachment());
        order.setCustomer(customer);

        order.clearLines();
        buildLines(order, request.getLines());
        calculateTotals(order);

        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        if (order.getStatus() != OrderStatus.DRAFT) {
            throw new BusinessException("Only DRAFT orders can be deleted");
        }
        orderRepository.delete(order);
    }

    @Override
    @Transactional
    public OrderResponse updateStatus(Long id, String status) {
        Order order = orderRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));

        OrderStatus newStatus;
        try {
            newStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid status: " + status);
        }

        validateStatusTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);

        return orderMapper.toResponse(orderRepository.save(order));
    }

    // ── Private helpers ──────────────────────────────────────────────

    private String generateNumero(String prefix) {
        String pfx = (prefix != null && !prefix.isBlank()) ? prefix : "CMD";
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String base = pfx + "-" + datePart;
        long count = orderRepository.countByNumeroPrefix(base);
        return base + "-" + String.format("%04d", count + 1);
    }

    private void buildLines(Order order, List<OrderLineRequest> lineRequests) {
        for (OrderLineRequest lr : lineRequests) {
            Product product = productRepository.findById(lr.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", lr.getProductId()));

            BigDecimal unitPrice = lr.getUnitPrice();
            BigDecimal tvaRate = product.getTva();
            BigDecimal totalHT = unitPrice.multiply(BigDecimal.valueOf(lr.getQuantity()));
            BigDecimal totalTTC;

            if (order.isTvaExempt()) {
                totalTTC = totalHT;
            } else {
                BigDecimal tvaAmount = totalHT.multiply(tvaRate).divide(BigDecimal.valueOf(100), 3, RoundingMode.HALF_UP);
                totalTTC = totalHT.add(tvaAmount);
            }

            OrderLine line = OrderLine.builder()
                    .product(product)
                    .quantity(lr.getQuantity())
                    .unitPrice(unitPrice)
                    .tvaRate(tvaRate)
                    .totalHT(totalHT)
                    .totalTTC(totalTTC)
                    .build();

            order.addLine(line);
        }
    }

    private void calculateTotals(Order order) {
        BigDecimal totalHT = order.getLines().stream()
                .map(OrderLine::getTotalHT)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTTC = order.getLines().stream()
                .map(OrderLine::getTotalTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTVA = totalTTC.subtract(totalHT);
        BigDecimal discount = order.getDiscountTotal() != null ? order.getDiscountTotal() : BigDecimal.ZERO;
        BigDecimal finalTTC = totalTTC.subtract(discount);

        order.setTotalHT(totalHT);
        order.setTotalTVA(totalTVA);
        order.setTotalTTC(finalTTC);
        order.setRemainingAmount(finalTTC);
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        if (current == next) return;

        boolean valid = switch (current) {
            case DRAFT -> next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
            case CONFIRMED -> next == OrderStatus.DELIVERED || next == OrderStatus.CANCELLED;
            case DELIVERED, CANCELLED -> false;
        };

        if (!valid) {
            throw new BusinessException("Cannot transition from " + current + " to " + next);
        }
    }
}
