package com.ecommerce.auth.dto;

import com.ecommerce.common.dto.AuditDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.Set;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse extends AuditDto {
    private String email;
    private String firstName;
    private String lastName;
    private boolean isActive;
    private Set<String> roles;
}
