-- Update gift card code generator to randomly mix letters and numbers
CREATE OR REPLACE FUNCTION public.generate_gift_card_code()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    code TEXT := '';
    i INTEGER;
BEGIN
    -- Generate 16 random characters (mix of letters and numbers)
    FOR i IN 1..16 LOOP
        code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    
    RETURN code;
END;
$function$;