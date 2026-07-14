package com.ecommerce.common.util;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

public final class DateUtil {
    private DateUtil() {}

    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_INSTANT.withZone(ZoneOffset.UTC);

    public static String formatIso(Instant instant) {
        if (instant == null) return null;
        return ISO_FORMATTER.format(instant);
    }
    
    public static Instant now() {
        return Instant.now();
    }
}
