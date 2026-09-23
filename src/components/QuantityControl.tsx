import React from 'react';
import { Minus, Plus } from 'lucide-react';
import { cn } from './ui/Button';

interface QuantityControlProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export const QuantityControl: React.FC<QuantityControlProps> = ({
  quantity,
  onIncrement,
  onDecrement,
}) => {
  return (
    <div className="flex items-center gap-3 bg-slate-50 border border-gray-100 rounded-full p-1 shadow-sm">
      <button
        onClick={onDecrement}
        className="w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-full hover:bg-gray-200 transition-colors text-slate-600 disabled:opacity-50"
        aria-label="Decrease quantity"
      >
        <Minus size={16} />
      </button>
      
      <span className="w-5 text-center text-sm font-medium text-slate-800">
        {quantity}
      </span>
      
      <button
        onClick={onIncrement}
        className={cn(
          "w-9 h-9 sm:w-8 sm:h-8 flex items-center justify-center rounded-full transition-colors",
          quantity > 0 
            ? "bg-primary/10 text-primary hover:bg-primary/20" 
            : "hover:bg-gray-200 text-slate-600"
        )}
        aria-label="Increase quantity"
      >
        <Plus size={16} />
      </button>
    </div>
  );
};
