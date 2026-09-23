import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { generateWhatsAppLink } from '../utils/whatsapp';

interface InquiryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InquiryFormModal: React.FC<InquiryFormModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, guestCount } = useCart();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventAddress: '',
    eventType: '',
    eventDate: ''
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const url = generateWhatsAppLink(cartItems, guestCount, formData);
    window.open(url, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-5 sm:p-6 overflow-y-auto max-h-[85vh] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Your Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2"
            aria-label="Close form"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Phone</label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Event Address</label>
            <input
              type="text"
              name="eventAddress"
              required
              value={formData.eventAddress}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Event Type (optional)</label>
            <input
              type="text"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Event Date (optional)</label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#E5A985] hover:bg-[#d49975] text-white py-3 rounded-lg font-medium transition-colors mt-2"
            >
              Send on WhatsApp
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
