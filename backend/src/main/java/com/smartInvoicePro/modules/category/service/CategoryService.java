package com.smartInvoicePro.modules.category.service;

import com.smartInvoicePro.modules.category.dto.CategoryDTO;
import com.smartInvoicePro.modules.category.dto.CategoryRequestDTO;
import com.smartInvoicePro.utils.PageResponse;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    PageResponse<CategoryDTO> findAll(Pageable pageable);
    List<CategoryDTO> findAllList();
    CategoryDTO findById(Long id);
    CategoryDTO create(CategoryRequestDTO dto);
    CategoryDTO update(Long id, CategoryRequestDTO dto);
    void delete(Long id);
}
