-- Manual fix for specific user
-- Run this in Supabase SQL Editor

-- Check if user exists in auth.users
SELECT id, email, created_at FROM auth.users WHERE id = 'f573b72a-20bd-46f1-a238-d39e2ec11290';

-- If user exists in auth.users, create them in public.users
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT id, email, created_at, NOW()
FROM auth.users 
WHERE id = 'f573b72a-20bd-46f1-a238-d39e2ec11290'
ON CONFLICT (id) DO NOTHING;

-- Verify user was created
SELECT * FROM public.users WHERE id = 'f573b72a-20bd-46f1-a238-d39e2ec11290';

-- Alternative: Create all missing users at once
INSERT INTO public.users (id, email, created_at, updated_at)
SELECT auth_users.id, auth_users.email, auth_users.created_at, NOW()
FROM auth.users auth_users
LEFT JOIN public.users public_users ON auth_users.id = public_users.id
WHERE public_users.id IS NULL
ON CONFLICT (id) DO NOTHING;
