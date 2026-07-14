# Architecture Explanation

When asked to explain the architecture in an interview:

"The application uses an API Gateway pattern. All external traffic hits a Spring Cloud Gateway, which handles JWT token validation and routes to backend services. 

The backend is composed of Domain-Driven microservices: Auth, Product, Cart, Order, Payment, and Notification. 
* Synchronous communication (like fetching product details) happens via REST. 
* Asynchronous communication (like processing a payment or sending an email after an order) happens via RabbitMQ to ensure loose coupling and fault tolerance. 

Data is persisted in PostgreSQL, while Redis is used for high-speed caching (like the shopping cart).

Everything runs on Kubernetes (EKS). I used Helm to abstract the Kubernetes manifests, making it easy to deploy the same stack across dev, staging, and production environments."
