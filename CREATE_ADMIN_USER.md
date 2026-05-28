# 📝 CRÉER COMPTE ADMIN - NOUVEAU PROJET

## Compte Admin à Créer
- **Email**: admin@bobo-market.bf
- **Mot de passe**: BoboAdmin2026!
- **Rôle**: admin

## Instructions

### Étape 1: Accédez au Dashboard Supabase
1. Allez sur [https://app.supabase.com/](https://app.supabase.com/)
2. Sélectionnez le projet **hdoptlrbbqnrxdltrnjd**

### Étape 2: Ouvrez l'Éditeur SQL
1. Cliquez sur **SQL Editor** dans le menu de gauche
2. Cliquez sur **New Query**

### Étape 3: Collez ce SQL

```sql
-- Create admin user for Bobo-Market
DO $$
DECLARE
  admin_uid uuid;
BEGIN
  SELECT id INTO admin_uid FROM auth.users WHERE email = 'admin@bobo-market.bf';

  IF admin_uid IS NULL THEN
    admin_uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', admin_uid, 'authenticated', 'authenticated',
      'admin@bobo-market.bf', crypt('BoboAdmin2026!', gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Administrateur Bobo-Market"}'::jsonb,
      now(), now(), '', '', '', ''
    );
    INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
    VALUES (gen_random_uuid(), admin_uid,
      jsonb_build_object('sub', admin_uid::text, 'email', 'admin@bobo-market.bf', 'email_verified', true),
      'email', admin_uid::text, now(), now(), now());
  END IF;

  INSERT INTO public.user_roles (user_id, role) VALUES (admin_uid, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
END $$;
```

### Étape 4: Cliquez sur "Run"
- Vous devriez voir: "Query executed successfully"

### Étape 5: Testez la connexion
1. Allez sur http://localhost:5173/auth
2. Entrez:
   - **Email**: admin@bobo-market.bf
   - **Mot de passe**: BoboAdmin2026!
3. Cliquez sur "Se connecter"

## ✅ Vous êtes connecté!
Vous devriez être redirigé vers `/admin` automatiquement.

---

**Besoin d'aide?** Consultez le fichier `supabase/migrations/20260526134000_create_admin_user.sql`
