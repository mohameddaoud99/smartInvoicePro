package com.smartInvoicePro.modules.customer.service;

import com.smartInvoicePro.exception.BusinessException;
import com.smartInvoicePro.exception.ResourceNotFoundException;
import com.smartInvoicePro.modules.customer.dto.CustomerRequest;
import com.smartInvoicePro.modules.customer.dto.CustomerResponse;
import com.smartInvoicePro.modules.customer.entity.Customer;
import com.smartInvoicePro.modules.customer.mapper.CustomerMapper;
import com.smartInvoicePro.modules.customer.repository.CustomerRepository;
import com.smartInvoicePro.utils.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Override
    public PageResponse<CustomerResponse> findAll(String search, Pageable pageable) {
        return PageResponse.of(
                customerRepository.searchCustomers(search != null ? search : "", pageable).map(customerMapper::toResponse)
        );
    }

    @Override
    public CustomerResponse findById(Long id) {
        return customerMapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public CustomerResponse create(CustomerRequest request) {
        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already in use: " + request.getEmail());
        }
        Customer customer = customerMapper.toEntity(request);
        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public CustomerResponse update(Long id, CustomerRequest request) {
        Customer customer = findOrThrow(id);
        if (!customer.getEmail().equals(request.getEmail()) && customerRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already in use: " + request.getEmail());
        }
        customerMapper.updateEntity(request, customer);
        return customerMapper.toResponse(customerRepository.save(customer));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        findOrThrow(id);
        customerRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void toggleActive(Long id) {
        Customer customer = findOrThrow(id);
        customer.setActive(!customer.isActive());
        customerRepository.save(customer);
    }

    private Customer findOrThrow(Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer", id));
    }
}
