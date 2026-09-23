import React from 'react';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const CartActionBar: React.FC = () => {
  const { totalItems, setIsCartDrawerOpen } = useCart();

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none pb-safe">
      <div className="max-w-7xl mx-auto flex justify-center pointer-events-auto md:px-6 lg:px-8">
        <button
          onClick={() => setIsCartDrawerOpen(true)}
          className="w-full max-w-md bg-[#ea580c] hover:bg-[#d94f0b] text-white py-3.5 px-6 rounded-lg font-medium flex items-center justify-center gap-2 shadow-lg transition-transform hover:scale-[1.02] active:scale-95"
        >
          <ShoppingCart size={20} />
          View Cart ({totalItems})
        </button>
      </div>
    </div>
  );
};
