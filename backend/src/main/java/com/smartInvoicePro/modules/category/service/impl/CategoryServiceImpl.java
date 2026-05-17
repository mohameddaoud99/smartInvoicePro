package com.smartInvoicePro.modules.category.service.impl;

import com.smartInvoicePro.exception.BusinessException;
import com.smartInvoicePro.exception.ResourceNotFoundException;
import com.smartInvoicePro.modules.category.dto.CategoryDTO;
import com.smartInvoicePro.modules.category.dto.CategoryMapper;
import com.smartInvoicePro.modules.category.dto.CategoryRequestDTO;
import com.smartInvoicePro.modules.category.entity.Category;
import com.smartInvoicePro.modules.category.repository.CategoryRepository;
import com.smartInvoicePro.modules.category.service.CategoryService;
import com.smartInvoicePro.utils.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    public PageResponse<CategoryDTO> findAll(Pageable pageable) {
        return PageResponse.of(categoryRepository.findAll(pageable).map(CategoryMapper::toDTO));
    }

    @Override
    public List<CategoryDTO> findAllList() {
        return categoryRepository.findAll().stream()
                .map(CategoryMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CategoryDTO findById(Long id) {
        return CategoryMapper.toDTO(getCategoryEntity(id));
    }

    @Override
    @Transactional
    public CategoryDTO create(CategoryRequestDTO dto) {
        if (categoryRepository.existsByName(dto.getName())) {
            throw new BusinessException("Category name already exists");
        }

        Category category = Category.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .build();

        if (dto.getParentId() != null) {
            Category parent = getCategoryEntity(dto.getParentId());
            category.setParent(parent);
        }

        return CategoryMapper.toDTO(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public CategoryDTO update(Long id, CategoryRequestDTO dto) {
        Category category = getCategoryEntity(id);

        if (!category.getName().equals(dto.getName()) && categoryRepository.existsByName(dto.getName())) {
            throw new BusinessException("Category name already exists");
        }

        // Prevent circular dependency
        if (dto.getParentId() != null && dto.getParentId().equals(id)) {
            throw new BusinessException("A category cannot be its own parent");
        }

        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        if (dto.getParentId() != null) {
            Category parent = getCategoryEntity(dto.getParentId());
            category.setParent(parent);
        } else {
            category.setParent(null);
        }

        return CategoryMapper.toDTO(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!categoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Category", id);
        }
        categoryRepository.deleteById(id);
    }

    private Category getCategoryEntity(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }
}
