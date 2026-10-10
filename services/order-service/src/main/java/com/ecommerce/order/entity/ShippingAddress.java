package com.ecommerce.order.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingAddress {
    @Column(name = "shipping_full_name", nullable = false)
    private String fullName;
    
    @Column(name = "shipping_street", nullable = false)
    private String street;
    
    @Column(name = "shipping_city", nullable = false)
    private String city;
    
    @Column(name = "shipping_state", nullable = false)
    private String state;
    
    @Column(name = "shipping_zip_code", nullable = false)
    private String zipCode;
    
    @Column(name = "shipping_country", nullable = false)
    private String country;
    
    @Column(name = "shipping_phone_number", nullable = false)
    private String phoneNumber;
}
