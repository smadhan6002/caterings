import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { MenuItem } from '../data/menu';

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  guestCount: number | null;
  setGuestCount: (count: number | null) => void;
  addItem: (item: MenuItem, quantity?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [guestCount, setGuestCountState] = useState<number | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);

  // When guest count changes, scale all existing items
  const setGuestCount = useCallback((count: number | null) => {
    setGuestCountState(count);
    if (count !== null) {
      setCartItems((prev) => prev.map((item) => ({ ...item, quantity: count })));
    }
  }, []);

  const addItem = useCallback((item: MenuItem, explicitQuantity?: number) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      
      // Determine what quantity to add
      let addedQuantity = explicitQuantity;
      if (addedQuantity === undefined) {
        addedQuantity = guestCount !== null ? guestCount : 1;
      }

      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + addedQuantity! } : i
        );
      }
      return [...prev, { ...item, quantity: addedQuantity! }];
    });
  }, [guestCount]);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        guestCount,
        setGuestCount,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        totalItems,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
