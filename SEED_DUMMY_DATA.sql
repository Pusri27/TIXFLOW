-- ==============================================================================
-- TIXFLOW DUMMY SEED DATA GENERATOR SCRIPT
-- PostgreSQL Compatible SQL
-- ==============================================================================

-- 1. INSERT VENUES
INSERT INTO venues (id, name, city, address, total_capacity) VALUES
(1, 'Gelora Bung Karno Main Stadium', 'Jakarta', 'Jl. Pintu Satu Senayan, Gelora, Jakarta Pusat', 77193),
(2, 'Indonesia Convention Exhibition (ICE BSD)', 'Tangerang', 'Jl. BSD Grand Boulevard No.1, BSD City', 10000),
(3, 'Bali Nusa Dua Convention Center', 'Bali', 'Kawasan Pariwisata Nusa Dua Lot NW/1, Bali', 5000),
(4, 'Trans Convention Centre', 'Bandung', 'Jl. Gatot Subroto No.289, Bandung', 4000),
(5, 'Jogja Expo Center (JEC)', 'Yogyakarta', 'Jl. Raya Janti No.143, Banguntapan, Bantul', 6000)
ON CONFLICT (id) DO NOTHING;

-- Reset sequence for venues
SELECT setval('venues_id_seq', (SELECT MAX(id) FROM venues));

-- 2. INSERT EVENTS
INSERT INTO events (id, name, description, category, poster_url, start_time, end_time, status, venue_id, is_queue_enabled, dynamic_pricing_enabled) VALUES
(1, 'Coldplay: Music of the Spheres World Tour 2026', 'Experience the legendary stadium spectacle featuring mesmerizing laser lights, wristband LED kinetic lightshows, and iconic anthems like Viva La Vida, Yellow, and Fix You live in Jakarta.', 'CONCERT', 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80', CURRENT_TIMESTAMP + INTERVAL '7 days', CURRENT_TIMESTAMP + INTERVAL '7 days 4 hours', 'UPCOMING', 1, TRUE, TRUE),

(2, 'Taylor Swift: The Eras Tour Experience', 'The ground-breaking 3-hour stadium journey celebrating all 10 musical eras. Featuring acoustic surprises, grand stage production, and unforgettable stadium energy in BSD City.', 'CONCERT', 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80', CURRENT_TIMESTAMP + INTERVAL '14 days', CURRENT_TIMESTAMP + INTERVAL '14 days 3 hours', 'UPCOMING', 2, TRUE, TRUE),

(3, 'FIFA World Cup Qualifier: Indonesia vs Japan', 'Support Timnas Garuda live at GBK Main Stadium in the critical 3rd round Asian Qualifier match against 4-time Asian Champions Japan. High stakes international football action!', 'SPORTS', 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1200&q=80', CURRENT_TIMESTAMP + INTERVAL '21 days', CURRENT_TIMESTAMP + INTERVAL '21 days 2 hours', 'UPCOMING', 1, TRUE, FALSE),

(4, 'The Phantom of the Opera Broadway Production', 'Andrew Lloyd Webber’s timeless musical masterpiece arrives in Bali. Immerse yourself in haunting romance, iconic chandeliers, and breathtaking theatrical performances.', 'THEATER', 'https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=1200&q=80', CURRENT_TIMESTAMP + INTERVAL '30 days', CURRENT_TIMESTAMP + INTERVAL '30 days 3 hours', 'UPCOMING', 3, FALSE, FALSE),

(5, 'Bruno Mars 24K Magic World Live', '14-time Grammy winner Bruno Mars brings his high-energy funk, soul, and chart-topping hits including Uptown Funk, 24K Magic, and Leave The Door Open to Bandung.', 'CONCERT', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80', CURRENT_TIMESTAMP + INTERVAL '45 days', CURRENT_TIMESTAMP + INTERVAL '45 days 3 hours', 'UPCOMING', 4, TRUE, TRUE),

(6, 'Christopher Nolan Premiere: Odyssey IMAX', 'Exclusive red carpet IMAX 70mm gala premiere featuring Q&A panel discussion with cast and crew. Experience cinematic history in ultra-high resolution.', 'MOVIE', 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80', CURRENT_TIMESTAMP + INTERVAL '60 days', CURRENT_TIMESTAMP + INTERVAL '60 days 3 hours', 'UPCOMING', 2, FALSE, FALSE),

(7, 'Les Misérables Epic Musical Drama', 'The world’s favorite musical brings Victor Hugo’s epic tale of passion, sacrifice, and redemption to Yogyakarta with a 50-piece live orchestra.', 'THEATER', 'https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&w=1200&q=80', CURRENT_TIMESTAMP + INTERVAL '75 days', CURRENT_TIMESTAMP + INTERVAL '75 days 3 hours', 'UPCOMING', 5, FALSE, FALSE)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  poster_url = EXCLUDED.poster_url,
  category = EXCLUDED.category,
  start_time = EXCLUDED.start_time;

SELECT setval('events_id_seq', (SELECT MAX(id) FROM events));

-- 3. INSERT SEAT CATEGORIES FOR EVENTS
INSERT INTO seat_categories (id, event_id, name, price, color_code) VALUES
-- Event 1: Coldplay
(101, 1, 'VIP Ultimate Experience', 3500000.00, '#EF4444'),
(102, 1, 'CAT 1 Festival Standing', 2200000.00, '#3B82F6'),
(103, 1, 'CAT 2 Tribune Seating', 1200000.00, '#10B981'),

-- Event 2: Taylor Swift
(201, 2, 'VIP Karma Is My Boyfriend', 4000000.00, '#8B5CF6'),
(202, 2, 'CAT 1 Floor Reserved', 2500000.00, '#EC4899'),
(203, 2, 'CAT 2 Elevated Seating', 1500000.00, '#F59E0B'),

-- Event 3: Indonesia vs Japan
(301, 3, 'VVIP West Grandstand', 1800000.00, '#EF4444'),
(302, 3, 'Garuda East Category 1', 950000.00, '#3B82F6'),
(303, 3, 'North/South Tribune', 450000.00, '#10B981'),

-- Event 4: Phantom of the Opera
(401, 4, 'Orchestra Front Center', 2800000.00, '#D97706'),
(402, 4, 'Royal Circle Seating', 1800000.00, '#6366F1'),

-- Event 5: Bruno Mars
(501, 5, 'VIP Lounge & Standing', 3200000.00, '#EF4444'),
(502, 5, 'Regular Festival', 1750000.00, '#3B82F6'),

-- Event 6: Christopher Nolan IMAX
(601, 6, 'IMAX Prime Center Seat', 450000.00, '#8B5CF6'),
(602, 6, 'Standard Premium Seat', 250000.00, '#3B82F6'),

-- Event 7: Les Misérables
(701, 7, 'VIP Diamond Circle', 1900000.00, '#EC4899'),
(702, 7, 'Gold Circle Seating', 1100000.00, '#10B981')
ON CONFLICT (id) DO NOTHING;

SELECT setval('seat_categories_id_seq', (SELECT MAX(id) FROM seat_categories));

-- 4. INSERT SEATS FOR EVENT 1 (Coldplay: Rows A-F, 1-8)
INSERT INTO seats (event_id, category_id, row_label, seat_number, status)
SELECT 1, 101, 'A', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 1, 101, 'B', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 1, 102, 'C', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 1, 102, 'D', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 1, 103, 'E', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 1, 103, 'F', num, 'AVAILABLE' FROM generate_series(1, 8) num
ON CONFLICT (event_id, row_label, seat_number) DO NOTHING;

-- 5. INSERT SEATS FOR EVENT 2 (Taylor Swift: Rows A-E, 1-8)
INSERT INTO seats (event_id, category_id, row_label, seat_number, status)
SELECT 2, 201, 'A', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 2, 201, 'B', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 2, 202, 'C', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 2, 202, 'D', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 2, 203, 'E', num, 'AVAILABLE' FROM generate_series(1, 8) num
ON CONFLICT (event_id, row_label, seat_number) DO NOTHING;

-- 6. INSERT SEATS FOR EVENT 3 (FIFA Qualifier: Rows A-E, 1-8)
INSERT INTO seats (event_id, category_id, row_label, seat_number, status)
SELECT 3, 301, 'A', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 3, 301, 'B', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 3, 302, 'C', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 3, 302, 'D', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 3, 303, 'E', num, 'AVAILABLE' FROM generate_series(1, 8) num
ON CONFLICT (event_id, row_label, seat_number) DO NOTHING;

-- 7. INSERT SEATS FOR EVENT 4 (Phantom of the Opera: Rows A-D, 1-8)
INSERT INTO seats (event_id, category_id, row_label, seat_number, status)
SELECT 4, 401, 'A', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 4, 401, 'B', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 4, 402, 'C', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 4, 402, 'D', num, 'AVAILABLE' FROM generate_series(1, 8) num
ON CONFLICT (event_id, row_label, seat_number) DO NOTHING;

-- 8. INSERT SEATS FOR EVENT 5 (Bruno Mars: Rows A-D, 1-8)
INSERT INTO seats (event_id, category_id, row_label, seat_number, status)
SELECT 5, 501, 'A', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 5, 501, 'B', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 5, 502, 'C', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 5, 502, 'D', num, 'AVAILABLE' FROM generate_series(1, 8) num
ON CONFLICT (event_id, row_label, seat_number) DO NOTHING;

-- 9. INSERT SEATS FOR EVENT 6 (Christopher Nolan IMAX: Rows A-D, 1-8)
INSERT INTO seats (event_id, category_id, row_label, seat_number, status)
SELECT 6, 601, 'A', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 6, 601, 'B', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 6, 602, 'C', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 6, 602, 'D', num, 'AVAILABLE' FROM generate_series(1, 8) num
ON CONFLICT (event_id, row_label, seat_number) DO NOTHING;

-- 10. INSERT SEATS FOR EVENT 7 (Les Misérables: Rows A-D, 1-8)
INSERT INTO seats (event_id, category_id, row_label, seat_number, status)
SELECT 7, 701, 'A', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 7, 701, 'B', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 7, 702, 'C', num, 'AVAILABLE' FROM generate_series(1, 8) num
UNION ALL
SELECT 7, 702, 'D', num, 'AVAILABLE' FROM generate_series(1, 8) num
ON CONFLICT (event_id, row_label, seat_number) DO NOTHING;
