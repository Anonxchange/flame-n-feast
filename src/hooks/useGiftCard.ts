import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface CreatedGiftCard {
  id: string;
  code: string;
  amount: number;
  expiresAt: string;
}

export function useGiftCard() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const createGiftCard = async (amount: number): Promise<CreatedGiftCard | null> => {
    setLoading(true);
    try {
      console.log('Creating gift card with amount:', amount);

      const { data, error } = await supabase.functions.invoke('create-gift-card', {
        body: { amount }
      });

      if (error) {
        console.error('Supabase function error:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to create gift card",
          variant: "destructive",
        });
        return null;
      }

      if (!data.success) {
        console.error('Gift card creation failed:', data.error);
        toast({
          title: "Error",
          description: data.error || "Failed to create gift card",
          variant: "destructive",
        });
        return null;
      }

      const giftCard = data.giftCard;
      console.log('Gift card created successfully:', giftCard);

      toast({
        title: "Gift Card Created!",
        description: `Gift card ${giftCard.code} for ₦${amount.toLocaleString()} created successfully`,
      });

      return giftCard;
    } catch (error) {
      console.error('Error creating gift card:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const redeemGiftCard = async (code: string, amount: number): Promise<boolean> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('redeem_gift_card', {
        p_code: code,
        p_amount: amount
      });

      if (error) {
        console.error('Error redeeming gift card:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to redeem gift card",
          variant: "destructive",
        });
        return false;
      }

      const result = data[0];
      if (!result.success) {
        toast({
          title: "Redemption Failed",
          description: result.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Gift Card Redeemed!",
        description: `${result.message}. Remaining balance: ₦${result.remaining_balance.toLocaleString()}`,
      });

      return true;
    } catch (error) {
      console.error('Error redeeming gift card:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createGiftCard,
    redeemGiftCard,
    loading
  };
}