-- Fix product_images RLS - replace the all policy with explicit ones
-- This migration fixes the issue where product_images admin operations were returning 404

-- Drop the overly broad "all" policy if it exists
drop policy if exists "product_images_admin_all" on public.product_images;

-- Drop individual policies if they exist (in case this runs twice)
drop policy if exists "product_images_admin_insert" on public.product_images;
drop policy if exists "product_images_admin_update" on public.product_images;
drop policy if exists "product_images_admin_delete" on public.product_images;

-- Create explicit policies for each operation
create policy "product_images_admin_insert" on public.product_images 
  for insert with check (public.has_role(auth.uid(), 'admin'));

create policy "product_images_admin_update" on public.product_images 
  for update using (public.has_role(auth.uid(), 'admin')) 
  with check (public.has_role(auth.uid(), 'admin'));

create policy "product_images_admin_delete" on public.product_images 
  for delete using (public.has_role(auth.uid(), 'admin'));
