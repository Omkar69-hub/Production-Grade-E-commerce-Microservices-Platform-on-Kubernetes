#!/bin/bash
# Kubernetes Smoke Test for E-Commerce Platform
# Validates that all critical components are up and running

NAMESPACE="e-commerce"

echo "Running Kubernetes Smoke Tests in namespace: $NAMESPACE"

# Function to check deployment status
check_deployment() {
  DEPLOYMENT=$1
  echo "Checking deployment: $DEPLOYMENT"
  
  # Wait for deployment to be ready (timeout 120s)
  kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE --timeout=120s
  
  if [ $? -eq 0 ]; then
    echo "✅ $DEPLOYMENT is READY."
  else
    echo "❌ $DEPLOYMENT FAILED to become ready."
    exit 1
  fi
}

# List of critical deployments to check
DEPLOYMENTS=(
  "api-gateway"
  "auth-service"
  "product-service"
  "order-service"
  "cart-service"
  "payment-service"
  "notification-service"
  "postgres"
  "redis"
  "rabbitmq"
)

# Run checks
for deployment in "${DEPLOYMENTS[@]}"; do
  check_deployment $deployment
done

# Check if services are exposed
echo "Checking Services..."
kubectl get svc -n $NAMESPACE

echo "🎉 All Kubernetes Smoke Tests Passed!"
exit 0
