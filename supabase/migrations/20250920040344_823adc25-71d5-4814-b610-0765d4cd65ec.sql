-- Fix UUID type mismatch and RLS issues for user signup

-- Drop existing policies that might conflict with column type changes
DROP POLICY IF EXISTS "Users can view own wallet" ON wallets;
DROP POLICY IF EXISTS "Users can update own wallet" ON wallets;  
DROP POLICY IF EXISTS "Users can insert own wallet" ON wallets;
DROP POLICY IF EXISTS "service_role_insert_wallets" ON wallets;
DROP POLICY IF EXISTS "users_insert_own_wallet" ON wallets;
DROP POLICY IF EXISTS "users_view_own_wallet" ON wallets;
DROP POLICY IF EXISTS "users_update_own_wallet" ON wallets;

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;

DROP POLICY IF EXISTS "Users can view own transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "service_role_insert_transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "users_view_own_transactions" ON wallet_transactions;
DROP POLICY IF EXISTS "users_insert_own_transactions" ON wallet_transactions;

-- Drop and recreate the trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Fix column types to UUID
ALTER TABLE wallets ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE orders ALTER COLUMN user_id TYPE uuid USING user_id::uuid;
ALTER TABLE wallet_transactions ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Make sure user_id columns are NOT NULL where appropriate
ALTER TABLE wallets ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE wallet_transactions ALTER COLUMN user_id SET NOT NULL;

-- Enable RLS on all tables
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;  
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_cards ENABLE ROW LEVEL SECURITY;

-- Create corrected RLS policies for wallets
CREATE POLICY "users_can_view_own_wallet" ON wallets
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_can_update_own_wallet" ON wallets  
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_wallet" ON wallets
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create corrected RLS policies for orders
CREATE POLICY "users_can_view_own_orders" ON orders
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_orders" ON orders
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create corrected RLS policies for wallet_transactions  
CREATE POLICY "users_can_view_own_transactions" ON wallet_transactions
FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users_can_insert_own_transactions" ON wallet_transactions
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Create corrected RLS policies for gift_cards (public read, authenticated insert)
CREATE POLICY "anyone_can_view_gift_cards" ON gift_cards
FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "authenticated_can_create_gift_cards" ON gift_cards
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "users_can_redeem_gift_cards" ON gift_cards  
FOR UPDATE TO authenticated USING (true);

-- Create the corrected trigger function with proper UUID handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert a new wallet for the user
  INSERT INTO public.wallets (user_id, balance, created_at, updated_at)
  VALUES (
    NEW.id,  -- NEW.id is already UUID from auth.users
    0,
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail user creation
    RAISE NOTICE 'Error creating wallet for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;