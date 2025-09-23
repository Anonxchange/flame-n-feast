-- Update redeem_gift_card function to prevent redeeming already used cards
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
    WHERE code = p_code;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Gift card not found', 0;
        RETURN;
    END IF;
    
    -- Check if card is inactive
    IF card_record.is_active = false THEN
        RETURN QUERY SELECT false, 'Gift card has already been redeemed', 0;
        RETURN;
    END IF;
    
    -- Check if already redeemed
    IF card_record.redeemed_at IS NOT NULL THEN
        RETURN QUERY SELECT false, 'Gift card has already been used', card_record.balance;
        RETURN;
    END IF;
    
    -- Check if expired
    IF card_record.expires_at IS NOT NULL AND NOW() > card_record.expires_at THEN
        RETURN QUERY SELECT false, 'Gift card has expired', card_record.balance;
        RETURN;
    END IF;
    
    -- Check if redemption amount matches card amount (full redemption only)
    IF card_record.amount != p_amount THEN
        RETURN QUERY SELECT false, 
            'Gift card must be redeemed for full amount: ₦' || card_record.amount::TEXT, 
            card_record.balance;
        RETURN;
    END IF;
    
    -- Update the gift card as fully redeemed
    UPDATE gift_cards 
    SET 
        balance = 0,
        redeemed_at = NOW(),
        redeemed_by = p_redeemed_by,
        is_active = false
    WHERE id = card_record.id;
    
    -- Return success
    RETURN QUERY SELECT true, 
        'Successfully redeemed ₦' || p_amount::TEXT,
        0;
END;
$function$;