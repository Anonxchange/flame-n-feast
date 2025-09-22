-- Drop the conflicting integer version of create_gift_card function
DROP FUNCTION IF EXISTS public.create_gift_card(p_amount integer, p_created_by uuid, p_expires_in_months integer);

-- Keep only the numeric version which is more flexible for currency amounts