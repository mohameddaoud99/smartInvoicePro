package com.smartInvoicePro.modules.product.service.impl;

import com.smartInvoicePro.exception.BusinessException;
import com.smartInvoicePro.exception.ResourceNotFoundException;
import com.smartInvoicePro.modules.category.entity.Category;
import com.smartInvoicePro.modules.category.repository.CategoryRepository;
import com.smartInvoicePro.modules.product.dto.ProductDTO;
import com.smartInvoicePro.modules.product.dto.ProductMapper;
import com.smartInvoicePro.modules.product.dto.ProductRequestDTO;
import com.smartInvoicePro.modules.product.entity.Product;
import com.smartInvoicePro.modules.product.repository.ProductRepository;
import com.smartInvoicePro.modules.product.service.ProductService;
import com.smartInvoicePro.utils.FileStorageService;
import com.smartInvoicePro.utils.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    @Override
    public PageResponse<ProductDTO> findAll(Pageable pageable) {
        return PageResponse.of(productRepository.findAll(pageable).map(ProductMapper::toDTO));
    }

    @Override
    public ProductDTO findById(Long id) {
        return ProductMapper.toDTO(getProductEntity(id));
    }

    @Override
    @Transactional
    public ProductDTO create(ProductRequestDTO dto) {
        if (productRepository.existsByCode(dto.getCode())) {
            throw new BusinessException("Product code already exists");
        }

        Product product = Product.builder()
                .libelle(dto.getLibelle())
                .code(dto.getCode())
                .description(dto.getDescription())
                .tva(dto.getTva())
                .prix(dto.getPrix())
                .build();

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", dto.getCategoryId()));
            product.setCategory(category);
        }

        // Handle photos
        if (dto.getPhoto1() != null && !dto.getPhoto1().isEmpty()) {
            product.setPhoto1(fileStorageService.storeFile(dto.getPhoto1()));
        }
        if (dto.getPhoto2() != null && !dto.getPhoto2().isEmpty()) {
            product.setPhoto2(fileStorageService.storeFile(dto.getPhoto2()));
        }
        if (dto.getPhoto3() != null && !dto.getPhoto3().isEmpty()) {
            product.setPhoto3(fileStorageService.storeFile(dto.getPhoto3()));
        }

        return ProductMapper.toDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public ProductDTO update(Long id, ProductRequestDTO dto) {
        Product product = getProductEntity(id);

        if (!product.getCode().equals(dto.getCode()) && productRepository.existsByCode(dto.getCode())) {
            throw new BusinessException("Product code already exists");
        }

        product.setLibelle(dto.getLibelle());
        product.setCode(dto.getCode());
        product.setDescription(dto.getDescription());
        product.setTva(dto.getTva());
        product.setPrix(dto.getPrix());

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", dto.getCategoryId()));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }

        // Handle photos replacement
        if (dto.getPhoto1() != null && !dto.getPhoto1().isEmpty()) {
            if (product.getPhoto1() != null) fileStorageService.deleteFile(product.getPhoto1());
            product.setPhoto1(fileStorageService.storeFile(dto.getPhoto1()));
        }
        if (dto.getPhoto2() != null && !dto.getPhoto2().isEmpty()) {
            if (product.getPhoto2() != null) fileStorageService.deleteFile(product.getPhoto2());
            product.setPhoto2(fileStorageService.storeFile(dto.getPhoto2()));
        }
        if (dto.getPhoto3() != null && !dto.getPhoto3().isEmpty()) {
            if (product.getPhoto3() != null) fileStorageService.deleteFile(product.getPhoto3());
            product.setPhoto3(fileStorageService.storeFile(dto.getPhoto3()));
        }

        return ProductMapper.toDTO(productRepository.save(product));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Product product = getProductEntity(id);
        
        if (product.getPhoto1() != null) fileStorageService.deleteFile(product.getPhoto1());
        if (product.getPhoto2() != null) fileStorageService.deleteFile(product.getPhoto2());
        if (product.getPhoto3() != null) fileStorageService.deleteFile(product.getPhoto3());
        
        productRepository.delete(product);
    }

    private Product getProductEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));
    }
}
