import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Gift, ShoppingCart, Clock } from 'lucide-react';
import { useGiftCard, type CreatedGiftCard } from '@/hooks/useGiftCard';
import { CartItem, GiftCardCartItem } from '@/hooks/useCart';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: (CartItem | GiftCardCartItem)[];
  totalPrice: number;
  onSuccess: () => void;
}

export function CheckoutModal({ isOpen, onClose, items, totalPrice, onSuccess }: CheckoutModalProps) {
  const [processing, setProcessing] = useState(false);
  const [createdGiftCards, setCreatedGiftCards] = useState<CreatedGiftCard[]>([]);
  const { createGiftCard, loading: giftCardLoading } = useGiftCard();

  const handleCheckout = async () => {
    setProcessing(true);
    setCreatedGiftCards([]);

    try {
      // Process gift cards first
      const giftCardItems = items.filter(item => item.isGiftCard) as GiftCardCartItem[];
      const createdCards: CreatedGiftCard[] = [];

      for (const giftCardItem of giftCardItems) {
        for (let i = 0; i < giftCardItem.quantity; i++) {
          const giftCard = await createGiftCard(giftCardItem.amount);
          if (giftCard) {
            createdCards.push(giftCard);
          }
        }
      }

      setCreatedGiftCards(createdCards);

      // Here you would handle regular menu items (payment processing, order creation, etc.)
      const regularItems = items.filter(item => !item.isGiftCard);
      if (regularItems.length > 0) {
        // TODO: Implement payment processing for regular items
        console.log('Processing regular items:', regularItems);
      }

      // Success - clear cart and show results
      onSuccess();
      
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price: number) => `₦${price.toLocaleString()}`;

  const giftCardItems = items.filter(item => item.isGiftCard);
  const regularItems = items.filter(item => !item.isGiftCard);

  if (createdGiftCards.length > 0) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-accent font-bebas text-2xl">
              <Gift className="w-6 h-6" />
              Gift Cards Created Successfully!
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-muted-foreground">
              Your gift cards have been created successfully. Share these codes with recipients:
            </p>

            {createdGiftCards.map((giftCard, index) => (
              <Card key={index} className="gradient-card border-0">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-accent">
                    Gift Card #{index + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Code:</span>
                    <Badge variant="secondary" className="font-mono text-lg px-3 py-1">
                      {giftCard.code}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amount:</span>
                    <span className="font-semibold">{formatPrice(giftCard.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Expires:</span>
                    <span className="text-sm">
                      {new Date(giftCard.expiresAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button 
              onClick={onClose} 
              variant="fire" 
              size="lg" 
              className="w-full"
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-accent font-bebas text-2xl">
            <ShoppingCart className="w-6 h-6" />
            Checkout
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card className="gradient-card border-0">
            <CardHeader>
              <CardTitle className="text-lg text-accent">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{item.name}</span>
                      {item.isGiftCard && (
                        <Badge variant="secondary" className="text-xs">
                          <Gift className="w-3 h-3 mr-1" />
                          Gift Card
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
              
              <Separator />
              
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="gradient-card border-0">
            <CardHeader>
              <CardTitle className="text-lg text-accent">Payment Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {giftCardItems.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Gift className="w-4 h-4" />
                    <span>Gift cards will be generated instantly</span>
                  </div>
                )}
                
                {regularItems.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Food items will be prepared after payment</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={processing || giftCardLoading}
            >
              Cancel
            </Button>
            <Button 
              variant="fire" 
              onClick={handleCheckout}
              className="flex-1"
              disabled={processing || giftCardLoading}
            >
              {processing || giftCardLoading ? 'Processing...' : 'Complete Order'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}