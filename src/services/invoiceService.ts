/**
 * invoiceService — localStorage-based invoice tracking
 */
import type { Invoice } from '../types/admin';

const INVOICES_KEY = 'annapoorna_invoices';
const INV_COUNTER_KEY = 'annapoorna_invoice_counter';

function getCounter(): number {
  return parseInt(localStorage.getItem(INV_COUNTER_KEY) || '0', 10);
}

function generateInvoiceId(): string {
  const n = getCounter() + 1;
  localStorage.setItem(INV_COUNTER_KEY, String(n));
  return `INV-${String(n).padStart(4, '0')}`;
}

export const invoiceService = {
  getAll(): Invoice[] {
    try {
      return JSON.parse(localStorage.getItem(INVOICES_KEY) || '[]') as Invoice[];
    } catch {
      return [];
    }
  },

  getByOrderId(orderId: string): Invoice | undefined {
    return this.getAll().find((i) => i.orderId === orderId);
  },

  create(orderId: string): Invoice {
    // If invoice already exists for this order, return it
    const existing = this.getByOrderId(orderId);
    if (existing) return existing;

    const invoices = this.getAll();
    const invoice: Invoice = {
      id: generateInvoiceId(),
      orderId,
      generatedAt: new Date().toISOString(),
    };
    invoices.push(invoice);
    localStorage.setItem(INVOICES_KEY, JSON.stringify(invoices));
    return invoice;
  },
};
