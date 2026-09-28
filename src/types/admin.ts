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

export type PaymentStatus = 'Unpaid' | 'Advance Paid' | 'Partially Paid' | 'Fully Paid';

export interface OrderItem {
  dishId: string;
  dishName: string;     // Snapshot — never changes even if dish is renamed/deleted
  categoryId: string;
  quantity: number;
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
  totalAmount: number;
  advanceAmount: number;
  balancePaid: number;
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
