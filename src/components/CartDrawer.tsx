import React, { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { GuestCountSelector } from './GuestCountSelector';
import { QuantityControl } from './QuantityControl';
import { InquiryFormModal } from './InquiryFormModal';

export const CartDrawer: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { 
    cartItems, 
    isCartDrawerOpen, 
    setIsCartDrawerOpen, 
    updateQuantity, 
    removeItem
  } = useCart();

  if (!isCartDrawerOpen) return null;

  // Group items by categoryId to mimic the "BREAKFAST" section headers in the drawer
  const groupedItems = cartItems.reduce((acc, item) => {
    if (!acc[item.categoryId]) {
      acc[item.categoryId] = [];
    }
    acc[item.categoryId].push(item);
    return acc;
  }, {} as Record<string, typeof cartItems>);

  const handleSendInquiry = () => {
    setIsModalOpen(true);
  };

  return (
    <>
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartDrawerOpen(false)}
      />
      
      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-2">
          <h2 className="text-2xl font-semibold text-slate-900">Your Selection</h2>
          <button 
            onClick={() => setIsCartDrawerOpen(false)}
            className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:bg-gray-100 transition-colors -mr-2"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 pt-4 space-y-8">
          
          {/* Guest Count */}
          <section>
            <h3 className="text-sm font-medium text-slate-800 mb-3">Guest count</h3>
            <GuestCountSelector />
          </section>
          
          {/* Items */}
          {Object.entries(groupedItems).map(([categoryId, items]) => (
            <section key={categoryId}>
              <h4 className="text-xs font-bold text-primary tracking-wider uppercase mb-3">
                {categoryId}
              </h4>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-slate-800 text-sm font-medium flex-1">{item.name}</span>
                    <div className="flex items-center gap-3">
                      <QuantityControl 
                        quantity={item.quantity}
                        onIncrement={() => updateQuantity(item.id, item.quantity + 1)}
                        onDecrement={() => updateQuantity(item.id, item.quantity - 1)}
                      />
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-600 p-2 -mr-2"
                        aria-label={`Remove ${item.name}`}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
          
          {cartItems.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              Your cart is empty. Add some delicious dishes!
            </div>
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-100 bg-white">
            <button
              onClick={handleSendInquiry}
              className="w-full bg-[#ea580c] hover:bg-[#d94f0b] text-white py-3.5 rounded-md font-medium transition-colors"
            >
              Send Catering Inquiry
            </button>
          </div>
        )}
      </div>
    </div>
    <InquiryFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  );
};
