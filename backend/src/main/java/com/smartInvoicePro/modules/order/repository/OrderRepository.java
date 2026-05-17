package com.smartInvoicePro.modules.order.repository;

import com.smartInvoicePro.modules.order.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o JOIN o.customer c WHERE " +
           "LOWER(o.numero) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Order> searchOrders(@Param("search") String search, Pageable pageable);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.lines l LEFT JOIN FETCH l.product LEFT JOIN FETCH o.customer WHERE o.id = :id")
    Optional<Order> findByIdWithLines(@Param("id") Long id);

    @Query("SELECT COUNT(o) FROM Order o WHERE o.numero LIKE :prefix%")
    long countByNumeroPrefix(@Param("prefix") String prefix);
}
