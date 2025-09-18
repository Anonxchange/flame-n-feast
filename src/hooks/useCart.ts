import { useState, useCallback } from 'react';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface GiftCardItem {
  id: string;
  name: string;
  amount: number;
  type: 'gift_card';
}

export interface CartItem extends MenuItem {
  quantity: number;
  type?: 'food';
}

export interface GiftCardCartItem extends GiftCardItem {
  quantity: number;
  type: 'gift_card';
}

export function useCart() {
  const [items, setItems] = useState<(CartItem | GiftCardCartItem)[]>([]);

  const addItem = useCallback((item: MenuItem, quantity: number = 1) => {
    setItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity, type: 'food' as const }];
    });
  }, []);

  const addGiftCard = useCallback((amount: number, quantity: number = 1) => {
    const giftCardId = `gift-card-${amount}`;
    setItems(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === giftCardId);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === giftCardId
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      const giftCard: GiftCardCartItem = {
        id: giftCardId,
        name: `₦${amount.toLocaleString()} Gift Card`,
        amount,
        quantity,
        type: 'gift_card'
      };
      return [...prev, giftCard];
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
    return items.reduce((total, item) => {
      const itemPrice = item.type === 'gift_card' ? (item as GiftCardCartItem).amount : (item as CartItem).price;
      return total + (itemPrice * item.quantity);
    }, 0);
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