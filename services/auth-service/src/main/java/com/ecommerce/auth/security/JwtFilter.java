package com.ecommerce.auth.security;

import com.ecommerce.common.constants.ApplicationConstants;
import com.ecommerce.common.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader(ApplicationConstants.AUTHORIZATION_HEADER);
        
        if (authHeader == null || !authHeader.startsWith(ApplicationConstants.BEARER_PREFIX)) {
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        try {
            if (jwtUtil.validateToken(jwt)) {
                String userId = jwtUtil.extractUserId(jwt);
                
                if (userId != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    // For API Gateway forwarded requests, we can trust the token.
                    // For local auth service processing, we reload the user.
                    UserDetails userDetails = userDetailsService.loadUserByUsername(userId);
                    
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Log warning, let it continue unauthenticated (will be caught by SecurityConfig)
            logger.warn("Invalid JWT token: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
