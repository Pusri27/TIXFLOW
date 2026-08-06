-- Seed data for venues
INSERT INTO venues (id, name, address, city, total_capacity) VALUES
(1, 'Jakarta International Stadium', 'Jl. Papanggo, Tanjung Priok', 'Jakarta', 50000),
(2, 'Grand XXI Cinema Center', 'Jl. MH Thamrin No. 28', 'Jakarta', 200),
(3, 'Bandung Convention Center', 'Jl. Soekarno Hatta No. 354', 'Bandung', 5000);

-- Seed data for events
INSERT INTO events (id, name, description, category, start_time, end_time, venue_id, poster_url, status) VALUES
(1, 'Coldplay Music of the Spheres World Tour', 'Konser megah spektakuler dengan tata cahaya laser dan kembang api.', 'CONCERT', '2026-11-15 19:30:00', '2026-11-15 23:00:00', 1, 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=800&q=80', 'UPCOMING'),
(2, 'Avatar: Fire and Ash - Special Screening', 'Pemutaran perdana film Avatar edisi eksklusif dalam format IMAX 3D.', 'MOVIE', '2026-12-20 18:00:00', '2026-12-20 21:30:00', 2, 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80', 'UPCOMING'),
(3, 'Java Jazz Festival 2026', 'Festival musik jazz internasional terbesar di Asia Tenggara.', 'CONCERT', '2026-09-10 16:00:00', '2026-09-12 23:59:00', 3, 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80', 'UPCOMING');

-- Seed seat categories for Event 1 (Coldplay)
INSERT INTO seat_categories (id, event_id, name, price, color_code) VALUES
(1, 1, 'VIP Cat 1 (Front Stage)', 3500000.00, '#EF4444'),
(2, 1, 'Gold Cat 2 (Center)', 2200000.00, '#F59E0B'),
(3, 1, 'Regular Cat 3 (Tribune)', 1200000.00, '#3B82F6');

-- Seed seat categories for Event 2 (Avatar)
INSERT INTO seat_categories (id, event_id, name, price, color_code) VALUES
(4, 2, 'Premier Sweet Seat', 150000.00, '#8B5CF6'),
(5, 2, 'Standard Deluxe Seat', 85000.00, '#10B981');

-- Generate Seats for Event 1 (Row A to D, 1 to 10)
-- Row A (VIP)
INSERT INTO seats (event_id, category_id, row_label, seat_number, status) VALUES
(1, 1, 'A', 1, 'AVAILABLE'), (1, 1, 'A', 2, 'AVAILABLE'), (1, 1, 'A', 3, 'AVAILABLE'), (1, 1, 'A', 4, 'AVAILABLE'), (1, 1, 'A', 5, 'AVAILABLE'),
(1, 1, 'A', 6, 'AVAILABLE'), (1, 1, 'A', 7, 'AVAILABLE'), (1, 1, 'A', 8, 'AVAILABLE'), (1, 1, 'A', 9, 'AVAILABLE'), (1, 1, 'A', 10, 'AVAILABLE');

-- Row B (Gold)
INSERT INTO seats (event_id, category_id, row_label, seat_number, status) VALUES
(1, 2, 'B', 1, 'AVAILABLE'), (1, 2, 'B', 2, 'AVAILABLE'), (1, 2, 'B', 3, 'AVAILABLE'), (1, 2, 'B', 4, 'AVAILABLE'), (1, 2, 'B', 5, 'AVAILABLE'),
(1, 2, 'B', 6, 'AVAILABLE'), (1, 2, 'B', 7, 'AVAILABLE'), (1, 2, 'B', 8, 'AVAILABLE'), (1, 2, 'B', 9, 'AVAILABLE'), (1, 2, 'B', 10, 'AVAILABLE');

-- Row C (Gold)
INSERT INTO seats (event_id, category_id, row_label, seat_number, status) VALUES
(1, 2, 'C', 1, 'AVAILABLE'), (1, 2, 'C', 2, 'AVAILABLE'), (1, 2, 'C', 3, 'AVAILABLE'), (1, 2, 'C', 4, 'AVAILABLE'), (1, 2, 'C', 5, 'AVAILABLE'),
(1, 2, 'C', 6, 'AVAILABLE'), (1, 2, 'C', 7, 'AVAILABLE'), (1, 2, 'C', 8, 'AVAILABLE'), (1, 2, 'C', 9, 'AVAILABLE'), (1, 2, 'C', 10, 'AVAILABLE');

-- Row D (Regular)
INSERT INTO seats (event_id, category_id, row_label, seat_number, status) VALUES
(1, 3, 'D', 1, 'AVAILABLE'), (1, 3, 'D', 2, 'AVAILABLE'), (1, 3, 'D', 3, 'AVAILABLE'), (1, 3, 'D', 4, 'AVAILABLE'), (1, 3, 'D', 5, 'AVAILABLE'),
(1, 3, 'D', 6, 'AVAILABLE'), (1, 3, 'D', 7, 'AVAILABLE'), (1, 3, 'D', 8, 'AVAILABLE'), (1, 3, 'D', 9, 'AVAILABLE'), (1, 3, 'D', 10, 'AVAILABLE');

-- Seats for Event 2 (Row A & B)
INSERT INTO seats (event_id, category_id, row_label, seat_number, status) VALUES
(2, 4, 'A', 1, 'AVAILABLE'), (2, 4, 'A', 2, 'AVAILABLE'), (2, 4, 'A', 3, 'AVAILABLE'), (2, 4, 'A', 4, 'AVAILABLE'), (2, 4, 'A', 5, 'AVAILABLE'),
(2, 5, 'B', 1, 'AVAILABLE'), (2, 5, 'B', 2, 'AVAILABLE'), (2, 5, 'B', 3, 'AVAILABLE'), (2, 5, 'B', 4, 'AVAILABLE'), (2, 5, 'B', 5, 'AVAILABLE');

-- Seed Default Admin User (Password: admin123, BCrypt encoded)
-- and Default Customer User (Password: user123, BCrypt encoded)
INSERT INTO users (id, name, email, password, phone, role) VALUES
(1, 'System Admin', 'admin@ticketapp.com', '$2a$10$eD2u4dM4x0KzUvX5wJ3kCeTz8/fN6vW1gH4jK7lM9nO0pQ2rS4t6u', '08123456789', 'ADMIN'),
(2, 'John Doe', 'john@example.com', '$2a$10$eD2u4dM4x0KzUvX5wJ3kCeTz8/fN6vW1gH4jK7lM9nO0pQ2rS4t6u', '08987654321', 'USER');

SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));
SELECT setval('venues_id_seq', (SELECT COALESCE(MAX(id), 1) FROM venues));
SELECT setval('events_id_seq', (SELECT COALESCE(MAX(id), 1) FROM events));
SELECT setval('seat_categories_id_seq', (SELECT COALESCE(MAX(id), 1) FROM seat_categories));
