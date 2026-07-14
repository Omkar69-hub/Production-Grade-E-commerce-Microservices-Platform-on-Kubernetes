package com.ecommerce.auth.mapper;

import com.ecommerce.auth.dto.UserResponse;
import com.ecommerce.auth.entity.User;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserResponse toResponse(User user);
}
