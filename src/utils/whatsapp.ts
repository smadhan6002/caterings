import { siteConfig } from '../config/site';
import type { Order } from '../types/admin';

export const generateWhatsAppLink = (order: Order): string => {
  let number = siteConfig.whatsappNumber;
  
  // Ensure international format without '+' sign, assuming India (91) if it's 10 digits
  if (number.startsWith('+')) {
    number = number.substring(1);
  } else if (number.length === 10) {
    number = `91${number}`;
  }
  
  let message = `KANCHI AMBAL CATERING\nNEW CATERING ORDER\n\n`;
  message += `Order ID: ${order.id}\n\n`;
  
  message += `CUSTOMER DETAILS\n`;
  message += `Customer Name: ${order.customerName}\n`;
  message += `Mobile Number: ${order.mobile}\n`;
  message += `Delivery Date: ${order.orderDate}\n\n`;
  
  message += `CATERING DETAILS\n`;
  message += `Number of People: ${order.guestCount !== null ? order.guestCount : 'Not provided'}\n\n`;
  
  message += `SELECTED DISHES\n`;
  order.items.forEach((item, index) => {
    message += `${index + 1}. ${item.dishName}\n`;
  });
  message += `\n`;

  message += `ADDITIONAL REQUIREMENTS\n`;
  message += `${order.notes || 'None'}\n\n`;

  message += `Please confirm this catering order.\n\nThank you!\nKanchi Ambal Catering`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedMessage}`;
};
