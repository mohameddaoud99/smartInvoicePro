package com.smartInvoicePro.modules.user.service;

import com.smartInvoicePro.modules.user.dto.UserRequest;
import com.smartInvoicePro.modules.user.dto.UserResponse;
import com.smartInvoicePro.utils.PageResponse;
import org.springframework.data.domain.Pageable;

public interface UserService {

    PageResponse<UserResponse> findAll(String search, Pageable pageable);

    UserResponse findById(Long id);

    UserResponse create(UserRequest request);

    UserResponse update(Long id, UserRequest request);

    void delete(Long id);

    void toggleActive(Long id);
}
