-- Fix security warning: Set search_path for function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;