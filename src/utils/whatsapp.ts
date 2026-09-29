import type { CartItem } from '../context/CartContext';
import { siteConfig } from '../config/site';

interface InquiryFormData {
  name: string;
  phone: string;
  eventAddress: string;
  eventType?: string;
  eventDate?: string;
}

export const generateWhatsAppLink = (
  cartItems: CartItem[],
  guestCount: number | null,
  formData: InquiryFormData
): string => {
  const number = siteConfig.whatsappNumber;
  
  let message = `Hello ${siteConfig.name},\nI would like to make a catering inquiry.\n\n`;
  
  message += `*Customer Details:*\n`;
  message += `- Name: ${formData.name}\n`;
  message += `- Phone: ${formData.phone}\n`;
  message += `- Address: ${formData.eventAddress}\n`;
  if (formData.eventType) message += `- Event Type: ${formData.eventType}\n`;
  if (formData.eventDate) message += `- Date: ${formData.eventDate}\n`;
  message += `\n`;

  if (guestCount !== null) {
    message += `*Guest Count:* ${guestCount}\n\n`;
  }

  message += `*Selected Dishes:*\n`;
  
  // Group by category for better readability
  const groupedItems = cartItems.reduce((acc, item) => {
    if (!acc[item.categoryId]) {
      acc[item.categoryId] = [];
    }
    acc[item.categoryId].push(item);
    return acc;
  }, {} as Record<string, CartItem[]>);

  for (const [category, items] of Object.entries(groupedItems)) {
    message += `\n_${category.toUpperCase()}_\n`;
    items.forEach((item) => {
      message += `- ${item.name}\n`;
    });
  }
  
  message += `\nPlease let me know the total cost and availability.`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedMessage}`;
};
