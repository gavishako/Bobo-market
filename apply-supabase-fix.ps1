#!/usr/bin/env pwsh

# Script pour appliquer les corrections RLS à Supabase via l'API
# Usage: ./apply-supabase-fix.ps1

$SUPABASE_URL = "https://wyhvgfxwpadjsiodwsok.supabase.co"
$SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5aHZnZnh3cGFkanNpb2R3c29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxNzY2MjQsImV4cCI6MjA5NDc1MjYyNH0.BXdfZJGXCqJKPQHEZP8MUdpjlNbbAo5nAqbn1r17qFU"

Write-Host "Appliquer les corrections RLS pour product_images..."
Write-Host ""
Write-Host "IMPORTANT: Ces changements doivent être appliqués dans le dashboard Supabase:"
Write-Host "1. Allez sur https://app.supabase.com/"
Write-Host "2. Sélectionnez le projet 'wyhvgfxwpadjsiodwsok'"
Write-Host "3. Allez dans SQL Editor"
Write-Host "4. Collez et exécutez le SQL ci-dessous:"
Write-Host ""
Write-Host "================================"
Write-Host ""

@"
-- Fix product_images RLS policies
drop policy if exists "product_images_admin_all" on public.product_images;
drop policy if exists "product_images_admin_insert" on public.product_images;
drop policy if exists "product_images_admin_update" on public.product_images;
drop policy if exists "product_images_admin_delete" on public.product_images;

create policy "product_images_admin_insert" on public.product_images 
  for insert with check (public.has_role(auth.uid(), 'admin'));

create policy "product_images_admin_update" on public.product_images 
  for update using (public.has_role(auth.uid(), 'admin')) 
  with check (public.has_role(auth.uid(), 'admin'));

create policy "product_images_admin_delete" on public.product_images 
  for delete using (public.has_role(auth.uid(), 'admin'));
"@

Write-Host ""
Write-Host "================================"
Write-Host ""
Write-Host "Après avoir exécuté le SQL, rafraîchissez votre application (F5)."
