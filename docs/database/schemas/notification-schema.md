# Notification Service Database Schema

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL, -- Logical FK to Auth DB
    type VARCHAR(50) NOT NULL, -- EMAIL, SMS
    subject VARCHAR(255),
    body TEXT NOT NULL,
    status VARCHAR(50) NOT NULL, -- PENDING, SENT, FAILED
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 0
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
```
