package com.ecommerce.payment.service;

import com.ecommerce.common.exception.BusinessException;
import com.ecommerce.common.exception.ForbiddenException;
import com.ecommerce.common.exception.ResourceNotFoundException;
import com.ecommerce.common.exception.ValidationException;
import com.ecommerce.payment.dto.PaymentRequest;
import com.ecommerce.payment.dto.PaymentResponse;
import com.ecommerce.payment.entity.Payment;
import com.ecommerce.payment.entity.PaymentStatus;
import com.ecommerce.payment.event.OrderEvent;
import com.ecommerce.payment.event.OrderEventConsumer;
import com.ecommerce.payment.event.PaymentEvent;
import com.ecommerce.payment.event.PaymentEventPublisher;
import com.ecommerce.payment.mapper.PaymentMapper;
import com.ecommerce.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("LUMIÈRE Stage 8D: Payment Service Zero/Negative Amount Hardening Tests")
class PaymentServiceSecurityTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentMapper paymentMapper;

    @Mock
    private PaymentEventPublisher eventPublisher;

    @InjectMocks
    private PaymentService paymentService;

    private UUID orderId;
    private UUID userId;

    @BeforeEach
    void setUp() {
        orderId = UUID.randomUUID();
        userId = UUID.randomUUID();
        ReflectionTestUtils.setField(paymentService, "enableInternalCheckout", true);
    }

    @Nested
    @DisplayName("1. Event-Driven initializePayment Amount Protection")
    class InitializePaymentAmountTests {

        @Test
        @DisplayName("Should reject null amount and record failed payment")
        void givenNullAmount_whenInitialize_thenRecordsFailureAndThrows() {
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            ValidationException ex = assertThrows(ValidationException.class,
                    () -> paymentService.initializePayment(orderId, userId, null));

            assertTrue(ex.getMessage().contains("strictly greater than zero"));

            ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
            verify(paymentRepository).save(paymentCaptor.capture());
            Payment captured = paymentCaptor.getValue();
            assertEquals(PaymentStatus.FAILED, captured.getStatus());
            assertEquals("REJECTED-INVALID-AMOUNT", captured.getTransactionId());
            assertEquals(BigDecimal.ZERO, captured.getAmount());

            ArgumentCaptor<PaymentEvent> eventCaptor = ArgumentCaptor.forClass(PaymentEvent.class);
            verify(eventPublisher).publishPaymentFailed(eventCaptor.capture());
            assertEquals("FAILED", eventCaptor.getValue().getStatus());
            verify(eventPublisher, never()).publishPaymentCompleted(any());
        }

        @Test
        @DisplayName("Should reject exactly zero amount (0.00) and record failed payment")
        void givenZeroAmount_whenInitialize_thenRecordsFailureAndThrows() {
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            BigDecimal zero = new BigDecimal("0.00");
            ValidationException ex = assertThrows(ValidationException.class,
                    () -> paymentService.initializePayment(orderId, userId, zero));

            assertTrue(ex.getMessage().contains("strictly greater than zero"));

            ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
            verify(paymentRepository).save(paymentCaptor.capture());
            assertEquals(PaymentStatus.FAILED, paymentCaptor.getValue().getStatus());
            assertEquals("REJECTED-INVALID-AMOUNT", paymentCaptor.getValue().getTransactionId());

            verify(eventPublisher).publishPaymentFailed(any(PaymentEvent.class));
            verify(eventPublisher, never()).publishPaymentCompleted(any());
        }

        @Test
        @DisplayName("Should reject zero with high decimal precision (0.000000)")
        void givenZeroWithHighScale_whenInitialize_thenRecordsFailureAndThrows() {
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            BigDecimal zeroHighScale = new BigDecimal("0.000000");
            ValidationException ex = assertThrows(ValidationException.class,
                    () -> paymentService.initializePayment(orderId, userId, zeroHighScale));

            assertTrue(ex.getMessage().contains("strictly greater than zero"));
            verify(paymentRepository).save(any(Payment.class));
            verify(eventPublisher).publishPaymentFailed(any(PaymentEvent.class));
        }

        @Test
        @DisplayName("Should reject negative amount (-50.00) and record failed payment")
        void givenNegativeAmount_whenInitialize_thenRecordsFailureAndThrows() {
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            BigDecimal negative = new BigDecimal("-50.00");
            ValidationException ex = assertThrows(ValidationException.class,
                    () -> paymentService.initializePayment(orderId, userId, negative));

            assertTrue(ex.getMessage().contains("strictly greater than zero"));

            ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
            verify(paymentRepository).save(paymentCaptor.capture());
            assertEquals(PaymentStatus.FAILED, paymentCaptor.getValue().getStatus());
            assertEquals("REJECTED-INVALID-AMOUNT", paymentCaptor.getValue().getTransactionId());
            assertEquals(negative, paymentCaptor.getValue().getAmount());

            verify(eventPublisher).publishPaymentFailed(any(PaymentEvent.class));
            verify(eventPublisher, never()).publishPaymentCompleted(any());
        }

        @Test
        @DisplayName("Should reject null orderId")
        void givenNullOrderId_whenInitialize_thenThrowsValidationException() {
            ValidationException ex = assertThrows(ValidationException.class,
                    () -> paymentService.initializePayment(null, userId, new BigDecimal("100.00")));

            assertTrue(ex.getMessage().contains("Order ID cannot be null"));
            verify(paymentRepository, never()).save(any());
            verify(eventPublisher, never()).publishPaymentFailed(any());
        }

        @Test
        @DisplayName("Should reject null userId")
        void givenNullUserId_whenInitialize_thenThrowsValidationException() {
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.empty());

            ValidationException ex = assertThrows(ValidationException.class,
                    () -> paymentService.initializePayment(orderId, null, new BigDecimal("100.00")));

            assertTrue(ex.getMessage().contains("User ID cannot be null"));
            verify(paymentRepository, never()).save(any());
            verify(eventPublisher, never()).publishPaymentFailed(any());
        }

        @Test
        @DisplayName("Should successfully initialize with valid positive amount")
        void givenValidPositiveAmount_whenInitialize_thenCreatesPendingPayment() {
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            BigDecimal validAmount = new BigDecimal("250.75");
            assertDoesNotThrow(() -> paymentService.initializePayment(orderId, userId, validAmount));

            ArgumentCaptor<Payment> paymentCaptor = ArgumentCaptor.forClass(Payment.class);
            verify(paymentRepository).save(paymentCaptor.capture());
            Payment captured = paymentCaptor.getValue();
            assertEquals(PaymentStatus.PENDING, captured.getStatus());
            assertEquals(validAmount, captured.getAmount());
            assertEquals(orderId, captured.getOrderId());
            assertEquals(userId, captured.getUserId());
            verify(eventPublisher, never()).publishPaymentFailed(any());
            verify(eventPublisher, never()).publishPaymentCompleted(any());
        }

        @Test
        @DisplayName("Should preserve idempotency for duplicate order initialization")
        void givenExistingOrder_whenInitializeDuplicate_thenReturnsEarlyWithoutAction() {
            Payment existingPayment = Payment.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(new BigDecimal("100.00"))
                    .status(PaymentStatus.PENDING)
                    .build();
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.of(existingPayment));

            paymentService.initializePayment(orderId, userId, new BigDecimal("100.00"));

            verify(paymentRepository, never()).save(any());
            verify(eventPublisher, never()).publishPaymentFailed(any());
            verify(eventPublisher, never()).publishPaymentCompleted(any());
        }
    }

    @Nested
    @DisplayName("2. Direct processPayment Amount Protection")
    class ProcessPaymentAmountTests {

        @Test
        @DisplayName("Should reject payment processing when record amount is null")
        void givenNullPaymentAmount_whenProcess_thenFailsAndThrowsValidationException() {
            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(null)
                    .status(PaymentStatus.PENDING)
                    .build();
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            PaymentRequest request = PaymentRequest.builder()
                    .orderId(orderId)
                    .paymentMethod("CREDIT_CARD")
                    .token("tok_valid")
                    .build();

            ValidationException ex = assertThrows(ValidationException.class,
                    () -> paymentService.processPayment(request, userId));

            assertTrue(ex.getMessage().contains("strictly greater than zero"));
            assertEquals(PaymentStatus.FAILED, payment.getStatus());
            assertEquals("REJECTED-INVALID-AMOUNT", payment.getTransactionId());

            verify(paymentRepository).save(payment);
            verify(eventPublisher).publishPaymentFailed(any(PaymentEvent.class));
            verify(eventPublisher, never()).publishPaymentCompleted(any());
        }

        @Test
        @DisplayName("Should reject payment processing when record amount is zero (0.00)")
        void givenZeroPaymentAmount_whenProcess_thenFailsAndThrowsValidationException() {
            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(new BigDecimal("0.00"))
                    .status(PaymentStatus.PENDING)
                    .build();
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            PaymentRequest request = PaymentRequest.builder()
                    .orderId(orderId)
                    .paymentMethod("CREDIT_CARD")
                    .token("tok_valid")
                    .build();

            ValidationException ex = assertThrows(ValidationException.class,
                    () -> paymentService.processPayment(request, userId));

            assertTrue(ex.getMessage().contains("strictly greater than zero"));
            assertEquals(PaymentStatus.FAILED, payment.getStatus());
            assertEquals("REJECTED-INVALID-AMOUNT", payment.getTransactionId());

            verify(paymentRepository).save(payment);
            verify(eventPublisher).publishPaymentFailed(any(PaymentEvent.class));
            verify(eventPublisher, never()).publishPaymentCompleted(any());
        }

        @Test
        @DisplayName("Should reject payment processing when record amount is negative (-10.00)")
        void givenNegativePaymentAmount_whenProcess_thenFailsAndThrowsValidationException() {
            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(new BigDecimal("-10.00"))
                    .status(PaymentStatus.PENDING)
                    .build();
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            PaymentRequest request = PaymentRequest.builder()
                    .orderId(orderId)
                    .paymentMethod("CREDIT_CARD")
                    .token("tok_valid")
                    .build();

            ValidationException ex = assertThrows(ValidationException.class,
                    () -> paymentService.processPayment(request, userId));

            assertTrue(ex.getMessage().contains("strictly greater than zero"));
            assertEquals(PaymentStatus.FAILED, payment.getStatus());
            assertEquals("REJECTED-INVALID-AMOUNT", payment.getTransactionId());

            verify(paymentRepository).save(payment);
            verify(eventPublisher).publishPaymentFailed(any(PaymentEvent.class));
            verify(eventPublisher, never()).publishPaymentCompleted(any());
        }

        @Test
        @DisplayName("Should reject payment processing when already COMPLETED")
        void givenAlreadyCompletedPayment_whenProcess_thenThrowsBusinessException() {
            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(new BigDecimal("100.00"))
                    .status(PaymentStatus.COMPLETED)
                    .build();
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.of(payment));

            PaymentRequest request = PaymentRequest.builder()
                    .orderId(orderId)
                    .paymentMethod("CREDIT_CARD")
                    .token("tok_valid")
                    .build();

            BusinessException ex = assertThrows(BusinessException.class, () -> paymentService.processPayment(request, userId));
            assertTrue(ex.getMessage().contains("Payment cannot be processed in status: COMPLETED"));
            verify(eventPublisher, never()).publishPaymentCompleted(any());
            verify(eventPublisher, never()).publishPaymentFailed(any());
        }

        @Test
        @DisplayName("Should reject payment processing when status is already FAILED")
        void givenFailedPayment_whenProcess_thenThrowsBusinessExceptionAndDoesNotAttemptGateway() {
            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(new BigDecimal("100.00"))
                    .status(PaymentStatus.FAILED)
                    .transactionId("REJECTED-INVALID-AMOUNT")
                    .build();
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.of(payment));

            PaymentRequest request = PaymentRequest.builder()
                    .orderId(orderId)
                    .paymentMethod("CREDIT_CARD")
                    .token("tok_valid")
                    .build();

            BusinessException ex = assertThrows(BusinessException.class, () -> paymentService.processPayment(request, userId));
            assertTrue(ex.getMessage().contains("Payment cannot be processed in status: FAILED"));
            verify(paymentRepository, never()).save(any());
            verify(eventPublisher, never()).publishPaymentCompleted(any());
        }

        @Test
        @DisplayName("Should reject payment processing when status is REFUNDED")
        void givenRefundedPayment_whenProcess_thenThrowsBusinessException() {
            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(new BigDecimal("100.00"))
                    .status(PaymentStatus.REFUNDED)
                    .build();
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.of(payment));

            PaymentRequest request = PaymentRequest.builder()
                    .orderId(orderId)
                    .paymentMethod("CREDIT_CARD")
                    .token("tok_valid")
                    .build();

            BusinessException ex = assertThrows(BusinessException.class, () -> paymentService.processPayment(request, userId));
            assertTrue(ex.getMessage().contains("Payment cannot be processed in status: REFUNDED"));
        }

        @Test
        @DisplayName("Should process valid positive amount payment successfully")
        void givenValidPositiveAmount_whenProcessSuccessful_thenSetsCompletedAndPublishes() {
            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(new BigDecimal("199.99"))
                    .status(PaymentStatus.PENDING)
                    .build();
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
            when(paymentMapper.toResponse(any(Payment.class))).thenReturn(PaymentResponse.builder()
                    .orderId(orderId)
                    .status(PaymentStatus.COMPLETED)
                    .amount(new BigDecimal("199.99"))
                    .build());

            PaymentRequest request = PaymentRequest.builder()
                    .orderId(orderId)
                    .paymentMethod("CREDIT_CARD")
                    .token("tok_valid_visa")
                    .build();

            PaymentResponse response = paymentService.processPayment(request, userId);

            assertNotNull(response);
            assertEquals(PaymentStatus.COMPLETED, payment.getStatus());
            assertTrue(payment.getTransactionId().startsWith("TXN-"));

            verify(eventPublisher).publishPaymentCompleted(any(PaymentEvent.class));
            verify(eventPublisher, never()).publishPaymentFailed(any());
        }
    }

    @Nested
    @DisplayName("3. Refund Amount Protection")
    class RefundAmountTests {

        @Test
        @DisplayName("Should reject refund when amount is non-positive")
        void givenNonPositiveAmount_whenRefund_thenThrowsValidationException() {
            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(BigDecimal.ZERO)
                    .status(PaymentStatus.COMPLETED)
                    .build();
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.of(payment));

            assertThrows(ValidationException.class, () -> paymentService.processRefund(orderId));
            verify(eventPublisher, never()).publishRefundCompleted(any());
        }

        @Test
        @DisplayName("Should process refund for valid completed payment")
        void givenValidCompletedPayment_whenRefund_thenSucceeds() {
            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(new BigDecimal("50.00"))
                    .status(PaymentStatus.COMPLETED)
                    .build();
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
            when(paymentMapper.toResponse(any(Payment.class))).thenReturn(PaymentResponse.builder()
                    .orderId(orderId)
                    .status(PaymentStatus.REFUNDED)
                    .build());

            PaymentResponse response = paymentService.processRefund(orderId);

            assertNotNull(response);
            assertEquals(PaymentStatus.REFUNDED, payment.getStatus());
            verify(eventPublisher).publishRefundCompleted(any(PaymentEvent.class));
        }
    }

    @Nested
    @DisplayName("4. OrderEventConsumer Safe Consumer Tests")
    class OrderEventConsumerTests {

        @Test
        @DisplayName("Should safely discard null event without throwing")
        void givenNullEvent_whenHandleOrderCreated_thenDoesNotThrow() {
            OrderEventConsumer consumer = new OrderEventConsumer(paymentService);
            assertDoesNotThrow(() -> consumer.handleOrderCreatedEvent(null));
        }

        @Test
        @DisplayName("Should handle ValidationException safely without infinite loop or unhandled throw")
        void givenZeroAmountEvent_whenHandleOrderCreated_thenCatchesValidationExceptionSafely() {
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            OrderEventConsumer consumer = new OrderEventConsumer(paymentService);
            OrderEvent event = new OrderEvent();
            event.setOrderId(orderId);
            event.setUserId(userId);
            event.setTotalAmount(BigDecimal.ZERO);

            // Must NOT throw out of the consumer method (which would cause infinite retry in RabbitMQ)
            assertDoesNotThrow(() -> consumer.handleOrderCreatedEvent(event));

            // But failure must be recorded and published
            verify(paymentRepository).save(any(Payment.class));
            verify(eventPublisher).publishPaymentFailed(any(PaymentEvent.class));
        }
    }

    @Nested
    @DisplayName("5. Transaction Semantics & Event Publishing Safety Tests")
    class TransactionSemanticsTests {

        @Test
        @DisplayName("Should configure noRollbackFor = ValidationException on initializePayment")
        void initializePayment_transactionAttribute_doesNotRollbackOnValidationException() throws Exception {
            org.springframework.transaction.annotation.AnnotationTransactionAttributeSource source =
                    new org.springframework.transaction.annotation.AnnotationTransactionAttributeSource();
            java.lang.reflect.Method method = PaymentService.class.getMethod("initializePayment", UUID.class, UUID.class, BigDecimal.class);
            org.springframework.transaction.interceptor.TransactionAttribute attr = source.getTransactionAttribute(method, PaymentService.class);

            assertNotNull(attr, "@Transactional attribute must be present on initializePayment");
            // Must NOT rollback on ValidationException (failed payment record must persist)
            assertFalse(attr.rollbackOn(new ValidationException("invalid amount")),
                    "Transaction must NOT rollback on ValidationException so failure record persists");
            // Must rollback on unexpected runtime exceptions (e.g. DB connection dropped)
            assertTrue(attr.rollbackOn(new RuntimeException("unexpected DB crash")),
                    "Transaction MUST rollback on general runtime exceptions");
        }

        @Test
        @DisplayName("Should configure noRollbackFor = {BusinessException, ValidationException} on processPayment")
        void processPayment_transactionAttribute_doesNotRollbackOnBusinessOrValidationException() throws Exception {
            org.springframework.transaction.annotation.AnnotationTransactionAttributeSource source =
                    new org.springframework.transaction.annotation.AnnotationTransactionAttributeSource();
            java.lang.reflect.Method method = PaymentService.class.getMethod("processPayment", PaymentRequest.class, UUID.class);
            org.springframework.transaction.interceptor.TransactionAttribute attr = source.getTransactionAttribute(method, PaymentService.class);

            assertNotNull(attr, "@Transactional attribute must be present on processPayment");
            assertFalse(attr.rollbackOn(new ValidationException("invalid amount")),
                    "Transaction must NOT rollback on ValidationException");
            assertFalse(attr.rollbackOn(new BusinessException("payment processing failed")),
                    "Transaction must NOT rollback on BusinessException so failed status persists");
            assertTrue(attr.rollbackOn(new RuntimeException("unexpected DB crash")),
                    "Transaction MUST rollback on unexpected runtime exceptions");
        }

        @Test
        @DisplayName("Spring TransactionInterceptor commits on ValidationException during initializePayment")
        void proxyTransactionInterceptor_whenValidationException_commitsTransaction() throws Exception {
            org.springframework.transaction.PlatformTransactionManager txManager = mock(org.springframework.transaction.PlatformTransactionManager.class);
            org.springframework.transaction.TransactionStatus status = mock(org.springframework.transaction.TransactionStatus.class);
            when(txManager.getTransaction(any(org.springframework.transaction.TransactionDefinition.class))).thenReturn(status);

            org.springframework.transaction.annotation.AnnotationTransactionAttributeSource source =
                    new org.springframework.transaction.annotation.AnnotationTransactionAttributeSource();
            org.springframework.transaction.interceptor.TransactionInterceptor interceptor =
                    new org.springframework.transaction.interceptor.TransactionInterceptor(txManager, source);

            org.springframework.aop.framework.ProxyFactory proxyFactory = new org.springframework.aop.framework.ProxyFactory(paymentService);
            proxyFactory.addAdvice(interceptor);
            PaymentService proxiedService = (PaymentService) proxyFactory.getProxy();

            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            // When zero amount is passed, ValidationException is thrown
            assertThrows(ValidationException.class,
                    () -> proxiedService.initializePayment(orderId, userId, BigDecimal.ZERO));

            // Verify that the transaction manager COMMITTED the transaction (NOT rolled back!)
            verify(txManager).commit(status);
            verify(txManager, never()).rollback(any());
        }

        @Test
        @DisplayName("Spring TransactionInterceptor commits on BusinessException during processPayment")
        void proxyTransactionInterceptor_whenBusinessException_commitsTransaction() throws Exception {
            org.springframework.transaction.PlatformTransactionManager txManager = mock(org.springframework.transaction.PlatformTransactionManager.class);
            org.springframework.transaction.TransactionStatus status = mock(org.springframework.transaction.TransactionStatus.class);
            when(txManager.getTransaction(any(org.springframework.transaction.TransactionDefinition.class))).thenReturn(status);

            org.springframework.transaction.annotation.AnnotationTransactionAttributeSource source =
                    new org.springframework.transaction.annotation.AnnotationTransactionAttributeSource();
            org.springframework.transaction.interceptor.TransactionInterceptor interceptor =
                    new org.springframework.transaction.interceptor.TransactionInterceptor(txManager, source);

            org.springframework.aop.framework.ProxyFactory proxyFactory = new org.springframework.aop.framework.ProxyFactory(paymentService);
            proxyFactory.addAdvice(interceptor);
            PaymentService proxiedService = (PaymentService) proxyFactory.getProxy();

            Payment payment = Payment.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(new BigDecimal("100.00"))
                    .status(PaymentStatus.PENDING)
                    .build();
            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.of(payment));
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            // Token with "fail" causes payment failure and throws BusinessException
            PaymentRequest request = PaymentRequest.builder()
                    .orderId(orderId)
                    .paymentMethod("CREDIT_CARD")
                    .token("tok_fail_card")
                    .build();

            assertThrows(BusinessException.class, () -> proxiedService.processPayment(request, userId));

            // Verify that failed status was COMMITTED to the database
            verify(txManager).commit(status);
            verify(txManager, never()).rollback(any());
        }

        @Test
        @DisplayName("PaymentEventPublisher defers publication until transaction commit")
        void paymentEventPublisher_whenTransactionActive_publishesOnlyAfterCommit() {
            org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate = mock(org.springframework.amqp.rabbit.core.RabbitTemplate.class);
            PaymentEventPublisher publisher = new PaymentEventPublisher(rabbitTemplate);

            PaymentEvent event = PaymentEvent.builder()
                    .orderId(orderId)
                    .status("FAILED")
                    .build();

            // Simulate active Spring transaction
            org.springframework.transaction.support.TransactionSynchronizationManager.initSynchronization();
            org.springframework.transaction.support.TransactionSynchronizationManager.setActualTransactionActive(true);

            try {
                publisher.publishPaymentFailed(event);

                // Before commit: RabbitMQ must NOT have received the message yet
                verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), any(Object.class));

                // Trigger commit
                org.springframework.transaction.support.TransactionSynchronizationUtils.triggerAfterCommit();

                // After commit: RabbitMQ must receive the message
                verify(rabbitTemplate).convertAndSend(eq("payment.exchange"), eq("payment.failed"), eq(event));
            } finally {
                org.springframework.transaction.support.TransactionSynchronizationManager.clearSynchronization();
            }
        }

        @Test
        @DisplayName("PaymentEventPublisher suppresses publication when transaction rolls back")
        void paymentEventPublisher_whenTransactionRollsBack_suppressesEvent() {
            org.springframework.amqp.rabbit.core.RabbitTemplate rabbitTemplate = mock(org.springframework.amqp.rabbit.core.RabbitTemplate.class);
            PaymentEventPublisher publisher = new PaymentEventPublisher(rabbitTemplate);

            PaymentEvent event = PaymentEvent.builder()
                    .orderId(orderId)
                    .status("FAILED")
                    .build();

            // Simulate active Spring transaction
            org.springframework.transaction.support.TransactionSynchronizationManager.initSynchronization();
            org.springframework.transaction.support.TransactionSynchronizationManager.setActualTransactionActive(true);

            try {
                publisher.publishPaymentFailed(event);

                // Before completion: not sent
                verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), any(Object.class));

                // Trigger rollback completion
                org.springframework.transaction.support.TransactionSynchronizationUtils.triggerAfterCompletion(
                        org.springframework.transaction.support.TransactionSynchronization.STATUS_ROLLED_BACK);

                // On rollback: event must NEVER be sent to RabbitMQ!
                verify(rabbitTemplate, never()).convertAndSend(anyString(), anyString(), any(Object.class));
            } finally {
                org.springframework.transaction.support.TransactionSynchronizationManager.clearSynchronization();
            }
        }
    }

    @Nested
    @DisplayName("Internal Checkout Feature Flag Tests (Fix 3)")
    class InternalCheckoutFeatureFlagTests {

        @Test
        @DisplayName("processPayment fails when internal checkout is disabled (default / false)")
        void processPayment_fails_whenInternalCheckoutDisabled() {
            ReflectionTestUtils.setField(paymentService, "enableInternalCheckout", false);

            PaymentRequest request = PaymentRequest.builder()
                    .orderId(orderId)
                    .paymentMethod("CREDIT_CARD")
                    .token("tok_valid")
                    .build();

            ForbiddenException ex = assertThrows(ForbiddenException.class,
                    () -> paymentService.processPayment(request, userId));

            assertTrue(ex.getMessage().contains("Internal checkout and mock payments are disabled."));

            verify(paymentRepository, never()).findByOrderId(any());
            verify(paymentRepository, never()).save(any());
            verify(eventPublisher, never()).publishPaymentCompleted(any());
            verify(eventPublisher, never()).publishPaymentFailed(any());
        }

        @Test
        @DisplayName("initializePayment fails when internal checkout is disabled (default / false)")
        void initializePayment_fails_whenInternalCheckoutDisabled() {
            ReflectionTestUtils.setField(paymentService, "enableInternalCheckout", false);

            ForbiddenException ex = assertThrows(ForbiddenException.class,
                    () -> paymentService.initializePayment(orderId, userId, BigDecimal.valueOf(100.00)));

            assertTrue(ex.getMessage().contains("Internal checkout and mock payments are disabled."));

            verify(paymentRepository, never()).save(any());
            verify(eventPublisher, never()).publishPaymentCompleted(any());
            verify(eventPublisher, never()).publishPaymentFailed(any());
        }

        @Test
        @DisplayName("Historical payment reads and admin refunds remain functional when internal checkout is disabled")
        void historicalReadsAndAdminRefunds_succeed_whenInternalCheckoutDisabled() {
            ReflectionTestUtils.setField(paymentService, "enableInternalCheckout", false);

            Payment mockPayment = Payment.builder()
                    .id(UUID.randomUUID())
                    .orderId(orderId)
                    .userId(userId)
                    .amount(BigDecimal.valueOf(250.00))
                    .status(PaymentStatus.COMPLETED)
                    .transactionId("TXN-HISTORICAL-01")
                    .paymentMethod("CREDIT_CARD")
                    .build();

            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.of(mockPayment));
            when(paymentMapper.toResponse(mockPayment)).thenReturn(PaymentResponse.builder()
                    .orderId(orderId)
                    .userId(userId)
                    .amount(BigDecimal.valueOf(250.00))
                    .status(PaymentStatus.COMPLETED)
                    .transactionId("TXN-HISTORICAL-01")
                    .build());

            // Historical read
            PaymentResponse readResponse = paymentService.getPaymentByOrderId(orderId, userId);
            assertNotNull(readResponse);
            assertEquals("TXN-HISTORICAL-01", readResponse.getTransactionId());

            // Admin refund
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));
            PaymentResponse refundResponse = paymentService.processRefund(orderId);
            assertNotNull(refundResponse);
            verify(paymentRepository).save(any(Payment.class));
            verify(eventPublisher).publishRefundCompleted(any());
        }

        @Test
        @DisplayName("Explicitly enabling internal checkout still rejects invalid/zero amounts")
        void enablingInternalCheckout_stillEnforcesAmountValidation() {
            ReflectionTestUtils.setField(paymentService, "enableInternalCheckout", true);

            when(paymentRepository.findByOrderId(orderId)).thenReturn(Optional.empty());
            when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

            ValidationException ex = assertThrows(ValidationException.class,
                    () -> paymentService.initializePayment(orderId, userId, BigDecimal.ZERO));

            assertTrue(ex.getMessage().contains("strictly greater than zero"));
        }
    }
}
