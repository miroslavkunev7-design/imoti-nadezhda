-- Demo Burgas listings (ids 900001–900006) — mirrors data/local-properties.json

INSERT INTO properties (
  id, user_id, title, slug, description, price, city, quarter,
  property_type, status, area, bedrooms, bathrooms, floor, total_floors,
  furnished, main_image, views, created_at, updated_at
) VALUES
(900001, 1, 'Луксозен апартамент с морски изглед — Лазур', 'luksozen-apartament-lazur',
 'Просторен апартамент в кв. Лазур, Бургас.', 185000, 'Бургас', 'Лазур', 'Апартамент', 'available',
 92, 2, 1, 4, 8, 'yes', '/images/quarters/burgas/lazur.jpg', 12, '2026-05-31T09:00:00Z', '2026-05-31T09:00:00Z'),
(900002, 1, 'Двустаен апартамент близо до плажа — Лазур', 'dvustaen-lazur',
 'Компактен двустаен в Лазур.', 142000, 'Бургас', 'Лазур', 'Апартамент', 'available',
 68, 2, 1, 2, 6, 'partial', '/images/quarters/burgas/lazur.jpg', 5, '2026-05-30T10:00:00Z', '2026-05-30T10:00:00Z'),
(900003, 1, 'Пентхаус с панорамен изглед — Лазур', 'penthaus-lazur',
 'Ексклузивен пентхаус.', 320000, 'Бургас', 'Лазур', 'Пентхаус', 'available',
 145, 3, 2, 8, 8, 'yes', '/images/cities/burgas-hero-panorama.jpg', 8, '2026-05-29T08:00:00Z', '2026-05-29T08:00:00Z'),
(900004, 1, 'Тристаен в центъра — Бургас', 'tristaen-centar',
 'Тристаен в Център.', 198000, 'Бургас', 'Център', 'Апартамент', 'available',
 110, 3, 2, 5, 9, 'no', '/images/quarters/burgas/centar.jpg', 3, '2026-05-28T12:00:00Z', '2026-05-28T12:00:00Z'),
(900005, 1, 'Къща с двор — Славейков', 'kashta-slaveykov',
 'Къща в Славейков.', 265000, 'Бургас', 'Славейков', 'Къща', 'available',
 180, 4, 2, NULL, NULL, 'yes', '/images/quarters/burgas/slaveykov.jpg', 6, '2026-05-27T09:00:00Z', '2026-05-27T09:00:00Z'),
(900006, 1, 'Студио за инвестиция — Изгрев', 'studio-izgrev',
 'Студио в Изгрев.', 78000, 'Бургас', 'Изгрев', 'Апартамент', 'available',
 42, 1, 1, 3, 7, 'partial', '/images/quarters/burgas/izgrev.jpg', 2, '2026-05-26T11:00:00Z', '2026-05-26T11:00:00Z')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  price = EXCLUDED.price,
  main_image = EXCLUDED.main_image,
  updated_at = EXCLUDED.updated_at;

SELECT setval(pg_get_serial_sequence('properties', 'id'), GREATEST((SELECT MAX(id) FROM properties), 900006));
