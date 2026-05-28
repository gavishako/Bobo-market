-- Insert demo fruits & vegetables into public.products and public.product_images
-- Use in Supabase SQL Editor for project hdoptlrbbqnrxdltrnjd

-- FRUITS
WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Pomme rouge et verte', 'Pommes rouges et vertes fraîches et croquantes.', 'fruit', 6500, 80, true, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/pomme-rouge-verte.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Orange', 'Oranges juteuses et sucrées.', 'fruit', 6000, 70, true, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/orange.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Mandarine', 'Mandarines parfumées et faciles à éplucher.', 'fruit', 6000, 60, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/mandarine.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Kiwi', 'Kiwis verts acidulés riches en vitamine C.', 'fruit', 23500, 35, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/kiwi.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Fraise', 'Fraises sucrées et parfumées de saison.', 'fruit', 30500, 25, true, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/fraise.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Passion', 'Fruits de la passion exotiques, doux et acidulés.', 'fruit', 10000, 30, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/passion.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Avocat', 'Avocats crémeux et riches, parfaits pour salades et tartines.', 'fruit', 6000, 40, true, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/avocat.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Ananas', 'Ananas tropical, sucré et juteux.', 'fruit', 8000, 45, true, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/ananas.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Papaye', 'Papayes mûres, douces et fondantes.', 'fruit', 3500, 50, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/papaye.jpg', 0 FROM p;

-- LEGUMES
WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Gingembre', 'Gingembre frais, idéal pour les infusions et sauces.', 'legume', 4500, 30, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/gingembre.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Chou', 'Chou vert, croquant et polyvalent pour de nombreuses recettes.', 'legume', 4500, 40, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/chou.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Chou fleur', 'Choux-fleurs frais, tendre et nutritif.', 'legume', 19000, 20, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/chou-fleur.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Brocolis', 'Brocolis verts pour une cuisine saine et riche en fibres.', 'legume', 21500, 20, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/brocolis.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Poivrons rouges et jaunes', 'Poivrons colorés pour salades et plats sautés.', 'legume', 18000, 25, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/poivrons-rouges-jaunes.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Poivrons verts', 'Poivrons verts frais pour sauces et grillades.', 'legume', 8000, 30, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/poivrons-verts.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Carottes', 'Carottes croquantes, parfaites pour les salades.', 'legume', 7000, 50, true, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/carottes.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Betterave', 'Betteraves sucrées, excellentes en salade ou rôties.', 'legume', 7000, 35, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/betterave.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Pomme de terre', 'Pommes de terre polyvalentes pour toutes vos recettes.', 'legume', 4500, 100, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/pomme-de-terre.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Ail', 'Ail frais, parfumé pour rehausser vos plats.', 'legume', 10000, 40, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/ail.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Oignons', 'Oignons frais pour cuisiner partout.', 'legume', 4000, 60, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/oignons.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Ciboulette', 'Bottes de ciboulette fraîches pour assaisonner vos plats.', 'legume', 1200, 80, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/ciboulette.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Mathe', 'Mathe frais en botte pour salades légères.', 'legume', 2000, 50, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/mathe.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Champignons', 'Champignons frais pour poêlées et omelettes.', 'legume', 15000, 25, false, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/champignons.jpg', 0 FROM p;

WITH p AS (
  INSERT INTO public.products (name, description, category, price_per_kg, stock_kg, featured, available)
  VALUES ('Tomates', 'Tomates juteuses pour sauces et salades.', 'legume', 10000, 80, true, true)
  RETURNING id
)
INSERT INTO public.product_images (product_id, url, position)
SELECT id, 'http://localhost:5173/products/tomates.jpg', 0 FROM p;

-- End of demo inserts
SELECT 'done' as status;
