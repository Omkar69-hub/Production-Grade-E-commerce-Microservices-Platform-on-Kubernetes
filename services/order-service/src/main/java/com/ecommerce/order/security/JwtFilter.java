package com.ecommerce.order.security;

import com.ecommerce.common.constants.ApplicationConstants;
import com.ecommerce.common.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader(ApplicationConstants.AUTHORIZATION_HEADER);
        final String rolesHeader = request.getHeader(ApplicationConstants.USER_ROLE_HEADER);
        
        if (authHeader == null || !authHeader.startsWith(ApplicationConstants.BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        try {
            if (jwtUtil.validateToken(jwt)) {
                String userId = jwtUtil.extractUserId(jwt);
                
                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    
                    List<SimpleGrantedAuthority> authorities = List.of();
                    if (rolesHeader != null && !rolesHeader.isBlank()) {
                        authorities = Arrays.stream(rolesHeader.split(","))
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.trim()))
                                .collect(Collectors.toList());
                    }

                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userId,
                            null,
                            authorities
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            logger.warn("Invalid JWT token: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
