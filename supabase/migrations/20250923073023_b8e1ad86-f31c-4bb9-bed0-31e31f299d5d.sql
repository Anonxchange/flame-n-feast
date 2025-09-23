-- Update gift card code generator to create 16-character codes
CREATE OR REPLACE FUNCTION public.generate_gift_card_code()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    letters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    numbers TEXT := '0123456789';
    code TEXT := '';
    i INTEGER;
BEGIN
    -- Generate 8 letters
    FOR i IN 1..8 LOOP
        code := code || substr(letters, floor(random() * length(letters) + 1)::int, 1);
    END LOOP;
    
    -- Generate 8 numbers
    FOR i IN 1..8 LOOP
        code := code || substr(numbers, floor(random() * length(numbers) + 1)::int, 1);
    END LOOP;
    
    RETURN code;
END;
$function$;