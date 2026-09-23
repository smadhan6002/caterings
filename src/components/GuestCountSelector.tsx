import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { cn } from './ui/Button';

export const GuestCountSelector: React.FC = () => {
  const { guestCount, setGuestCount } = useCart();
  const [isCustom, setIsCustom] = useState(false);
  
  const presets = [50, 100, 150, 200];
  
  // If the current guest count isn't in presets and isn't null, it's custom.
  const currentIsCustom = isCustom || (guestCount !== null && !presets.includes(guestCount));

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val) && val > 0) {
      setGuestCount(val);
    } else if (e.target.value === '') {
      setGuestCount(null);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset}
            onClick={() => {
              setGuestCount(preset);
              setIsCustom(false);
            }}
            className={cn(
              "px-4 py-1.5 rounded-md text-sm transition-colors border",
              guestCount === preset && !isCustom
                ? "bg-primary text-white border-primary"
                : "bg-white text-slate-700 border-gray-200 hover:bg-gray-50"
            )}
          >
            {preset}
          </button>
        ))}
        
        <button
          onClick={() => setIsCustom(true)}
          className={cn(
            "px-4 py-1.5 rounded-md text-sm transition-colors border",
            currentIsCustom
              ? "bg-primary text-white border-primary"
              : "bg-white text-slate-700 border-gray-200 hover:bg-gray-50"
          )}
        >
          Custom
        </button>
      </div>
      
      {currentIsCustom && (
        <input
          type="number"
          min="1"
          placeholder="Enter guest count"
          value={guestCount || ''}
          onChange={handleCustomChange}
          className="w-full px-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 text-slate-800"
        />
      )}
    </div>
  );
};
