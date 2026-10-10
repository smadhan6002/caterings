/**
 * Types for the Order Management System
 * These types are designed to be backend-agnostic.
 * When migrating to Supabase, these shapes map directly to DB table rows.
 */

export type OrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'In Preparation'
  | 'Ready'
  | 'Completed'
  | 'Cancelled';

export type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Bank Transfer'
  | 'Card'
  | 'Cheque'
  | 'Other';

export interface OrderPayment {
  id: string;           // e.g. pay-001 or unique ID
  amount: number;
  date: string;         // ISO date yyyy-mm-dd
  method: PaymentMethod | string;
  note?: string;
}

export type PaymentStatus = 'Unpaid' | 'Partially Paid' | 'Paid' | 'Advance Paid' | 'Fully Paid';

export interface OrderItem {
  dishId: string;
  dishName: string;     // Snapshot — never changes even if dish is renamed/deleted
  categoryId: string;
}

export interface Order {
  id: string;           // e.g. ORD-0001
  customerName: string;
  mobile: string;
  eventAddress: string;
  eventType?: string;
  orderDate: string;    // ISO date string yyyy-mm-dd
  createdAt: string;    // ISO datetime
  items: OrderItem[];
  guestCount: number | null;
  foodQuantities?: { dishId: string; dishName: string; quantity: number; unit: 'kg' }[]; // optional kg quantities
  totalAmount: number;
  advanceAmount?: number;   // Maintained for backward compatibility
  balancePaid?: number;     // Maintained for backward compatibility
  payments?: OrderPayment[]; // Multiple split payments / installment history
  status: OrderStatus;
  notes: string;
  invoiceGenerated: boolean;
}

export interface Invoice {
  id: string;           // INV-0001
  orderId: string;
  generatedAt: string;
}

export interface AdminDish {
  id: string;
  name: string;
  categoryId: string;
  image: string;        // base64 data URL for admin-added dishes
  isAdminAdded: boolean;
}
