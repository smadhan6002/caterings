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
  
  let message = `NEW CATERING ORDER\n\n`;
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

  const advancePaid = order.advanceAmount || 0;
  const totalPaid = (order.payments || []).reduce((sum, p) => sum + p.amount, 0) + advancePaid + (order.balancePaid || 0);
  const balanceDue = order.totalAmount > 0 ? order.totalAmount - totalPaid : 0;
  
  let paymentStatus = 'Unpaid';
  if (totalPaid > 0 && totalPaid < order.totalAmount) paymentStatus = 'Partially Paid';
  else if (totalPaid > 0 && totalPaid >= order.totalAmount) paymentStatus = 'Fully Paid';

  message += `PAYMENT DETAILS\n`;
  message += `Total Amount: ${order.totalAmount > 0 ? `₹${order.totalAmount}` : 'Not provided'}\n`;
  message += `Advance Paid: ${advancePaid > 0 ? `₹${advancePaid}` : 'Not provided'}\n`;
  message += `Total Paid: ${totalPaid > 0 ? `₹${totalPaid}` : 'Not provided'}\n`;
  message += `Balance Due: ${order.totalAmount > 0 ? `₹${balanceDue}` : 'Not provided'}\n`;
  message += `Payment Status: ${order.totalAmount > 0 ? paymentStatus : 'Not provided'}\n\n`;

  message += `Please confirm this catering order.\n\nThank you!`;
  
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${number}?text=${encodedMessage}`;
};
