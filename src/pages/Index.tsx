import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Flame, Star, Clock, Shield } from 'lucide-react';
import { Header } from '@/components/Header';
import { MenuCard } from '@/components/MenuCard';
import { GiftCardSection } from '@/components/GiftCardSection';
import { useCart } from '@/hooks/useCart';
import { menuItems } from '@/data/menuItems';
import { toast } from '@/hooks/use-toast';
import heroBbq from '@/assets/hero-bbq.jpg';

const Index = () => {
  const {
    items,
    addItem,
    addGiftCard,
    removeItem,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
  } = useCart();

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];
  
  const filteredItems = selectedCategory === 'All' 
    ? menuItems 
    : menuItems.filter(item => item.category === selectedCategory);

  const handleAddToCart = (item: any) => {
    addItem(item);
    toast({
      title: "Added to cart!",
      description: `${item.name} has been added to your cart.`,
    });
  };

  const handleAddGiftCard = (amount: number) => {
    const giftCard = {
      id: `gift-${Date.now()}`,
      amount
    };
    addGiftCard(giftCard);
    toast({
      title: "Gift card added!",
      description: `₦${amount.toLocaleString()} gift card has been added to your cart.`,
    });
  };

  const handleCheckout = () => {
    toast({
      title: "Checkout",
      description: "Connect to Supabase to enable full checkout functionality with payments and user accounts.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        cartItems={items}
        totalPrice={getTotalPrice()}
        totalItems={getTotalItems()}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckout={handleCheckout}
      />

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroBbq})` }}
        >
          <div className="absolute inset-0 bg-black/60" />
        </div>
        
        <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
          <Badge className="gradient-gold text-accent-foreground mb-6 text-lg px-6 py-2">
            Premium BBQ Experience
          </Badge>
          <h1 className="font-bebas text-6xl md:text-8xl text-white mb-6 tracking-wider">
            SIZZLING GRILLS
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Experience the finest grilled food and BBQ. From premium steaks to smoky wings, 
            every bite is crafted to perfection over open flames.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="fire" size="lg" className="text-lg px-8 py-6">
              <Flame className="w-5 h-5 mr-2" />
              Order Now
            </Button>
            <Button variant="smoke" size="lg" className="text-lg px-8 py-6">
              View Menu
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 gradient-fire rounded-full flex items-center justify-center mx-auto mb-4 glow-fire">
                <Star className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-bebas text-xl text-accent mb-2">Premium Quality</h3>
              <p className="text-muted-foreground">Only the finest ingredients, grilled to perfection</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 gradient-gold rounded-full flex items-center justify-center mx-auto mb-4 glow-gold">
                <Clock className="w-8 h-8 text-accent-foreground" />
              </div>
              <h3 className="font-bebas text-xl text-accent mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">Hot and fresh food delivered in 30 minutes</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 gradient-fire rounded-full flex items-center justify-center mx-auto mb-4 glow-fire">
                <Shield className="w-8 h-8 text-primary-foreground" />
              </div>
              <h3 className="font-bebas text-xl text-accent mb-2">Secure Payments</h3>
              <p className="text-muted-foreground">Multiple payment options including wallet & gift cards</p>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="font-bebas text-4xl md:text-5xl text-accent mb-4">OUR MENU</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover our mouthwatering selection of grilled delicacies
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "fire" : "smoke"}
                onClick={() => setSelectedCategory(category)}
                className="transition-bounce"
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Menu Items */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <MenuCard
                key={item.id}
                item={item}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      <GiftCardSection onAddToCart={handleAddGiftCard} />

      {/* Footer */}
      <footer className="gradient-smoke py-12 border-t border-border/50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-8 h-8 gradient-fire rounded-lg flex items-center justify-center">
                <Flame className="w-5 h-5 text-primary-foreground" />
              </div>
              <h3 className="font-bebas text-xl text-accent">SIZZLING GRILLS</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Experience the art of grilling with every bite
            </p>
            <p className="text-sm text-muted-foreground">
              © 2024 Sizzling Grills. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;