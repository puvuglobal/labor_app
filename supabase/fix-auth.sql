-- Fix the trigger issue - disable it temporarily to create users
-- Run this in Supabase SQL Editor

-- 1. Drop the problematic trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 2. Create users via the auth system - users will be created but profiles won't auto-generate
-- This is fine for testing - profiles can be created manually

-- 3. Now manually create profiles for test users
-- Note: After creating users, run this to add profiles:

-- INSERT INTO profiles (user_id, profile_id, email, role, first_name, last_name)
-- VALUES 
-- ('USER_ID_1', 'ADMIN', 'admin@test.com', 'admin', 'Admin', 'User'),
-- ('USER_ID_2', 'CLIENT', 'client@test.com', 'client', 'VIP Client', 'Company'),
-- ('USER_ID_3', 'CAND', 'candidate@test.com', 'candidate', 'Candidate', 'User');
