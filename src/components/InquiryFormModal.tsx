import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { generateWhatsAppLink } from '../utils/whatsapp';
import { orderService } from '../services/orderService';
import type { OrderItem } from '../types/admin';

interface InquiryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InquiryFormModal: React.FC<InquiryFormModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, guestCount, clearCart } = useCart();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    eventAddress: '',
    eventType: '',
    eventDate: ''
  });

  const [orderId, setOrderId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    if (errors[e.target.name]) {
      setErrors(prev => { const n = { ...prev }; delete n[e.target.name]; return n; });
    }
  };

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Name is required.';
    if (!formData.phone.trim()) errs.phone = 'Phone number is required.';
    else if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) errs.phone = 'Enter a valid 10-digit mobile number.';
    if (!formData.eventAddress.trim()) errs.eventAddress = 'Event address is required.';
    if (!formData.eventDate) errs.eventDate = 'Event date is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Save order to localStorage via orderService
    const orderItems: OrderItem[] = cartItems.map((item) => ({
      dishId: item.id,
      dishName: item.name,   // snapshot — safe even if dish is later renamed/deleted
      categoryId: item.categoryId,
      quantity: item.quantity,
    }));

    const order = orderService.create({
      customerName: formData.name.trim(),
      mobile: formData.phone.replace(/\s/g, ''),
      eventAddress: formData.eventAddress.trim(),
      eventType: formData.eventType.trim(),
      orderDate: formData.eventDate,
      items: orderItems,
      guestCount,
      totalAmount: 0,
      advanceAmount: 0,
      balancePaid: 0,
      status: 'Pending',
      notes: '',
    });

    setOrderId(order.id);
    setSubmitted(true);

    // Also send via WhatsApp (existing behaviour preserved)
    const url = generateWhatsAppLink(cartItems, guestCount, formData);
    window.open(url, '_blank');

    clearCart();
  };

  if (submitted && orderId) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check size={28} className="text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Order Placed!</h2>
          <p className="text-slate-600 text-sm mb-4">
            Your inquiry has been sent via WhatsApp. The caterer will confirm shortly.
          </p>
          <div className="bg-orange-50 border border-orange-200 rounded-lg px-4 py-3 mb-6">
            <p className="text-xs text-orange-700 font-medium">Your Order ID</p>
            <p className="text-xl font-bold text-primary mt-0.5">{orderId}</p>
          </div>
          <button
            onClick={onClose}
            className="w-full bg-primary hover:bg-primary/90 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-5 sm:p-6 overflow-y-auto max-h-[90vh] mx-auto">
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Name *</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.name ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Phone *</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.phone ? 'border-red-400' : 'border-gray-300'}`}
              placeholder="10-digit mobile number"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-1">Event Address *</label>
            <input
              type="text"
              name="eventAddress"
              value={formData.eventAddress}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.eventAddress ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.eventAddress && <p className="text-red-500 text-xs mt-1">{errors.eventAddress}</p>}
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
            <label className="block text-sm font-medium text-slate-900 mb-1">Event Date *</label>
            <input
              type="date"
              name="eventDate"
              value={formData.eventDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 ${errors.eventDate ? 'border-red-400' : 'border-gray-300'}`}
            />
            {errors.eventDate && <p className="text-red-500 text-xs mt-1">{errors.eventDate}</p>}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-[#E5A985] hover:bg-[#d49975] text-white py-3 rounded-lg font-medium transition-colors mt-2"
            >
              Send on WhatsApp & Place Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
