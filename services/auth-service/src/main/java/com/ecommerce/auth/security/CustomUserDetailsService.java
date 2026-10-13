package com.ecommerce.auth.security;

import com.ecommerce.auth.entity.User;
import com.ecommerce.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user;
        try {
            UUID id = UUID.fromString(identifier);
            user = userRepository.findById(id)
                    .filter(u -> !u.isDeleted())
                    .orElseGet(() -> userRepository.findByEmailAndIsDeletedFalse(identifier)
                            .orElseThrow(() -> new UsernameNotFoundException("User not found: " + identifier)));
        } catch (IllegalArgumentException e) {
            user = userRepository.findByEmailAndIsDeletedFalse(identifier)
                    .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + identifier));
        }

        if (!user.isActive()) {
            throw new UsernameNotFoundException("User account is inactive");
        }

        return new org.springframework.security.core.userdetails.User(
                user.getId().toString(),
                user.getPassword(),
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                        .collect(Collectors.toList())
        );
    }
}
