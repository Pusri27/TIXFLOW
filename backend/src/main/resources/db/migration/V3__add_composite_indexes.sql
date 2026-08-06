-- Flyway migration script V3: Add composite indexes for performance optimization

CREATE INDEX IF NOT EXISTS idx_seats_event_status ON seats(event_id, status);
CREATE INDEX IF NOT EXISTS idx_bookings_pending_expiry ON bookings(status, expires_at);
