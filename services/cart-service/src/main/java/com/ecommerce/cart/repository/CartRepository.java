package com.ecommerce.cart.repository;

import com.ecommerce.cart.entity.Cart;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CartRepository extends CrudRepository<Cart, UUID> {
}
