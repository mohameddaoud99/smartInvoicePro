package com.smartInvoicePro.modules.auth;

import com.smartInvoicePro.exception.BusinessException;
import com.smartInvoicePro.modules.auth.dto.AuthResponse;
import com.smartInvoicePro.modules.auth.dto.LoginRequest;
import com.smartInvoicePro.modules.auth.dto.RegisterRequest;
import com.smartInvoicePro.modules.role.entity.Role;
import com.smartInvoicePro.modules.role.repository.RoleRepository;
import com.smartInvoicePro.modules.user.entity.User;
import com.smartInvoicePro.modules.user.repository.UserRepository;
import com.smartInvoicePro.modules.role.dto.RoleResponse;
import com.smartInvoicePro.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        String token = jwtUtil.generateToken(user);
        return buildResponse(user, token);
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException("Email already in use: " + request.getEmail());
        }
        Role defaultRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new BusinessException("Default role ROLE_USER not found. Please seed the database."));

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .active(true)
                .roles(Set.of(defaultRole))
                .build();

        userRepository.save(user);
        String token = jwtUtil.generateToken(user);
        return buildResponse(user, token);
    }

    private AuthResponse buildResponse(User user, String token) {
        Set<RoleResponse> roles = user.getRoles().stream()
                .map(role -> {
                    RoleResponse r = new RoleResponse();
                    r.setId(role.getId());
                    r.setName(role.getName());
                    return r;
                })
                .collect(Collectors.toSet());

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .roles(roles)
                .build();
    }
}
