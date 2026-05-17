package com.smartInvoicePro.modules.product.service;

import com.smartInvoicePro.modules.product.dto.ProductDTO;
import com.smartInvoicePro.modules.product.dto.ProductRequestDTO;
import com.smartInvoicePro.utils.PageResponse;
import org.springframework.data.domain.Pageable;

public interface ProductService {
    PageResponse<ProductDTO> findAll(Pageable pageable);
    ProductDTO findById(Long id);
    ProductDTO create(ProductRequestDTO dto);
    ProductDTO update(Long id, ProductRequestDTO dto);
    void delete(Long id);
}
