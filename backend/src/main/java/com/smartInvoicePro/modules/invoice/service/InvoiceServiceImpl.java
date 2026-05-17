package com.smartInvoicePro.modules.invoice.service;

import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.smartInvoicePro.exception.BusinessException;
import com.smartInvoicePro.exception.ResourceNotFoundException;
import com.smartInvoicePro.modules.customer.entity.Customer;
import com.smartInvoicePro.modules.customer.repository.CustomerRepository;
import com.smartInvoicePro.modules.invoice.dto.InvoiceLineRequest;
import com.smartInvoicePro.modules.invoice.dto.InvoiceRequest;
import com.smartInvoicePro.modules.invoice.dto.InvoiceResponse;
import com.smartInvoicePro.modules.invoice.entity.Invoice;
import com.smartInvoicePro.modules.invoice.entity.InvoiceLine;
import com.smartInvoicePro.modules.invoice.entity.InvoiceStatus;
import com.smartInvoicePro.modules.invoice.mapper.InvoiceMapper;
import com.smartInvoicePro.modules.invoice.repository.InvoiceRepository;
import com.smartInvoicePro.modules.order.entity.Order;
import com.smartInvoicePro.modules.order.entity.OrderStatus;
import com.smartInvoicePro.modules.order.repository.OrderRepository;
import com.smartInvoicePro.modules.product.entity.Product;
import com.smartInvoicePro.modules.product.repository.ProductRepository;
import com.smartInvoicePro.modules.quotation.entity.Quotation;
import com.smartInvoicePro.modules.quotation.entity.QuotationStatus;
import com.smartInvoicePro.modules.quotation.repository.QuotationRepository;
import com.smartInvoicePro.utils.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final QuotationRepository quotationRepository;
    private final OrderRepository orderRepository;
    private final InvoiceMapper invoiceMapper;

    @Override
    public PageResponse<InvoiceResponse> findAll(String search, Pageable pageable) {
        return PageResponse.of(
                invoiceRepository.searchInvoices(search != null ? search : "", pageable)
                        .map(invoiceMapper::toResponse)
        );
    }

    @Override
    public InvoiceResponse findById(Long id) {
        Invoice invoice = invoiceRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
        return invoiceMapper.toResponse(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponse create(InvoiceRequest request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        Invoice invoice = Invoice.builder()
                .numero(generateNumero(request.getPrefix()))
                .prefix(request.getPrefix())
                .invoiceDate(request.getInvoiceDate())
                .dueDate(request.getDueDate())
                .discountTotal(request.getDiscountTotal() != null ? request.getDiscountTotal() : BigDecimal.ZERO)
                .tvaExempt(request.isTvaExempt())
                .attachment(request.getAttachment())
                .status(InvoiceStatus.DRAFT)
                .customer(customer)
                .build();

        buildLines(invoice, request.getLines());
        calculateTotals(invoice);

        return invoiceMapper.toResponse(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public InvoiceResponse update(Long id, InvoiceRequest request) {
        Invoice invoice = invoiceRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));

        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new BusinessException("Only DRAFT invoices can be edited");
        }

        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer", request.getCustomerId()));

        invoice.setInvoiceDate(request.getInvoiceDate());
        invoice.setDueDate(request.getDueDate());
        invoice.setPrefix(request.getPrefix());
        invoice.setDiscountTotal(request.getDiscountTotal() != null ? request.getDiscountTotal() : BigDecimal.ZERO);
        invoice.setTvaExempt(request.isTvaExempt());
        invoice.setAttachment(request.getAttachment());
        invoice.setCustomer(customer);

        invoice.clearLines();
        buildLines(invoice, request.getLines());
        calculateTotals(invoice);

        return invoiceMapper.toResponse(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));
        if (invoice.getStatus() != InvoiceStatus.DRAFT) {
            throw new BusinessException("Only DRAFT invoices can be deleted");
        }
        invoiceRepository.delete(invoice);
    }

    @Override
    @Transactional
    public InvoiceResponse updateStatus(Long id, String status) {
        Invoice invoice = invoiceRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));

        InvoiceStatus newStatus;
        try {
            newStatus = InvoiceStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Invalid status: " + status);
        }

        validateStatusTransition(invoice.getStatus(), newStatus);
        invoice.setStatus(newStatus);

        return invoiceMapper.toResponse(invoiceRepository.save(invoice));
    }

    @Override
    @Transactional
    public InvoiceResponse createFromQuotation(Long quotationId) {
        Quotation quotation = quotationRepository.findByIdWithLines(quotationId)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation", quotationId));

        if (quotation.getStatus() != QuotationStatus.ACCEPTED) {
            throw new BusinessException("Only ACCEPTED quotations can be converted to an invoice.");
        }
        if (quotation.getInvoice() != null) {
            throw new BusinessException("This quotation has already been converted to an invoice.");
        }

        Invoice invoice = buildInvoiceFromBase(quotation.getCustomer(), quotation.getDiscountTotal(), quotation.isTvaExempt());
        invoice.setQuotation(quotation);

        // Copy lines
        for (var qLine : quotation.getLines()) {
            InvoiceLine iLine = InvoiceLine.builder()
                    .product(qLine.getProduct())
                    .quantity(qLine.getQuantity())
                    .unitPrice(qLine.getUnitPrice())
                    .tvaRate(qLine.getTvaRate())
                    .totalHT(qLine.getTotalHT())
                    .totalTTC(qLine.getTotalTTC())
                    .build();
            invoice.addLine(iLine);
        }

        calculateTotals(invoice);
        Invoice savedInvoice = invoiceRepository.save(invoice);

        quotation.setInvoice(savedInvoice);
        quotation.setStatus(QuotationStatus.CONVERTED);
        quotationRepository.save(quotation);

        return invoiceMapper.toResponse(savedInvoice);
    }

    @Override
    @Transactional
    public InvoiceResponse createFromOrder(Long orderId) {
        Order order = orderRepository.findByIdWithLines(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BusinessException("Cancelled orders cannot be converted to an invoice.");
        }
        if (order.getInvoice() != null) {
            throw new BusinessException("This order has already been converted to an invoice.");
        }

        Invoice invoice = buildInvoiceFromBase(order.getCustomer(), order.getDiscountTotal(), order.isTvaExempt());
        invoice.setOrder(order);

        // Copy lines
        for (var oLine : order.getLines()) {
            InvoiceLine iLine = InvoiceLine.builder()
                    .product(oLine.getProduct())
                    .quantity(oLine.getQuantity())
                    .unitPrice(oLine.getUnitPrice())
                    .tvaRate(oLine.getTvaRate())
                    .totalHT(oLine.getTotalHT())
                    .totalTTC(oLine.getTotalTTC())
                    .build();
            invoice.addLine(iLine);
        }

        calculateTotals(invoice);
        Invoice savedInvoice = invoiceRepository.save(invoice);

        order.setInvoice(savedInvoice);
        // Order status remains as is (or could be moved to a specific status)
        orderRepository.save(order);

        return invoiceMapper.toResponse(savedInvoice);
    }

    @Override
    public byte[] generatePdf(Long id) {
        Invoice invoice = invoiceRepository.findByIdWithLines(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice", id));

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(document, out);
            document.open();

            // Fonts
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 22);
            Font subHeaderFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);

            // Title
            Paragraph title = new Paragraph("INVOICE", headerFont);
            title.setAlignment(Element.ALIGN_RIGHT);
            document.add(title);
            document.add(new Paragraph(" "));

            // Info Table
            PdfPTable infoTable = new PdfPTable(2);
            infoTable.setWidthPercentage(100);
            infoTable.setWidths(new float[]{1, 1});

            // Company Info (Hardcoded for now, could be dynamic)
            PdfPCell companyCell = new PdfPCell();
            companyCell.setBorder(Rectangle.NO_BORDER);
            companyCell.addElement(new Paragraph("SmartInvoice Pro", subHeaderFont));
            companyCell.addElement(new Paragraph("123 Business Avenue", normalFont));
            companyCell.addElement(new Paragraph("contact@smartinvoice.com", normalFont));
            infoTable.addCell(companyCell);

            // Customer Info
            PdfPCell customerCell = new PdfPCell();
            customerCell.setBorder(Rectangle.NO_BORDER);
            customerCell.setHorizontalAlignment(Element.ALIGN_RIGHT);
            customerCell.addElement(new Paragraph("Bill To:", subHeaderFont));
            Customer c = invoice.getCustomer();
            customerCell.addElement(new Paragraph(c.getFirstName() + " " + c.getLastName(), normalFont));
            if (c.getAddress() != null) customerCell.addElement(new Paragraph(c.getAddress(), normalFont));
            if (c.getEmail() != null) customerCell.addElement(new Paragraph(c.getEmail(), normalFont));
            if (c.getPhone() != null) customerCell.addElement(new Paragraph(c.getPhone(), normalFont));
            infoTable.addCell(customerCell);
            
            document.add(infoTable);
            document.add(new Paragraph(" "));

            // Invoice Details
            PdfPTable detailsTable = new PdfPTable(2);
            detailsTable.setWidthPercentage(100);
            detailsTable.setSpacingBefore(10f);
            detailsTable.setSpacingAfter(20f);
            
            PdfPCell c1 = new PdfPCell(new Paragraph("Invoice No: " + invoice.getNumero(), boldFont));
            c1.setBorder(Rectangle.NO_BORDER);
            detailsTable.addCell(c1);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
            String dateStr = invoice.getInvoiceDate() != null ? invoice.getInvoiceDate().format(formatter) : "";
            PdfPCell c2 = new PdfPCell(new Paragraph("Date: " + dateStr, normalFont));
            c2.setBorder(Rectangle.NO_BORDER);
            c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
            detailsTable.addCell(c2);

            String dueStr = invoice.getDueDate() != null ? invoice.getDueDate().format(formatter) : "N/A";
            PdfPCell c3 = new PdfPCell(new Paragraph("Due Date: " + dueStr, normalFont));
            c3.setBorder(Rectangle.NO_BORDER);
            detailsTable.addCell(c3);

            PdfPCell c4 = new PdfPCell(new Paragraph("Status: " + invoice.getStatus(), normalFont));
            c4.setBorder(Rectangle.NO_BORDER);
            c4.setHorizontalAlignment(Element.ALIGN_RIGHT);
            detailsTable.addCell(c4);

            document.add(detailsTable);

            // Items Table
            boolean showTva = !invoice.isTvaExempt();
            int cols = showTva ? 6 : 4;
            PdfPTable itemsTable = new PdfPTable(cols);
            itemsTable.setWidthPercentage(100);
            if (showTva) {
                itemsTable.setWidths(new float[]{3, 1, 1.5f, 1, 1.5f, 1.5f});
            } else {
                itemsTable.setWidths(new float[]{4, 1, 1.5f, 1.5f});
            }

            // Headers
            addHeaderCell(itemsTable, "Product", boldFont);
            addHeaderCell(itemsTable, "Qty", boldFont);
            addHeaderCell(itemsTable, "Unit Price", boldFont);
            if (showTva) addHeaderCell(itemsTable, "TVA %", boldFont);
            addHeaderCell(itemsTable, "Total HT", boldFont);
            if (showTva) addHeaderCell(itemsTable, "Total TTC", boldFont);

            // Lines
            for (InvoiceLine line : invoice.getLines()) {
                addCell(itemsTable, line.getProduct().getLibelle(), normalFont, Element.ALIGN_LEFT);
                addCell(itemsTable, String.valueOf(line.getQuantity()), normalFont, Element.ALIGN_CENTER);
                addCell(itemsTable, String.format("%.2f", line.getUnitPrice()), normalFont, Element.ALIGN_RIGHT);
                if (showTva) addCell(itemsTable, String.format("%.2f", line.getTvaRate()) + "%", normalFont, Element.ALIGN_RIGHT);
                addCell(itemsTable, String.format("%.2f", line.getTotalHT()), normalFont, Element.ALIGN_RIGHT);
                if (showTva) addCell(itemsTable, String.format("%.2f", line.getTotalTTC()), normalFont, Element.ALIGN_RIGHT);
            }
            document.add(itemsTable);
            document.add(new Paragraph(" "));

            // Totals
            PdfPTable totalsTable = new PdfPTable(2);
            totalsTable.setWidthPercentage(50);
            totalsTable.setHorizontalAlignment(Element.ALIGN_RIGHT);

            addCell(totalsTable, "Total HT:", normalFont, Element.ALIGN_LEFT);
            addCell(totalsTable, String.format("%.2f", invoice.getTotalHT()), normalFont, Element.ALIGN_RIGHT);

            if (invoice.getDiscountTotal() != null && invoice.getDiscountTotal().compareTo(BigDecimal.ZERO) > 0) {
                addCell(totalsTable, "Discount:", normalFont, Element.ALIGN_LEFT);
                addCell(totalsTable, "-" + String.format("%.2f", invoice.getDiscountTotal()), normalFont, Element.ALIGN_RIGHT);
            }

            if (showTva) {
                addCell(totalsTable, "Total TVA:", normalFont, Element.ALIGN_LEFT);
                addCell(totalsTable, String.format("%.2f", invoice.getTotalTVA()), normalFont, Element.ALIGN_RIGHT);
            }

            addCell(totalsTable, "Total TTC:", boldFont, Element.ALIGN_LEFT);
            addCell(totalsTable, String.format("%.2f", invoice.getTotalTTC()), boldFont, Element.ALIGN_RIGHT);

            document.add(totalsTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new BusinessException("Error generating PDF: " + e.getMessage());
        }
    }

    // ── Private helpers ──────────────────────────────────────────────

    private Invoice buildInvoiceFromBase(Customer customer, BigDecimal discount, boolean tvaExempt) {
        return Invoice.builder()
                .numero(generateNumero("FAC"))
                .prefix("FAC")
                .invoiceDate(LocalDate.now().atStartOfDay())
                .dueDate(LocalDate.now().plusDays(30).atStartOfDay())
                .discountTotal(discount != null ? discount : BigDecimal.ZERO)
                .tvaExempt(tvaExempt)
                .status(InvoiceStatus.DRAFT)
                .customer(customer)
                .build();
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setBackgroundColor(new java.awt.Color(240, 240, 240));
        cell.setPadding(5);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, Font font, int alignment) {
        PdfPCell cell = new PdfPCell(new Paragraph(text, font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(alignment);
        table.addCell(cell);
    }

    private String generateNumero(String prefix) {
        String pfx = (prefix != null && !prefix.isBlank()) ? prefix : "FAC";
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String base = pfx + "-" + datePart;
        long count = invoiceRepository.countByNumeroPrefix(base);
        return base + "-" + String.format("%04d", count + 1);
    }

    private void buildLines(Invoice invoice, List<InvoiceLineRequest> lineRequests) {
        for (InvoiceLineRequest lr : lineRequests) {
            Product product = productRepository.findById(lr.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product", lr.getProductId()));

            BigDecimal unitPrice = lr.getUnitPrice();
            BigDecimal tvaRate = product.getTva();
            BigDecimal totalHT = unitPrice.multiply(BigDecimal.valueOf(lr.getQuantity()));
            BigDecimal totalTTC;

            if (invoice.isTvaExempt()) {
                totalTTC = totalHT;
            } else {
                BigDecimal tvaAmount = totalHT.multiply(tvaRate).divide(BigDecimal.valueOf(100), 3, RoundingMode.HALF_UP);
                totalTTC = totalHT.add(tvaAmount);
            }

            InvoiceLine line = InvoiceLine.builder()
                    .product(product)
                    .quantity(lr.getQuantity())
                    .unitPrice(unitPrice)
                    .tvaRate(tvaRate)
                    .totalHT(totalHT)
                    .totalTTC(totalTTC)
                    .build();

            invoice.addLine(line);
        }
    }

    private void calculateTotals(Invoice invoice) {
        BigDecimal totalHT = invoice.getLines().stream()
                .map(InvoiceLine::getTotalHT)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTTC = invoice.getLines().stream()
                .map(InvoiceLine::getTotalTTC)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalTVA = totalTTC.subtract(totalHT);
        BigDecimal discount = invoice.getDiscountTotal() != null ? invoice.getDiscountTotal() : BigDecimal.ZERO;
        BigDecimal finalTTC = totalTTC.subtract(discount);

        invoice.setTotalHT(totalHT);
        invoice.setTotalTVA(totalTVA);
        invoice.setTotalTTC(finalTTC);
    }

    private void validateStatusTransition(InvoiceStatus current, InvoiceStatus next) {
        if (current == next) return;

        boolean valid = switch (current) {
            case DRAFT -> next == InvoiceStatus.SENT || next == InvoiceStatus.CANCELLED;
            case SENT -> next == InvoiceStatus.PAID || next == InvoiceStatus.OVERDUE || next == InvoiceStatus.CANCELLED;
            case OVERDUE -> next == InvoiceStatus.PAID || next == InvoiceStatus.CANCELLED;
            case PAID, CANCELLED -> false;
        };

        if (!valid) {
            throw new BusinessException("Cannot transition from " + current + " to " + next);
        }
    }
}
