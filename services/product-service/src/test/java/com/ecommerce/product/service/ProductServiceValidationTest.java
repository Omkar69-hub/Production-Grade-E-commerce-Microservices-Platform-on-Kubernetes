package com.ecommerce.product.service;

import com.ecommerce.common.exception.ValidationException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("LUMIÈRE Stage 6D: Backend URL & Attribute Security Validation")
class ProductServiceValidationTest {

    private ProductService productService;

    @BeforeEach
    void setUp() {
        ObjectMapper objectMapper = new ObjectMapper();
        productService = new ProductService(null, null, null, null, null, objectMapper);
    }

    @Test
    @DisplayName("Should pass when attributes are null or blank (legacy compatibility)")
    void givenNullOrBlankAttributes_whenValidate_thenPasses() {
        assertDoesNotThrow(() -> productService.validateAttributes(null));
        assertDoesNotThrow(() -> productService.validateAttributes(""));
        assertDoesNotThrow(() -> productService.validateAttributes("   "));
    }

    @Test
    @DisplayName("Should accept valid HTTPS URL with authentic atelier attributes")
    void givenValidHttpsUrlAndAttributes_whenValidate_thenPasses() {
        String json = "{"
                + "\"isReferral\":true,"
                + "\"fulfillmentType\":\"REFERRAL_LINK\","
                + "\"destinationUrl\":\"https://www.sabyasachi.com/collection/heritage-bridal/\","
                + "\"destinationType\":\"OFFICIAL_CATEGORY_DESTINATION\","
                + "\"priceVerificationStatus\":\"PRICE_UPON_INQUIRY\""
                + "}";
        assertDoesNotThrow(() -> productService.validateAttributes(json));
    }

    @Test
    @DisplayName("Should reject plain HTTP protocol in destinationUrl")
    void givenHttpScheme_whenValidate_thenThrowsValidationException() {
        String json = "{\"destinationUrl\":\"http://www.sabyasachi.com/bridal\"}";
        ValidationException ex = assertThrows(ValidationException.class, () -> productService.validateAttributes(json));
        assertTrue(ex.getMessage().contains("must use secure HTTPS protocol"));
    }

    @Test
    @DisplayName("Should reject dangerous javascript: execution scheme")
    void givenDangerousSchemeJavascript_whenValidate_thenThrowsValidationException() {
        String json = "{\"destinationUrl\":\"javascript:alert(1)\"}";
        ValidationException ex = assertThrows(ValidationException.class, () -> productService.validateAttributes(json));
        assertTrue(ex.getMessage().contains("Dangerous protocol disallowed"));
    }

    @Test
    @DisplayName("Should reject dangerous data: scheme")
    void givenDangerousSchemeData_whenValidate_thenThrowsValidationException() {
        String json = "{\"destinationUrl\":\"data:text/html,<script>alert(1)</script>\"}";
        ValidationException ex = assertThrows(ValidationException.class, () -> productService.validateAttributes(json));
        assertTrue(ex.getMessage().contains("Dangerous protocol disallowed"));
    }

    @Test
    @DisplayName("Should reject embedded user credentials in destinationUrl")
    void givenEmbeddedCredentialsInUrl_whenValidate_thenThrowsValidationException() {
        String json = "{\"destinationUrl\":\"https://admin:secret@sabyasachi.com/collections\"}";
        ValidationException ex = assertThrows(ValidationException.class, () -> productService.validateAttributes(json));
        assertTrue(ex.getMessage().contains("Embedded credentials in destination URL are disallowed"));
    }

    @Test
    @DisplayName("Should reject malformed URL syntax")
    void givenMalformedUrlSyntax_whenValidate_thenThrowsValidationException() {
        String json = "{\"destinationUrl\":\"not a valid url at all\"}";
        ValidationException ex = assertThrows(ValidationException.class, () -> productService.validateAttributes(json));
        assertTrue(ex.getMessage().contains("must use secure HTTPS protocol") || ex.getMessage().contains("syntax"));
    }

    @Test
    @DisplayName("Should reject destination URL with missing or invalid host boundary")
    void givenMissingOrInvalidHost_whenValidate_thenThrowsValidationException() {
        String jsonMissingHost = "{\"destinationUrl\":\"https:///path\"}";
        ValidationException ex1 = assertThrows(ValidationException.class, () -> productService.validateAttributes(jsonMissingHost));
        assertTrue(ex1.getMessage().contains("hostname"));

        String jsonNoBoundary = "{\"destinationUrl\":\"https://localhostwithoutdot/path\"}";
        ValidationException ex2 = assertThrows(ValidationException.class, () -> productService.validateAttributes(jsonNoBoundary));
        assertTrue(ex2.getMessage().contains("domain boundary"));
    }

    @Test
    @DisplayName("Should reject deceptive hostname patterns with TLD segments in internal labels")
    void givenDeceptiveHostnameSuffix_whenValidate_thenThrowsValidationException() {
        String json = "{\"destinationUrl\":\"https://sabyasachi.com.attacker.test/phishing\"}";
        ValidationException ex = assertThrows(ValidationException.class, () -> productService.validateAttributes(json));
        assertTrue(ex.getMessage().contains("Deceptive hostname structure"));
    }

    @Test
    @DisplayName("Should reject test and non-routable domains (.test, .example, .invalid, .localhost)")
    void givenTestOrReservedDomain_whenValidate_thenThrowsValidationException() {
        String json = "{\"destinationUrl\":\"https://shop.atelier.test/products\"}";
        ValidationException ex = assertThrows(ValidationException.class, () -> productService.validateAttributes(json));
        assertTrue(ex.getMessage().contains("test or reserved domain"));
    }

    @Test
    @DisplayName("Should reject open-redirect query parameters")
    void givenOpenRedirectParam_whenValidate_thenThrowsValidationException() {
        String json = "{\"destinationUrl\":\"https://www.sabyasachi.com/item?redirect=http://evil.com\"}";
        ValidationException ex = assertThrows(ValidationException.class, () -> productService.validateAttributes(json));
        assertTrue(ex.getMessage().contains("unverified open-redirect query parameters"));
    }

    @Test
    @DisplayName("Should reject invalid or unsupported destinationType")
    void givenInvalidDestinationType_whenValidate_thenThrowsValidationException() {
        String json = "{\"destinationType\":\"RANDOM_THIRD_PARTY_BLOG\"}";
        ValidationException ex = assertThrows(ValidationException.class, () -> productService.validateAttributes(json));
        assertTrue(ex.getMessage().contains("Invalid destinationType"));
    }

    @Test
    @DisplayName("Should reject invalid or unsupported priceVerificationStatus")
    void givenInvalidPriceVerificationStatus_whenValidate_thenThrowsValidationException() {
        String json = "{\"priceVerificationStatus\":\"FREE_SAMPLE\"}";
        ValidationException ex = assertThrows(ValidationException.class, () -> productService.validateAttributes(json));
        assertTrue(ex.getMessage().contains("Invalid priceVerificationStatus"));
    }

    @Test
    @DisplayName("Should reject malformed JSON in attributes string")
    void givenMalformedJson_whenValidate_thenThrowsValidationException() {
        String malformedJson = "{destinationUrl: not-valid-json}";
        ValidationException ex = assertThrows(ValidationException.class, () -> productService.validateAttributes(malformedJson));
        assertTrue(ex.getMessage().contains("Attributes must be valid JSON"));
    }

    @Test
    @DisplayName("Should reject non-object JSON (arrays, primitives)")
    void givenNonObjectJson_whenValidate_thenThrowsValidationException() {
        String arrayJson = "[\"https://www.sabyasachi.com\"]";
        ValidationException ex = assertThrows(ValidationException.class, () -> productService.validateAttributes(arrayJson));
        assertTrue(ex.getMessage().contains("Attributes must be a valid JSON object"));
    }

    @Test
    @DisplayName("DOCUMENTED ARCHITECTURAL LIMITATION: Structural checks pass syntactically valid external domains")
    void documentedLimitation_validSyntaxDoesNotEstablishBrandOwnership() {
        // A syntactically valid URL that belongs to Brand B or a third party will pass structural validation
        // because product-service currently lacks an authoritative brand-domain registry table or whitelist.
        String crossBrandJson = "{"
                + "\"isReferral\":true,"
                + "\"fulfillmentType\":\"REFERRAL_LINK\","
                + "\"destinationUrl\":\"https://www.anitadongre.com/women/clothing/sarees/\","
                + "\"destinationType\":\"OFFICIAL_CATEGORY_DESTINATION\","
                + "\"priceVerificationStatus\":\"VERIFIED_ATELIER_PRICE\""
                + "}";
        // This passes structural validation because it is valid HTTPS, has no embedded credentials, and valid host boundary.
        // Full brand-domain boundary binding currently resides in the frontend domainVerifier.
        assertDoesNotThrow(() -> productService.validateAttributes(crossBrandJson));
    }

    @org.junit.jupiter.api.Nested
    @DisplayName("Stage 8D.1: Strict Referral & Zero-Price Product Eligibility Tests")
    class PriceProtectionTests {

        @Test
        @DisplayName("Should accept valid positive price with null, empty, or ordinary styling attributes")
        void givenPositivePrice_whenValidate_thenPasses() {
            assertDoesNotThrow(() -> productService.validateProductPricing(new java.math.BigDecimal("199.99"), null));
            assertDoesNotThrow(() -> productService.validateProductPricing(new java.math.BigDecimal("0.01"), ""));
            assertDoesNotThrow(() -> productService.validateProductPricing(new java.math.BigDecimal("150000.00"), "{\"fabric\":\"Silk\"}"));
        }

        @Test
        @DisplayName("Should reject null price")
        void givenNullPrice_whenValidate_thenThrowsValidationException() {
            ValidationException ex = assertThrows(ValidationException.class,
                    () -> productService.validateProductPricing(null, null));
            assertTrue(ex.getMessage().contains("cannot be null"));
        }

        @Test
        @DisplayName("Should reject negative prices regardless of attributes")
        void givenNegativePrice_whenValidate_thenThrowsValidationException() {
            ValidationException ex1 = assertThrows(ValidationException.class,
                    () -> productService.validateProductPricing(new java.math.BigDecimal("-0.01"), null));
            assertTrue(ex1.getMessage().contains("cannot be negative"));

            ValidationException ex2 = assertThrows(ValidationException.class,
                    () -> productService.validateProductPricing(new java.math.BigDecimal("-500.00"),
                            "{\"isReferral\":true,\"destinationUrl\":\"https://www.sabyasachi.com/item\",\"fulfillmentType\":\"REFERRAL_LINK\",\"destinationType\":\"EXACT_PRODUCT_PAGE\"}"));
            assertTrue(ex2.getMessage().contains("cannot be negative"));
        }

        @Test
        @DisplayName("Should reject zero price when attributes are null, blank, or lack explicit inquiry/referral markers")
        void givenZeroPriceWithoutInquiryOrReferral_whenValidate_thenThrowsValidationException() {
            ValidationException exNull = assertThrows(ValidationException.class,
                    () -> productService.validateProductPricing(java.math.BigDecimal.ZERO, null));
            assertTrue(exNull.getMessage().contains("strictly positive price"));

            ValidationException exBlank = assertThrows(ValidationException.class,
                    () -> productService.validateProductPricing(new java.math.BigDecimal("0.00"), "   "));
            assertTrue(exBlank.getMessage().contains("strictly positive price"));

            String ordinaryJson = "{\"color\":\"red\",\"size\":\"M\"}";
            ValidationException exOrdinary = assertThrows(ValidationException.class,
                    () -> productService.validateProductPricing(new java.math.BigDecimal("0.0000"), ordinaryJson));
            assertTrue(exOrdinary.getMessage().contains("strictly positive price"));

            // Verified atelier price without inquiry/referral must NOT allow zero price
            String verifiedJson = "{\"priceVerificationStatus\":\"VERIFIED_ATELIER_PRICE\"}";
            ValidationException exVerified = assertThrows(ValidationException.class,
                    () -> productService.validateProductPricing(java.math.BigDecimal.ZERO, verifiedJson));
            assertTrue(exVerified.getMessage().contains("strictly positive price"));
        }

        @Test
        @DisplayName("Should reject zero price when destinationUrl is provided ALONE without explicit referral contract")
        void givenZeroPriceWithDestinationUrlAlone_whenValidate_thenThrowsValidationException() {
            String destUrlAlone = "{\"destinationUrl\":\"https://www.sabyasachi.com/item\"}";
            // 1. validateAttributes rejects destinationUrl alone without isReferral: true
            ValidationException exAttr = assertThrows(ValidationException.class,
                    () -> productService.validateAttributes(destUrlAlone));
            assertTrue(exAttr.getMessage().contains("must explicitly declare isReferral as true"));

            // 2. validateProductPricing also independently rejects destinationUrl alone
            ValidationException exPrice = assertThrows(ValidationException.class,
                    () -> productService.validateProductPricing(java.math.BigDecimal.ZERO, destUrlAlone));
            assertTrue(exPrice.getMessage().contains("strictly positive price"));
        }

        @Test
        @DisplayName("Should reject contradictory referral markers (isReferral false with destinationUrl or fulfillmentType)")
        void givenContradictoryReferralMarkers_whenValidateAttributes_thenThrowsValidationException() {
            String falseWithUrl = "{\"isReferral\":false,\"destinationUrl\":\"https://www.sabyasachi.com/item\"}";
            ValidationException ex1 = assertThrows(ValidationException.class,
                    () -> productService.validateAttributes(falseWithUrl));
            assertTrue(ex1.getMessage().contains("Contradictory referral metadata"));

            String falseWithFulfillment = "{\"isReferral\":false,\"fulfillmentType\":\"REFERRAL_LINK\"}";
            ValidationException ex2 = assertThrows(ValidationException.class,
                    () -> productService.validateAttributes(falseWithFulfillment));
            assertTrue(ex2.getMessage().contains("Contradictory referral metadata"));
        }

        @Test
        @DisplayName("Should reject incomplete referral contract when isReferral is true")
        void givenIncompleteReferralContract_whenValidateAttributes_thenThrowsValidationException() {
            String missingUrl = "{\"isReferral\":true,\"fulfillmentType\":\"REFERRAL_LINK\",\"destinationType\":\"EXACT_PRODUCT_PAGE\"}";
            ValidationException exUrl = assertThrows(ValidationException.class,
                    () -> productService.validateAttributes(missingUrl));
            assertTrue(exUrl.getMessage().contains("must include a valid non-empty destinationUrl"));

            String missingFulfillment = "{\"isReferral\":true,\"destinationUrl\":\"https://www.sabyasachi.com/item\",\"destinationType\":\"EXACT_PRODUCT_PAGE\"}";
            ValidationException exFulfillment = assertThrows(ValidationException.class,
                    () -> productService.validateAttributes(missingFulfillment));
            assertTrue(exFulfillment.getMessage().contains("must specify fulfillmentType as REFERRAL_LINK"));

            String internalFulfillment = "{\"isReferral\":true,\"destinationUrl\":\"https://www.sabyasachi.com/item\",\"fulfillmentType\":\"INTERNAL\",\"destinationType\":\"EXACT_PRODUCT_PAGE\"}";
            ValidationException exInternal = assertThrows(ValidationException.class,
                    () -> productService.validateAttributes(internalFulfillment));
            assertTrue(exInternal.getMessage().contains("must specify fulfillmentType as REFERRAL_LINK"));

            String missingDestType = "{\"isReferral\":true,\"destinationUrl\":\"https://www.sabyasachi.com/item\",\"fulfillmentType\":\"REFERRAL_LINK\"}";
            ValidationException exDestType = assertThrows(ValidationException.class,
                    () -> productService.validateAttributes(missingDestType));
            assertTrue(exDestType.getMessage().contains("must specify destinationType"));
        }

        @Test
        @DisplayName("Should accept zero price when explicitly marked as PRICE_UPON_INQUIRY")
        void givenZeroPriceWithInquiryStatus_whenValidate_thenPasses() {
            String inquiryJson = "{\"priceVerificationStatus\":\"PRICE_UPON_INQUIRY\"}";
            assertDoesNotThrow(() -> productService.validateProductPricing(java.math.BigDecimal.ZERO, inquiryJson));
            assertDoesNotThrow(() -> productService.validateProductPricing(new java.math.BigDecimal("0.00"), inquiryJson));
        }

        @Test
        @DisplayName("Should accept zero price when marked with complete, consistent referral contract")
        void givenZeroPriceWithConsistentReferralMarkers_whenValidate_thenPasses() {
            String completeReferralJson1 = "{"
                    + "\"isReferral\":true,"
                    + "\"destinationUrl\":\"https://www.sabyasachi.com/item\","
                    + "\"fulfillmentType\":\"REFERRAL_LINK\","
                    + "\"destinationType\":\"EXACT_PRODUCT_PAGE\""
                    + "}";
            assertDoesNotThrow(() -> productService.validateAttributes(completeReferralJson1));
            assertDoesNotThrow(() -> productService.validateProductPricing(java.math.BigDecimal.ZERO, completeReferralJson1));

            String completeReferralJson2 = "{"
                    + "\"isReferral\":true,"
                    + "\"destinationUrl\":\"https://www.sabyasachi.com/collection\","
                    + "\"fulfillmentType\":\"REFERRAL_LINK\","
                    + "\"destinationType\":\"OFFICIAL_CATEGORY_DESTINATION\""
                    + "}";
            assertDoesNotThrow(() -> productService.validateAttributes(completeReferralJson2));
            assertDoesNotThrow(() -> productService.validateProductPricing(java.math.BigDecimal.ZERO, completeReferralJson2));
        }

        @Test
        @DisplayName("Should reject unknown fulfillmentType (e.g. DROPSHIP, EXTERNAL, RANDOM)")
        void givenUnknownFulfillmentType_whenValidate_thenThrowsValidationException() {
            String json = "{"
                    + "\"isReferral\":true,"
                    + "\"destinationUrl\":\"https://www.sabyasachi.com/collection\","
                    + "\"fulfillmentType\":\"DROPSHIP\","
                    + "\"destinationType\":\"OFFICIAL_CATEGORY_DESTINATION\""
                    + "}";
            ValidationException ex = assertThrows(ValidationException.class, () -> productService.validateAttributes(json));
            assertTrue(ex.getMessage().contains("Unknown or unsupported fulfillmentType"));
        }

        @Test
        @DisplayName("Should reject positive-priced products when carrying referral metadata")
        void givenPositivePriceWithReferralMetadata_whenValidatePricing_thenThrowsValidationException() {
            String referralJson = "{"
                    + "\"isReferral\":true,"
                    + "\"destinationUrl\":\"https://www.sabyasachi.com/collection\","
                    + "\"fulfillmentType\":\"REFERRAL_LINK\","
                    + "\"destinationType\":\"OFFICIAL_CATEGORY_DESTINATION\""
                    + "}";
            ValidationException ex = assertThrows(ValidationException.class,
                    () -> productService.validateProductPricing(new java.math.BigDecimal("45000.00"), referralJson));
            assertTrue(ex.getMessage().contains("cannot declare isReferral as true"));
        }

        @Test
        @DisplayName("Should reject positive-priced products when carrying destinationUrl alone")
        void givenPositivePriceWithDestinationUrl_whenValidatePricing_thenThrowsValidationException() {
            String urlJson = "{\"destinationUrl\":\"https://www.sabyasachi.com/collection\"}";
            ValidationException ex = assertThrows(ValidationException.class,
                    () -> productService.validateProductPricing(new java.math.BigDecimal("45000.00"), urlJson));
            assertTrue(ex.getMessage().contains("cannot carry destinationUrl"));
        }

        @Test
        @DisplayName("Should reject positive-priced products when carrying PRICE_UPON_INQUIRY")
        void givenPositivePriceWithPriceUponInquiry_whenValidatePricing_thenThrowsValidationException() {
            String inquiryJson = "{\"priceVerificationStatus\":\"PRICE_UPON_INQUIRY\"}";
            ValidationException ex = assertThrows(ValidationException.class,
                    () -> productService.validateProductPricing(new java.math.BigDecimal("45000.00"), inquiryJson));
            assertTrue(ex.getMessage().contains("cannot specify PRICE_UPON_INQUIRY"));
        }

        @Test
        @DisplayName("Should pass positive-priced product with INTERNAL fulfillmentType")
        void givenPositivePriceWithInternalFulfillment_whenValidate_thenPasses() {
            String internalJson = "{\"fulfillmentType\":\"INTERNAL\",\"fabric\":\"Silk\"}";
            assertDoesNotThrow(() -> productService.validateAttributes(internalJson));
            assertDoesNotThrow(() -> productService.validateProductPricing(new java.math.BigDecimal("15000.00"), internalJson));
        }

        @Test
        @DisplayName("Should pass positive-priced product with null or blank attributes (legacy SKU-001)")
        void givenPositivePriceWithNullAttributes_whenValidate_thenPasses() {
            assertDoesNotThrow(() -> productService.validateProductPricing(new java.math.BigDecimal("999.99"), null));
            assertDoesNotThrow(() -> productService.validateProductPricing(new java.math.BigDecimal("999.99"), ""));
        }

        @Test
        @DisplayName("Should reject createProduct when price is zero and destinationUrl is present alone")
        void givenZeroPriceDestinationUrlAlone_whenCreateProduct_thenThrowsValidationExceptionBeforeSave() {
            com.ecommerce.product.repository.ProductRepository repo = org.mockito.Mockito.mock(com.ecommerce.product.repository.ProductRepository.class);
            com.ecommerce.product.repository.CategoryRepository catRepo = org.mockito.Mockito.mock(com.ecommerce.product.repository.CategoryRepository.class);
            com.ecommerce.product.repository.InventoryRepository invRepo = org.mockito.Mockito.mock(com.ecommerce.product.repository.InventoryRepository.class);
            com.ecommerce.product.mapper.ProductMapper mapper = org.mockito.Mockito.mock(com.ecommerce.product.mapper.ProductMapper.class);
            com.ecommerce.product.event.EventPublisher pub = org.mockito.Mockito.mock(com.ecommerce.product.event.EventPublisher.class);
            ObjectMapper om = new ObjectMapper();

            ProductService service = new ProductService(repo, catRepo, invRepo, mapper, pub, om);

            com.ecommerce.product.dto.ProductRequest request = com.ecommerce.product.dto.ProductRequest.builder()
                    .name("Free Silk Saree")
                    .sku("SKU-FREE-001")
                    .price(java.math.BigDecimal.ZERO)
                    .categoryId(java.util.UUID.randomUUID())
                    .status(com.ecommerce.product.entity.ProductStatus.ACTIVE)
                    .attributes("{\"destinationUrl\":\"https://www.sabyasachi.com/item\"}")
                    .build();

            ValidationException ex = assertThrows(ValidationException.class, () -> service.createProduct(request));
            assertTrue(ex.getMessage().contains("must explicitly declare isReferral as true"));
            org.mockito.Mockito.verifyNoInteractions(repo);
        }

        @Test
        @DisplayName("Should reject createProduct when referral metadata is contradictory")
        void givenContradictoryMetadata_whenCreateProduct_thenThrowsValidationExceptionBeforeSave() {
            com.ecommerce.product.repository.ProductRepository repo = org.mockito.Mockito.mock(com.ecommerce.product.repository.ProductRepository.class);
            com.ecommerce.product.repository.CategoryRepository catRepo = org.mockito.Mockito.mock(com.ecommerce.product.repository.CategoryRepository.class);
            com.ecommerce.product.repository.InventoryRepository invRepo = org.mockito.Mockito.mock(com.ecommerce.product.repository.InventoryRepository.class);
            com.ecommerce.product.mapper.ProductMapper mapper = org.mockito.Mockito.mock(com.ecommerce.product.mapper.ProductMapper.class);
            com.ecommerce.product.event.EventPublisher pub = org.mockito.Mockito.mock(com.ecommerce.product.event.EventPublisher.class);
            ObjectMapper om = new ObjectMapper();

            ProductService service = new ProductService(repo, catRepo, invRepo, mapper, pub, om);

            com.ecommerce.product.dto.ProductRequest request = com.ecommerce.product.dto.ProductRequest.builder()
                    .name("Contradictory Kurta")
                    .sku("SKU-CONTRA-001")
                    .price(new java.math.BigDecimal("150.00"))
                    .categoryId(java.util.UUID.randomUUID())
                    .status(com.ecommerce.product.entity.ProductStatus.ACTIVE)
                    .attributes("{\"isReferral\":false,\"destinationUrl\":\"https://www.sabyasachi.com/item\"}")
                    .build();

            ValidationException ex = assertThrows(ValidationException.class, () -> service.createProduct(request));
            assertTrue(ex.getMessage().contains("Contradictory referral metadata"));
            org.mockito.Mockito.verifyNoInteractions(repo);
        }

        @Test
        @DisplayName("Should reject updateProduct when price is negative")
        void givenNegativePriceProduct_whenUpdateProduct_thenThrowsValidationExceptionBeforeSave() {
            com.ecommerce.product.repository.ProductRepository repo = org.mockito.Mockito.mock(com.ecommerce.product.repository.ProductRepository.class);
            com.ecommerce.product.repository.CategoryRepository catRepo = org.mockito.Mockito.mock(com.ecommerce.product.repository.CategoryRepository.class);
            com.ecommerce.product.repository.InventoryRepository invRepo = org.mockito.Mockito.mock(com.ecommerce.product.repository.InventoryRepository.class);
            com.ecommerce.product.mapper.ProductMapper mapper = org.mockito.Mockito.mock(com.ecommerce.product.mapper.ProductMapper.class);
            com.ecommerce.product.event.EventPublisher pub = org.mockito.Mockito.mock(com.ecommerce.product.event.EventPublisher.class);
            ObjectMapper om = new ObjectMapper();

            ProductService service = new ProductService(repo, catRepo, invRepo, mapper, pub, om);

            com.ecommerce.product.dto.ProductRequest request = com.ecommerce.product.dto.ProductRequest.builder()
                    .name("Discounted Kurta")
                    .sku("SKU-DISC-001")
                    .price(new java.math.BigDecimal("-20.00"))
                    .categoryId(java.util.UUID.randomUUID())
                    .status(com.ecommerce.product.entity.ProductStatus.ACTIVE)
                    .build();

            ValidationException ex = assertThrows(ValidationException.class, () -> service.updateProduct(java.util.UUID.randomUUID(), request));
            assertTrue(ex.getMessage().contains("cannot be negative"));
            org.mockito.Mockito.verifyNoInteractions(repo);
        }
    }
}
