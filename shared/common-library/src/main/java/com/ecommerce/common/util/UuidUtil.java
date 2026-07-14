package com.ecommerce.common.util;

import java.util.UUID;

public final class UuidUtil {
    private UuidUtil() {}

    public static UUID generate() {
        return UUID.randomUUID();
    }

    public static UUID fromString(String uuid) {
        if (uuid == null || uuid.isBlank()) {
            return null;
        }
        return UUID.fromString(uuid);
    }
}
