-- Vérifie le nombre de produits disponibles
SELECT COUNT(*) AS total_produits FROM products WHERE available = true;

-- Liste les produits non disponibles
SELECT id, name FROM products WHERE available = false;

-- Vérifie les produits sans image
SELECT p.id, p.name FROM products p
LEFT JOIN product_images pi ON p.id = pi.product_id
WHERE pi.url IS NULL OR pi.url = '';
