import React from 'react';
import type { MenuItem } from '../data/menu';
import { useCart } from '../context/CartContext';
import { QuantityControl } from './QuantityControl';

interface MenuItemCardProps {
  item: MenuItem;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item }) => {
  const { cartItems, addItem, updateQuantity } = useCart();
  
  const cartItem = cartItems.find((i) => i.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const handleIncrement = () => {
    if (quantity === 0) {
      addItem(item);
    } else {
      updateQuantity(item.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      updateQuantity(item.id, quantity - 1);
    }
  };

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all hover:shadow-md">
      {/* Image */}
      <div className="relative w-full aspect-video">
        <img 
          src={item.image} 
          alt={item.name} 
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      
      {/* Content */}
      <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <h3 className="font-medium text-slate-800 flex-1 line-clamp-2">{item.name}</h3>
        <QuantityControl 
          quantity={quantity} 
          onIncrement={handleIncrement} 
          onDecrement={handleDecrement} 
        />
      </div>
    </div>
  );
};
