package com.ecommerce.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressRequest {

    @NotBlank(message = "Full client recipient name is required")
    @Size(min = 2, max = 150, message = "Full name must be between 2 and 150 characters")
    private String fullName;

    @NotBlank(message = "Contact phone number is required")
    @Pattern(regexp = "^\\+?[1-9][\\d\\s\\-]{7,18}$", message = "Valid international or Indian phone format required (e.g. +91 98765 43210 or 9876543210)")
    private String phoneNumber;

    @NotBlank(message = "Street address is required")
    @Size(min = 5, max = 255, message = "Street address must be between 5 and 255 characters")
    private String street;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 100, message = "City must be between 2 and 100 characters")
    private String city;

    @NotBlank(message = "State or Province is required")
    @Size(min = 2, max = 100, message = "State must be between 2 and 100 characters")
    private String state;

    @NotBlank(message = "Postal PIN code is required")
    @Size(min = 4, max = 20, message = "PIN / Postal code must be between 4 and 20 characters")
    private String zipCode;

    @NotBlank(message = "Country is required")
    @Size(min = 2, max = 100, message = "Country must be between 2 and 100 characters")
    @Builder.Default
    private String country = "India";

    private Boolean isDefault;
}
