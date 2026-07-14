package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.LoginRequest;
import com.ecommerce.auth.dto.LoginResponse;
import com.ecommerce.auth.dto.RegisterRequest;
import com.ecommerce.auth.entity.RefreshToken;
import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.repository.UserRepository;
import com.ecommerce.common.enums.Role;
import com.ecommerce.common.exception.ConflictException;
import com.ecommerce.common.exception.UnauthorizedException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final TokenService tokenService;

    @Value("${app.security.jwt.secret}")
    private String jwtSecret;

    @Value("${app.security.jwt.expiration-ms}")
    private int jwtExpirationMs;

    @Transactional
    public void registerUser(RegisterRequest request) {
        if (userRepository.existsByEmailAndIsDeletedFalse(request.getEmail())) {
            throw new ConflictException("Email is already in use");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .roles(Set.of(Role.CUSTOMER.name()))
                .build();

        userRepository.save(user);
        log.info("Successfully registered user with email: {}", request.getEmail());
    }

    public LoginResponse authenticate(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        org.springframework.security.core.userdetails.User principal = 
                (org.springframework.security.core.userdetails.User) authentication.getPrincipal();

        String accessToken = generateJwtToken(principal.getUsername(), authentication);
        
        return LoginResponse.builder()
                .accessToken(accessToken)
                .expiresIn(jwtExpirationMs)
                .build();
    }

    public RefreshToken generateRefreshToken(String email) {
        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return tokenService.createRefreshToken(user.getId());
    }

    public LoginResponse refreshToken(String requestRefreshToken) {
        // To be implemented via TokenService interaction
        throw new UnsupportedOperationException("Not implemented yet");
    }

    private String generateJwtToken(String userId, Authentication authentication) {
        SecretKey key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));

        return Jwts.builder()
                .subject(userId)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key)
                .compact();
    }
}
