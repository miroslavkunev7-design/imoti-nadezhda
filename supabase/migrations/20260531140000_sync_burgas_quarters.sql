-- Sync Burgas quarters with app (lib/data/quarters.ts)

UPDATE quarters
SET slug = 'zornica'
WHERE city_id = (SELECT id FROM cities WHERE slug = 'burgas')
  AND slug = 'zornitsa';

INSERT INTO quarters (city_id, name, slug, description, image_url, population, area_km2)
SELECT c.id, 'Възраждане', 'vazrajdane', 'Централен исторически квартал.', '/images/quarters/burgas/vazrajdane.jpg', 15000, 1.8
FROM cities c
WHERE c.slug = 'burgas'
  AND NOT EXISTS (SELECT 1 FROM quarters q WHERE q.city_id = c.id AND q.slug = 'vazrajdane');

INSERT INTO quarters (city_id, name, slug, description, image_url, population, area_km2)
SELECT c.id, 'Хоризонт', 'horizont', 'Жилищен квартал.', '/images/quarters/burgas/horizont.jpg', 0, 0
FROM cities c
WHERE c.slug = 'burgas'
  AND NOT EXISTS (SELECT 1 FROM quarters q WHERE q.city_id = c.id AND q.slug = 'horizont');

INSERT INTO quarters (city_id, name, slug, description, image_url, population, area_km2)
SELECT c.id, 'Крайморие', 'kraimorie', 'Крайбрежен район.', '/images/quarters/burgas/kraimorie.jpg', 0, 0
FROM cities c
WHERE c.slug = 'burgas'
  AND NOT EXISTS (SELECT 1 FROM quarters q WHERE q.city_id = c.id AND q.slug = 'kraimorie');

DELETE FROM quarters
WHERE city_id = (SELECT id FROM cities WHERE slug = 'burgas')
  AND slug = 'vetren';
