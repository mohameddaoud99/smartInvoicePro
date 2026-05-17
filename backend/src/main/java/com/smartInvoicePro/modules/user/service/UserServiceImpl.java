package com.smartInvoicePro.modules.user.service;

import com.smartInvoicePro.exception.BusinessException;
import com.smartInvoicePro.exception.ResourceNotFoundException;
import com.smartInvoicePro.modules.role.entity.Role;
import com.smartInvoicePro.modules.role.repository.RoleRepository;
import com.smartInvoicePro.modules.user.dto.UserRequest;
import com.smartInvoicePro.modules.user.dto.UserResponse;
import com.smartInvoicePro.modules.user.entity.User;
import com.smartInvoicePro.modules.user.mapper.UserMapper;
import com.smartInvoicePro.modules.user.repository.UserRepository;
import com.smartInvoicePro.utils.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public PageResponse<UserResponse> findAll(String search, Pageable pageable) {
        return PageResponse.of(
                userRepository.searchUsers(search, pageable).map(userMapper::toResponse)
        );
    }

    @Override
    public UserResponse findById(Long id) {
        return userMapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional
    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already in use: " + request.getEmail());
        }
        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(resolveRoles(request.getRoleIds()));
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        User user = findOrThrow(id);
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already in use: " + request.getEmail());
        }
        userMapper.updateEntity(request, user);
        user.setRoles(resolveRoles(request.getRoleIds()));
        return userMapper.toResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        findOrThrow(id);
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void toggleActive(Long id) {
        User user = findOrThrow(id);
        user.setActive(!user.isActive());
        userRepository.save(user);
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    private Set<Role> resolveRoles(Set<Long> roleIds) {
        if (roleIds == null || roleIds.isEmpty()) return new HashSet<>();
        Set<Role> roles = new HashSet<>(roleRepository.findAllById(roleIds));
        if (roles.size() != roleIds.size()) {
            throw new BusinessException("One or more roles not found");
        }
        return roles;
    }
}
