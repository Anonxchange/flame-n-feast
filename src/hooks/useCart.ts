import { useState, useCallback } from 'react';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface GiftCard {
  id: string;
  amount: number;
  customAmount?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  isGiftCard?: boolean;
}

export interface GiftCardCartItem {
  id: string;
  amount: number;
  customAmount?: number;
  quantity: number;
  isGiftCard: true;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export function useCart() {
  const [items, setItems] = useState<(CartItem | GiftCardCartItem)[]>([]);

  const addItem = useCallback((item: MenuItem, quantity: number = 1) => {
    setItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id && !cartItem.isGiftCard);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id && !cartItem.isGiftCard
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const addGiftCard = useCallback((giftCard: GiftCard, quantity: number = 1) => {
    const giftCardItem: GiftCardCartItem = {
      ...giftCard,
      quantity,
      isGiftCard: true,
      name: `Gift Card - ₦${giftCard.amount.toLocaleString()}`,
      description: 'Digital gift card for Sizzling Grills',
      price: giftCard.amount,
      image: '/placeholder.svg',
      category: 'gift-card'
    };

    setItems(prev => {
      // Gift cards are always unique (no combining)
      return [...prev, giftCardItem];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getTotalPrice = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((total, item) => total + item.quantity, 0);
  }, [items]);

  return {
    items,
    addItem,
    addGiftCard,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
  };
}