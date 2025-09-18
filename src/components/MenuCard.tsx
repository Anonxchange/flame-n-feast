import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import { MenuItem } from '@/hooks/useCart';

interface MenuCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem) => void;
}

export function MenuCard({ item, onAddToCart }: MenuCardProps) {
  const formatPrice = (price: number) => {
    return `₦${price.toLocaleString()}`;
  };

  return (
    <Card className="overflow-hidden transition-smooth hover:scale-105 hover:glow-fire group">
      <div className="relative h-48 overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-smooth group-hover:scale-110"
          loading="lazy"
        />
        <Badge className="absolute top-3 left-3 gradient-gold text-accent-foreground font-medium">
          {item.category}
        </Badge>
      </div>
      
      <div className="p-6">
        <h3 className="font-bebas text-xl text-accent mb-2">{item.name}</h3>
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {item.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="font-bebas text-2xl text-primary">
            {formatPrice(item.price)}
          </span>
          <Button
            variant="fire"
            size="sm"
            onClick={() => onAddToCart(item)}
            className="transition-bounce hover:scale-110"
          >
            <Plus className="w-4 h-4 mr-1" />
            Add to Cart
          </Button>
        </div>
      </div>
    </Card>
  );
}