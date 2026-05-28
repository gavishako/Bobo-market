# 🔧 FIX ERREUR 404 - PRODUITS ADMIN

## Problème
L'erreur 404 survient lorsque vous essayez d'ajouter ou de modifier des produits en tant qu'admin. Cela est dû à une limitation dans les RLS (Row Level Security) policies de Supabase sur la table `product_images`.

## Solution

### Étape 1: Accédez au Dashboard Supabase
1. Allez sur [https://app.supabase.com/](https://app.supabase.com/)
2. Connectez-vous si nécessaire
3. Sélectionnez le projet **wyhvgfxwpadjsiodwsok**

### Étape 2: Ouvrez l'Éditeur SQL
1. Dans le menu de gauche, cliquez sur **SQL Editor**
2. Cliquez sur **New Query**

### Étape 3: Collez et Exécutez ce SQL

```sql
-- Fix product_images RLS policies
-- Cette correction remplace la policy "all" par des policies explicites

-- Supprimer les anciennes policies
drop policy if exists "product_images_admin_all" on public.product_images;

-- Ajouter les nouvelles policies explicites
create policy "product_images_admin_insert" on public.product_images 
  for insert with check (public.has_role(auth.uid(), 'admin'));

create policy "product_images_admin_update" on public.product_images 
  for update using (public.has_role(auth.uid(), 'admin')) 
  with check (public.has_role(auth.uid(), 'admin'));

create policy "product_images_admin_delete" on public.product_images 
  for delete using (public.has_role(auth.uid(), 'admin'));
```

### Étape 4: Cliquez sur "Run"
- Le SQL devrait s'exécuter avec succès
- Vous devriez voir "Query executed successfully"

### Étape 5: Testez dans l'Application
1. Retournez à l'application (http://localhost:5173/admin/products)
2. Rafraîchissez la page (F5 ou Cmd+R)
3. Essayez d'ajouter un nouveau produit

## Vérification

Pour vérifier que la correction a bien été appliquée, vous pouvez exécuter ce SQL dans l'éditeur:

```sql
-- Vérifier les policies en place
SELECT policyname, permissive, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'product_images' 
ORDER BY policyname;
```

Vous devriez voir les 4 policies:
- `product_images_select_all` (SELECT)
- `product_images_admin_insert` (INSERT)
- `product_images_admin_update` (UPDATE)
- `product_images_admin_delete` (DELETE)

## ✅ C'est fait!

Vous pouvez maintenant ajouter, modifier et supprimer des produits sans erreur 404.

---

**Compte Admin:**
- Email: admin@bobo-market.bf
- Mot de passe: BoboAdmin2026!
