import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift } from 'lucide-react';

interface GiftCardProps {
  onAddToCart: (amount: number) => void;
}

const giftCardAmounts = [5000, 10000, 15000, 25000, 50000];

export function GiftCardSection({ onAddToCart }: GiftCardProps) {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-bebas text-4xl md:text-6xl text-accent mb-4">
            Gift Cards
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Give the gift of amazing grilled food! Perfect for birthdays, holidays, or any special occasion.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {giftCardAmounts.map((amount) => (
            <Card key={amount} className="relative overflow-hidden group hover:shadow-lg transition-shadow gradient-subtle border-accent/20">
              <div className="absolute inset-0 gradient-primary opacity-10" />
              <CardHeader className="text-center relative z-10">
                <Gift className="w-8 h-8 mx-auto text-primary mb-2" />
                <CardTitle className="font-bebas text-2xl text-accent">
                  {formatPrice(amount)}
                </CardTitle>
                <CardDescription>
                  Digital Gift Card
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center relative z-10">
                <Badge className="gradient-gold text-accent-foreground mb-4">
                  Instant Delivery
                </Badge>
                <Button 
                  variant="fire" 
                  className="w-full"
                  onClick={() => onAddToCart(amount)}
                >
                  Add to Cart
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <div className="max-w-3xl mx-auto">
            <h3 className="font-bebas text-2xl text-accent mb-4">How Gift Cards Work</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-accent-foreground font-bold">1</span>
                </div>
                <p>Purchase your gift card amount and complete payment</p>
              </div>
              <div>
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-accent-foreground font-bold">2</span>
                </div>
                <p>Receive your unique gift card code instantly</p>
              </div>
              <div>
                <div className="w-12 h-12 gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                  <span className="text-accent-foreground font-bold">3</span>
                </div>
                <p>Redeem at checkout or add to your wallet balance</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}