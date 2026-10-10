import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { MenuItem } from '../data/menu';

export type CartItem = MenuItem;

export interface FoodQuantity {
  dishId: string;
  dishName: string;  // canonical English name (snapshot)
  quantity: number;  // in kg
  unit: 'kg';
}

interface CartContextType {
  cartItems: CartItem[];
  guestCount: number | null;
  setGuestCount: (count: number | null) => void;
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalItems: number;
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (isOpen: boolean) => void;
  isRiceSuggestionOpen: boolean;
  setIsRiceSuggestionOpen: (isOpen: boolean) => void;
  // Food quantity (kg) management
  foodQuantities: FoodQuantity[];
  addFoodQuantity: (q: FoodQuantity) => void;
  updateFoodQuantity: (dishId: string, quantity: number) => void;
  removeFoodQuantity: (dishId: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [guestCount, setGuestCountState] = useState<number | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isRiceSuggestionOpen, setIsRiceSuggestionOpen] = useState(false);
  const [foodQuantities, setFoodQuantities] = useState<FoodQuantity[]>([]);

  const setGuestCount = useCallback((count: number | null) => {
    setGuestCountState(count);
  }, []);

  const addItem = useCallback((item: MenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev;
      }

      // Trigger recommendation ONLY for the dish "Rice"
      const isRice = item.id === 'ms2' || item.name.trim().toLowerCase() === 'rice';
      if (isRice) {
        setIsRiceSuggestionOpen(true);
      }

      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    setFoodQuantities((prev) => prev.filter((fq) => fq.dishId !== id));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    setFoodQuantities([]);
  }, []);

  const addFoodQuantity = useCallback((q: FoodQuantity) => {
    setFoodQuantities((prev) => {
      const exists = prev.find((fq) => fq.dishId === q.dishId);
      if (exists) {
        return prev.map((fq) => fq.dishId === q.dishId ? { ...fq, quantity: q.quantity } : fq);
      }
      return [...prev, q];
    });
  }, []);

  const updateFoodQuantity = useCallback((dishId: string, quantity: number) => {
    setFoodQuantities((prev) =>
      prev.map((fq) => fq.dishId === dishId ? { ...fq, quantity } : fq)
    );
  }, []);

  const removeFoodQuantity = useCallback((dishId: string) => {
    setFoodQuantities((prev) => prev.filter((fq) => fq.dishId !== dishId));
  }, []);

  const totalItems = cartItems.length;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        guestCount,
        setGuestCount,
        addItem,
        removeItem,
        clearCart,
        totalItems,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isRiceSuggestionOpen,
        setIsRiceSuggestionOpen,
        foodQuantities,
        addFoodQuantity,
        updateFoodQuantity,
        removeFoodQuantity,
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

