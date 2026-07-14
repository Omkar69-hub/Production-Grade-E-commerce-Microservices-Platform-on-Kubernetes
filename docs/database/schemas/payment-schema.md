# Payment Service Database Schema

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL, -- Logical FK to Order DB
    amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL, -- SUCCESS, FAILED, PROCESSING
    provider_transaction_id VARCHAR(255),
    failure_reason TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 0
);

CREATE INDEX idx_payments_order_id ON payments(order_id);
CREATE UNIQUE INDEX uq_payments_transaction ON payments(provider_transaction_id) WHERE provider_transaction_id IS NOT NULL;
```
