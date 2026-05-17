package com.smartInvoicePro.modules.invoice.repository;

import com.smartInvoicePro.modules.invoice.entity.Invoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    @Query("SELECT i FROM Invoice i JOIN i.customer c WHERE " +
           "LOWER(i.numero) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Invoice> searchInvoices(@Param("search") String search, Pageable pageable);

    @Query("SELECT i FROM Invoice i LEFT JOIN FETCH i.lines l LEFT JOIN FETCH l.product LEFT JOIN FETCH i.customer LEFT JOIN FETCH i.quotation LEFT JOIN FETCH i.order WHERE i.id = :id")
    Optional<Invoice> findByIdWithLines(@Param("id") Long id);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.numero LIKE :prefix%")
    long countByNumeroPrefix(@Param("prefix") String prefix);
}
