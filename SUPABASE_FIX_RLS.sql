-- CORRECTION DES RLS POLICIES PRODUCT_IMAGES
-- Exécutez ce SQL dans l'éditeur SQL de Supabase (Supabase Dashboard > SQL Editor)

-- 1. Supprimer la politique "all" existante si elle existe
drop policy if exists "product_images_admin_all" on public.product_images;

-- 2. Créer les policies explicites pour INSERT, UPDATE, DELETE
create policy "product_images_admin_insert" on public.product_images 
  for insert with check (public.has_role(auth.uid(), 'admin'));

create policy "product_images_admin_update" on public.product_images 
  for update using (public.has_role(auth.uid(), 'admin')) 
  with check (public.has_role(auth.uid(), 'admin'));

create policy "product_images_admin_delete" on public.product_images 
  for delete using (public.has_role(auth.uid(), 'admin'));

-- Vérifier les policies en place
-- Devrait voir: product_images_select_all, product_images_admin_insert, product_images_admin_update, product_images_admin_delete
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check FROM pg_policies 
WHERE tablename = 'product_images' 
ORDER BY policyname;
