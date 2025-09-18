import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Plus, Minus, Trash2, Gift } from 'lucide-react';
import { CartItem, GiftCardCartItem } from '@/hooks/useCart';
import { Separator } from '@/components/ui/separator';

interface CartSidebarProps {
  items: (CartItem | GiftCardCartItem)[];
  totalPrice: number;
  totalItems: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export function CartSidebar({
  items,
  totalPrice,
  totalItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: CartSidebarProps) {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="fire" size="lg" className="relative">
          <ShoppingCart className="w-5 h-5 mr-2" />
          Cart
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 gradient-gold text-accent-foreground text-xs min-w-6 h-6 flex items-center justify-center rounded-full">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-96 sm:max-w-96">
        <SheetHeader>
          <SheetTitle className="font-bebas text-2xl text-accent">Your Cart</SheetTitle>
        </SheetHeader>
        
        <div className="mt-6 space-y-4 flex-1">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Your cart is empty</p>
              <p className="text-sm text-muted-foreground mt-2">Add some delicious items to get started!</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3 p-3 bg-card rounded-lg">
                    {item.type === 'gift_card' ? (
                      <div className="w-16 h-16 gradient-gold rounded-md flex items-center justify-center">
                        <Gift className="w-8 h-8 text-accent-foreground" />
                      </div>
                    ) : (
                      <img
                        src={(item as CartItem).image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{item.name}</h4>
                      <p className="text-primary font-bebas text-lg">
                        {item.type === 'gift_card' 
                          ? formatPrice((item as GiftCardCartItem).amount)
                          : formatPrice((item as CartItem).price)
                        }
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => onRemoveItem(item.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-bebas text-xl">Total:</span>
                  <span className="font-bebas text-2xl text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
                
                <Button
                  variant="gold"
                  size="lg"
                  className="w-full"
                  onClick={onCheckout}
                  disabled={items.length === 0}
                >
                  Proceed to Checkout
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}