-- Fix security warning by setting search_path for redeem_gift_card function
CREATE OR REPLACE FUNCTION public.redeem_gift_card(p_code text, p_amount integer, p_redeemed_by uuid DEFAULT NULL::uuid)
 RETURNS TABLE(success boolean, message text, remaining_balance integer)
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    card_record RECORD;
    new_balance INTEGER;
BEGIN
    -- Validate inputs
    IF p_code IS NULL OR trim(p_code) = '' THEN
        RETURN QUERY SELECT false, 'Gift card code is required', 0;
        RETURN;
    END IF;
    
    IF p_amount IS NULL OR p_amount <= 0 THEN
        RETURN QUERY SELECT false, 'Redemption amount must be greater than 0', 0;
        RETURN;
    END IF;
    
    -- Find the gift card
    SELECT * INTO card_record
    FROM gift_cards 
    WHERE code = p_code AND is_active = true;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Gift card not found or inactive', 0;
        RETURN;
    END IF;
    
    -- Check if expired
    IF card_record.expires_at IS NOT NULL AND NOW() > card_record.expires_at THEN
        RETURN QUERY SELECT false, 'Gift card has expired', card_record.balance;
        RETURN;
    END IF;
    
    -- Check sufficient balance
    IF card_record.balance < p_amount THEN
        RETURN QUERY SELECT false, 
            'Insufficient balance. Available: ₦' || card_record.balance::TEXT, 
            card_record.balance;
        RETURN;
    END IF;
    
    -- Calculate new balance
    new_balance := card_record.balance - p_amount;
    
    -- Update the gift card
    UPDATE gift_cards 
    SET 
        balance = new_balance,
        redeemed_at = NOW(),
        redeemed_by = p_redeemed_by,
        is_active = CASE WHEN new_balance > 0 THEN true ELSE false END
    WHERE id = card_record.id;
    
    -- Return success
    RETURN QUERY SELECT true, 
        'Successfully redeemed ₦' || p_amount::TEXT,
        new_balance;
END;
$function$;