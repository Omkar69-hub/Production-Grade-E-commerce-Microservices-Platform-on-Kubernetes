package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.AddressRequest;
import com.ecommerce.auth.dto.AddressResponse;
import com.ecommerce.auth.entity.UserAddress;
import com.ecommerce.auth.repository.UserAddressRepository;
import com.ecommerce.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AddressService {

    private final UserAddressRepository addressRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> getUserAddresses(UUID userId) {
        return addressRepository.findAllByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AddressResponse getAddressById(UUID userId, UUID addressId) {
        UserAddress address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found with id: " + addressId));
        return toResponse(address);
    }

    @Transactional
    public AddressResponse createAddress(UUID userId, AddressRequest request) {
        long existingCount = addressRepository.countByUserId(userId);
        boolean makeDefault = Boolean.TRUE.equals(request.getIsDefault()) || existingCount == 0;

        if (makeDefault && existingCount > 0) {
            clearPreviousDefault(userId);
        }

        UserAddress address = UserAddress.builder()
                .userId(userId)
                .fullName(request.getFullName().trim())
                .phoneNumber(request.getPhoneNumber().trim())
                .street(request.getStreet().trim())
                .city(request.getCity().trim())
                .state(request.getState().trim())
                .zipCode(request.getZipCode().trim())
                .country(request.getCountry() != null ? request.getCountry().trim() : "India")
                .isDefault(makeDefault)
                .build();

        UserAddress saved = addressRepository.save(address);
        log.info("Client address created successfully for user {}: addressId={}", userId, saved.getId());
        return toResponse(saved);
    }

    @Transactional
    public AddressResponse updateAddress(UUID userId, UUID addressId, AddressRequest request) {
        UserAddress address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or unauthorized for id: " + addressId));

        boolean makeDefault = Boolean.TRUE.equals(request.getIsDefault());
        if (makeDefault && !address.isDefault()) {
            clearPreviousDefault(userId);
            address.setDefault(true);
        }

        address.setFullName(request.getFullName().trim());
        address.setPhoneNumber(request.getPhoneNumber().trim());
        address.setStreet(request.getStreet().trim());
        address.setCity(request.getCity().trim());
        address.setState(request.getState().trim());
        address.setZipCode(request.getZipCode().trim());
        if (request.getCountry() != null) {
            address.setCountry(request.getCountry().trim());
        }

        UserAddress updated = addressRepository.save(address);
        log.info("Client address updated successfully for user {}: addressId={}", userId, updated.getId());
        return toResponse(updated);
    }

    @Transactional
    public void deleteAddress(UUID userId, UUID addressId) {
        UserAddress address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or unauthorized for id: " + addressId));

        boolean wasDefault = address.isDefault();
        addressRepository.delete(address);
        log.info("Client address deleted for user {}: addressId={}", userId, addressId);

        // If the deleted address was default, promote another address if available
        if (wasDefault) {
            List<UserAddress> remaining = addressRepository.findAllByUserIdOrderByIsDefaultDescCreatedAtDesc(userId);
            if (!remaining.isEmpty()) {
                UserAddress first = remaining.get(0);
                first.setDefault(true);
                addressRepository.save(first);
                log.info("Promoted next client address to default for user {}: addressId={}", userId, first.getId());
            }
        }
    }

    @Transactional
    public AddressResponse setDefaultAddress(UUID userId, UUID addressId) {
        UserAddress address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found or unauthorized for id: " + addressId));

        if (!address.isDefault()) {
            clearPreviousDefault(userId);
            address.setDefault(true);
            address = addressRepository.save(address);
            log.info("Set default client address for user {}: addressId={}", userId, addressId);
        }

        return toResponse(address);
    }

    private void clearPreviousDefault(UUID userId) {
        addressRepository.findByUserIdAndIsDefaultTrue(userId)
                .ifPresent(existingDefault -> {
                    existingDefault.setDefault(false);
                    addressRepository.save(existingDefault);
                });
    }

    private AddressResponse toResponse(UserAddress address) {
        return AddressResponse.builder()
                .id(address.getId())
                .userId(address.getUserId())
                .fullName(address.getFullName())
                .phoneNumber(address.getPhoneNumber())
                .street(address.getStreet())
                .city(address.getCity())
                .state(address.getState())
                .zipCode(address.getZipCode())
                .country(address.getCountry())
                .isDefault(address.isDefault())
                .createdAt(address.getCreatedAt())
                .updatedAt(address.getUpdatedAt())
                .build();
    }
}
