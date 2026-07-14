# Functional Requirements & User Stories

## 1. Functional Requirements

### 1.1 Authentication & Authorization
*   **FR-1.1.1:** The system shall allow users to register with an email and password.
*   **FR-1.1.2:** The system shall authenticate users and issue a JWT token with a validity of 1 hour.
*   **FR-1.1.3:** The system shall support Role-Based Access Control (RBAC) with 'CUSTOMER' and 'ADMIN' roles.

### 1.2 Product Management
*   **FR-1.2.1:** The system shall allow admins to create, update, and delete products.
*   **FR-1.2.2:** The system shall allow customers to view a paginated list of products.
*   **FR-1.2.3:** The system shall allow customers to search for products by name and category.

### 1.3 Shopping Cart
*   **FR-1.3.1:** The system shall allow customers to add products to their shopping cart.
*   **FR-1.3.2:** The system shall allow customers to update the quantity of items in the cart.
*   **FR-1.3.3:** The system shall allow customers to remove items from the cart.
*   **FR-1.3.4:** The system shall calculate the total price of the cart dynamically.

### 1.4 Order & Payment
*   **FR-1.4.1:** The system shall allow customers to place an order from their cart.
*   **FR-1.4.2:** The system shall process payments synchronously via a payment simulation service.
*   **FR-1.4.3:** The system shall update the order status to 'PAID' upon successful payment.

### 1.5 Notifications
*   **FR-1.5.1:** The system shall send an async notification (simulated email) when an order is successfully placed.

---

## 2. User Stories

### Epic 1: User Identity
*   **As a** new customer, **I want** to register an account **so that** I can securely log in and place orders.
*   **As a** returning customer, **I want** to log in using my credentials **so that** I can access my profile and order history.

### Epic 2: Product Discovery
*   **As a** customer, **I want** to browse products by category **so that** I can find items of interest.
*   **As an** admin, **I want** to add new products to the catalog **so that** customers can purchase them.

### Epic 3: Checkout Flow
*   **As a** customer, **I want** to add multiple items to my cart **so that** I can purchase them together.
*   **As a** customer, **I want** to proceed to checkout and pay for my order **so that** my order is confirmed.

---

## 3. Use Cases

### Use Case: Place Order
*   **Actor:** Customer
*   **Precondition:** Customer is logged in and has items in their cart.
*   **Main Flow:**
    1. Customer navigates to checkout.
    2. Customer confirms shipping details.
    3. Customer submits payment information.
    4. Order Service creates order (Status: PENDING).
    5. Payment Service processes payment.
    6. Order Service updates order (Status: PAID).
    7. Notification Service sends confirmation email.
    8. Cart Service clears the customer's cart.
*   **Alternative Flow:** Payment fails. Order status updated to 'FAILED'. User is notified to retry.
