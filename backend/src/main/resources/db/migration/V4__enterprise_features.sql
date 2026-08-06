-- Flyway migration script V4: Schema updates for Enterprise Features

ALTER TABLE tickets ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT FALSE;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS used_at TIMESTAMP;
ALTER TABLE tickets ADD COLUMN IF NOT EXISTS current_owner_id BIGINT REFERENCES users(id);

ALTER TABLE events ADD COLUMN IF NOT EXISTS is_queue_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS dynamic_pricing_enabled BOOLEAN DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS ticket_transfers (
    id BIGSERIAL PRIMARY KEY,
    ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
    from_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    to_user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ticket_transfers_ticket ON ticket_transfers(ticket_id);
