package com.smartInvoicePro.modules.role.service;

import com.smartInvoicePro.exception.BusinessException;
import com.smartInvoicePro.exception.ResourceNotFoundException;
import com.smartInvoicePro.modules.role.dto.RoleRequest;
import com.smartInvoicePro.modules.role.dto.RoleResponse;
import com.smartInvoicePro.modules.role.entity.Role;
import com.smartInvoicePro.modules.role.mapper.RoleMapper;
import com.smartInvoicePro.modules.role.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final RoleMapper roleMapper;

    @Override
    public List<RoleResponse> findAll() {
        return roleRepository.findAll().stream()
                .map(roleMapper::toResponse)
                .toList();
    }

    @Override
    public RoleResponse findById(Long id) {
        return roleMapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public RoleResponse create(RoleRequest request) {
        if (roleRepository.existsByName(request.getName())) {
            throw new BusinessException("Role already exists: " + request.getName());
        }
        Role role = roleMapper.toEntity(request);
        return roleMapper.toResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    public RoleResponse update(Long id, RoleRequest request) {
        Role role = findOrThrow(id);
        if (roleRepository.existsByName(request.getName()) && !role.getName().equals(request.getName())) {
            throw new BusinessException("Role name already in use: " + request.getName());
        }
        roleMapper.updateEntity(request, role);
        return roleMapper.toResponse(roleRepository.save(role));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        findOrThrow(id);
        roleRepository.deleteById(id);
    }

    private Role findOrThrow(Long id) {
        return roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role", id));
    }
}
