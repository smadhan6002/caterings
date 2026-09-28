/**
 * orderService — localStorage-based order persistence
 * Swap each method body with Supabase SDK calls to migrate.
 */
import type { Order, OrderStatus } from '../types/admin';

const ORDERS_KEY = 'annapoorna_orders';
const ORDER_COUNTER_KEY = 'annapoorna_order_counter';

function getCounter(): number {
  return parseInt(localStorage.getItem(ORDER_COUNTER_KEY) || '0', 10);
}

function incrementCounter(): number {
  const next = getCounter() + 1;
  localStorage.setItem(ORDER_COUNTER_KEY, String(next));
  return next;
}

function generateOrderId(): string {
  const n = incrementCounter();
  return `ORD-${String(n).padStart(4, '0')}`;
}

export const orderService = {
  getAll(): Order[] {
    try {
      return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]') as Order[];
    } catch {
      return [];
    }
  },

  getById(id: string): Order | undefined {
    return this.getAll().find((o) => o.id === id);
  },

  create(data: Omit<Order, 'id' | 'createdAt' | 'invoiceGenerated'>): Order {
    const orders = this.getAll();
    const order: Order = {
      ...data,
      id: generateOrderId(),
      createdAt: new Date().toISOString(),
      invoiceGenerated: false,
    };
    orders.push(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return order;
  },

  update(id: string, changes: Partial<Order>): Order | undefined {
    const orders = this.getAll();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) return undefined;
    orders[idx] = { ...orders[idx], ...changes };
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return orders[idx];
  },

  updateStatus(id: string, status: OrderStatus): Order | undefined {
    return this.update(id, { status });
  },

  updatePayment(
    id: string,
    totalAmount: number,
    advanceAmount: number,
    balancePaid: number
  ): Order | undefined {
    return this.update(id, { totalAmount, advanceAmount, balancePaid });
  },

  markInvoiceGenerated(id: string): Order | undefined {
    return this.update(id, { invoiceGenerated: true });
  },

  delete(id: string): void {
    const orders = this.getAll().filter((o) => o.id !== id);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  },
};
