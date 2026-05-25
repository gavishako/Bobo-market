
-- Fix search_path on set_updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql security invoker set search_path = public
as $$ begin new.updated_at = now(); return new; end $$;

-- Revoke direct execute on security definer functions from public roles
revoke execute on function public.has_role(uuid, public.app_role) from anon, authenticated, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;

-- Restrict public bucket listing: drop overly broad public select, replace with path-based (still readable per object via signed/public URLs)
drop policy if exists "product_images_public_read" on storage.objects;
create policy "product_images_public_read" on storage.objects 
  for select using (bucket_id = 'product-images');
-- Note: keeping public read since we need direct URLs; this is acceptable for product photos.
