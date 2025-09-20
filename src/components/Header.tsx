import { Button } from '@/components/ui/button';
import { Flame, User, Wallet, LogOut } from 'lucide-react';
import { CartSidebar } from './CartSidebar';
import { CartItem, GiftCardCartItem } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface HeaderProps {
  cartItems: (CartItem | GiftCardCartItem)[];
  totalPrice: number;
  totalItems: number;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckout: () => void;
}

export function Header({
  cartItems,
  totalPrice,
  totalItems,
  onUpdateQuantity,
  onRemoveItem,
  onCheckout,
}: HeaderProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };
  return (
    <header className="sticky top-0 z-50 gradient-smoke border-b border-border/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-fire rounded-lg flex items-center justify-center glow-fire">
              <Flame className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-bebas text-2xl text-accent tracking-wider">
                SIZZLING GRILLS
              </h1>
              <p className="text-xs text-muted-foreground">Premium BBQ Experience</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#menu" className="text-foreground hover:text-primary transition-smooth">
              Menu
            </a>
            <a href="#about" className="text-foreground hover:text-primary transition-smooth">
              About
            </a>
            <a href="#contact" className="text-foreground hover:text-primary transition-smooth">
              Contact
            </a>
          </nav>
          
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="hidden sm:flex">
              <Wallet className="w-5 h-5" />
            </Button>
            
            {/* User Info and Sign Out */}
            {user && (
              <div className="hidden sm:flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-accent"
                >
                  <User className="w-4 h-4 mr-2" />
                  <span className="text-sm">{user.email}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSignOut}
                  className="text-muted-foreground hover:text-accent"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
            
            <CartSidebar
              items={cartItems}
              totalPrice={totalPrice}
              totalItems={totalItems}
              onUpdateQuantity={onUpdateQuantity}
              onRemoveItem={onRemoveItem}
              onCheckout={onCheckout}
            />
          </div>
        </div>
      </div>
    </header>
  );
}