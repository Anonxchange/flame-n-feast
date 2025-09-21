-- Create function to generate unique gift card codes
CREATE OR REPLACE FUNCTION public.generate_gift_card_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_check BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 12-character alphanumeric code
        code := UPPER(
            SUBSTR(
                MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 
                1, 4
            ) || '-' ||
            SUBSTR(
                MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 
                1, 4
            ) || '-' ||
            SUBSTR(
                MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT), 
                1, 4
            )
        );
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM public.gift_cards WHERE code = code) INTO exists_check;
        
        -- Exit loop if code is unique
        IF NOT exists_check THEN
            EXIT;
        END IF;
    END LOOP;
    
    RETURN code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to create a new gift card
CREATE OR REPLACE FUNCTION public.create_gift_card(
    p_amount NUMERIC,
    p_created_by UUID DEFAULT auth.uid(),
    p_expires_in_months INTEGER DEFAULT 12
)
RETURNS TABLE(
    gift_card_id UUID,
    gift_card_code TEXT,
    amount NUMERIC,
    expires_at TIMESTAMP
) AS $$
DECLARE
    new_code TEXT;
    new_id UUID;
    expiry_date TIMESTAMP;
BEGIN
    -- Generate unique code
    new_code := public.generate_gift_card_code();
    
    -- Calculate expiry date
    expiry_date := NOW() + (p_expires_in_months || ' months')::INTERVAL;
    
    -- Insert gift card
    INSERT INTO public.gift_cards (
        code,
        amount,
        balance,
        created_by,
        expires_at,
        created_at
    ) VALUES (
        new_code,
        p_amount,
        p_amount, -- Initial balance equals amount
        p_created_by,
        expiry_date,
        NOW()
    ) RETURNING id INTO new_id;
    
    -- Return the created gift card details
    RETURN QUERY SELECT 
        new_id,
        new_code,
        p_amount,
        expiry_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create function to redeem gift card
CREATE OR REPLACE FUNCTION public.redeem_gift_card(
    p_code TEXT,
    p_amount NUMERIC,
    p_redeemed_by UUID DEFAULT auth.uid()
)
RETURNS TABLE(
    success BOOLEAN,
    message TEXT,
    remaining_balance NUMERIC
) AS $$
DECLARE
    card_record RECORD;
    new_balance NUMERIC;
BEGIN
    -- Find the gift card
    SELECT * INTO card_record
    FROM public.gift_cards
    WHERE code = p_code AND is_active = true;
    
    -- Check if card exists
    IF NOT FOUND THEN
        RETURN QUERY SELECT false, 'Gift card not found or inactive'::TEXT, 0::NUMERIC;
        RETURN;
    END IF;
    
    -- Check if card is expired
    IF card_record.expires_at < NOW() THEN
        RETURN QUERY SELECT false, 'Gift card has expired'::TEXT, card_record.balance;
        RETURN;
    END IF;
    
    -- Check if sufficient balance
    IF card_record.balance < p_amount THEN
        RETURN QUERY SELECT false, 'Insufficient gift card balance'::TEXT, card_record.balance;
        RETURN;
    END IF;
    
    -- Calculate new balance
    new_balance := card_record.balance - p_amount;
    
    -- Update gift card
    UPDATE public.gift_cards
    SET 
        balance = new_balance,
        redeemed_by = p_redeemed_by,
        redeemed_at = CASE 
            WHEN card_record.redeemed_at IS NULL THEN NOW()
            ELSE card_record.redeemed_at
        END
    WHERE code = p_code;
    
    -- Insert transaction record (assuming we want to track redemptions)
    INSERT INTO public.wallet_transactions (
        user_id,
        wallet_id,
        amount,
        type,
        source,
        description,
        reference_id
    ) SELECT 
        p_redeemed_by,
        w.id,
        p_amount,
        'credit',
        'gift_card',
        'Gift card redemption: ' || p_code,
        card_record.id::TEXT
    FROM public.wallets w
    WHERE w.user_id = p_redeemed_by;
    
    -- Update wallet balance
    UPDATE public.wallets
    SET balance = balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_redeemed_by;
    
    RETURN QUERY SELECT true, 'Gift card redeemed successfully'::TEXT, new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;