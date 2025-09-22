import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateGiftCardRequest {
  amount: number;
  expiresInMonths?: number;
}

interface CreateGiftCardResponse {
  success: boolean;
  giftCard?: {
    id: string;
    code: string;
    amount: number;
    expiresAt: string;
  };
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header (for user context)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Extract user ID from JWT for RLS context
    const token = authHeader.replace('Bearer ', '');
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub;

    const { amount, expiresInMonths = 12 }: CreateGiftCardRequest = await req.json();

    console.log('Creating gift card:', { amount, expiresInMonths });

    // Validate amount
    if (!amount || amount < 500) {
      throw new Error('Gift card amount must be at least ₦500');
    }

    if (amount > 100000) {
      throw new Error('Gift card amount cannot exceed ₦100,000');
    }

    // Create gift card using database function
    const { data, error } = await supabaseClient.rpc('create_gift_card', {
      p_amount: amount,
      p_expires_in_months: expiresInMonths
    });

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to create gift card: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('No gift card data returned');
    }

    const giftCard = data[0];
    console.log('Gift card created successfully:', giftCard);

    const response: CreateGiftCardResponse = {
      success: true,
      giftCard: {
        id: giftCard.gift_card_id,
        code: giftCard.gift_card_code,
        amount: giftCard.amount,
        expiresAt: giftCard.expires_at
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in create-gift-card function:', error);
    
    const response: CreateGiftCardResponse = {
      success: false,
      error: error.message
    };

    return new Response(JSON.stringify(response), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});