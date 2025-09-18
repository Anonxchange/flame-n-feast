-- Create gift cards table
CREATE TABLE public.gift_cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  balance DECIMAL(10,2) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_by UUID REFERENCES auth.users(id),
  redeemed_by UUID REFERENCES auth.users(id),
  redeemed_at TIMESTAMP WITH TIME ZONE
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL, -- 'paystack', 'flutterwave', 'wallet'
  payment_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  order_type TEXT NOT NULL, -- 'food', 'gift_card'
  items JSONB NOT NULL,
  customer_info JSONB, -- For guest orders
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallets table
CREATE TABLE public.wallets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallet transactions table
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(10,2) NOT NULL,
  type TEXT NOT NULL, -- 'credit', 'debit'
  source TEXT NOT NULL, -- 'gift_card_redemption', 'admin_topup', 'order_payment'
  reference_id UUID, -- Can reference gift_card id or order id
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.gift_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- Gift cards policies (admin can manage, users can view their redeemed ones)
CREATE POLICY "Admin can manage all gift cards" 
ON public.gift_cards 
FOR ALL 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can view gift cards they redeemed" 
ON public.gift_cards 
FOR SELECT 
USING (redeemed_by = auth.uid());

-- Orders policies
CREATE POLICY "Users can view their own orders" 
ON public.orders 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can update their own orders" 
ON public.orders 
FOR UPDATE 
USING (user_id = auth.uid());

-- Wallets policies
CREATE POLICY "Users can view their own wallet" 
ON public.wallets 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can create their own wallet" 
ON public.wallets 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Wallet transactions policies
CREATE POLICY "Users can view their own transactions" 
ON public.wallet_transactions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "System can create transactions" 
ON public.wallet_transactions 
FOR INSERT 
WITH CHECK (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_wallets_updated_at
BEFORE UPDATE ON public.wallets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically create wallet for new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.wallets (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger to create wallet when user signs up
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();