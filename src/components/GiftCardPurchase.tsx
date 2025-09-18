import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Gift } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export interface GiftCard {
  id: string;
  amount: number;
  customAmount?: number;
}

interface GiftCardPurchaseProps {
  onAddToCart: (giftCard: GiftCard) => void;
}

export function GiftCardPurchase({ onAddToCart }: GiftCardPurchaseProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const { toast } = useToast();

  const predefinedAmounts = [1000, 2500, 5000, 10000, 15000, 25000];

  const handleAddToCart = () => {
    const amount = selectedAmount === -1 ? parseFloat(customAmount) : selectedAmount;
    
    if (!amount || amount < 500) {
      toast({
        title: "Invalid Amount",
        description: "Gift card amount must be at least ₦500",
        variant: "destructive",
      });
      return;
    }

    if (amount > 100000) {
      toast({
        title: "Invalid Amount", 
        description: "Gift card amount cannot exceed ₦100,000",
        variant: "destructive",
      });
      return;
    }

    const giftCard: GiftCard = {
      id: `gift-${Date.now()}`,
      amount,
      customAmount: selectedAmount === -1 ? amount : undefined
    };

    onAddToCart(giftCard);
    
    toast({
      title: "Added to Cart",
      description: `₦${amount.toLocaleString()} gift card added to cart`,
    });

    // Reset selection
    setSelectedAmount(null);
    setCustomAmount('');
  };

  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  return (
    <Card className="gradient-card border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-accent font-bebas text-2xl">
          <Gift className="w-6 h-6" />
          Gift Cards
        </CardTitle>
        <CardDescription>
          Perfect for friends and family who love great grilled food!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <Label className="text-sm font-medium mb-3 block">Select Amount</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {predefinedAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "fire" : "outline"}
                className="h-12"
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount('');
                }}
              >
                {formatPrice(amount)}
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium">Or Enter Custom Amount</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₦</span>
              <Input
                type="number"
                placeholder="500"
                min="500"
                max="100000"
                className="pl-8"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(-1);
                }}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                if (customAmount) {
                  setSelectedAmount(-1);
                } else {
                  setSelectedAmount(null);
                  setCustomAmount('');
                }
              }}
              className={selectedAmount === -1 && customAmount ? "bg-primary text-primary-foreground" : ""}
            >
              Custom
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Min: ₦500 • Max: ₦100,000
          </p>
        </div>

        <Button
          onClick={handleAddToCart}
          disabled={!selectedAmount && (!customAmount || parseFloat(customAmount) < 500)}
          className="w-full"
          variant="gold"
          size="lg"
        >
          Add Gift Card to Cart
        </Button>
      </CardContent>
    </Card>
  );
}