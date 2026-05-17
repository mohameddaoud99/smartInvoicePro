package com.smartInvoicePro.modules.quotation.repository;

import com.smartInvoicePro.modules.quotation.entity.Quotation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long> {

    @Query("SELECT q FROM Quotation q JOIN q.customer c WHERE " +
           "LOWER(q.numero) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Quotation> searchQuotations(@Param("search") String search, Pageable pageable);

    @Query("SELECT q FROM Quotation q LEFT JOIN FETCH q.lines l LEFT JOIN FETCH l.product LEFT JOIN FETCH q.customer LEFT JOIN FETCH q.order WHERE q.id = :id")
    Optional<Quotation> findByIdWithLines(@Param("id") Long id);

    @Query("SELECT COUNT(q) FROM Quotation q WHERE q.numero LIKE :prefix%")
    long countByNumeroPrefix(@Param("prefix") String prefix);
}
