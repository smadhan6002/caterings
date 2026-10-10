import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, Trash2, X, Check, AlertTriangle, IndianRupee, Plus, Pencil } from 'lucide-react';
import {
  orderService,
  normalizeOrderPayments,
  getOrderTotalPaid,
  getOrderBalanceDue,
  getOrderPaymentStatus,
} from '../../services/orderService';
import type { Order, OrderStatus, OrderPayment, PaymentMethod } from '../../types/admin';

const ORDER_STATUSES: OrderStatus[] = [
  'Pending', 'Confirmed', 'In Preparation', 'Ready', 'Completed', 'Cancelled',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Cash', 'UPI', 'Bank Transfer', 'Card', 'Cheque', 'Other',
];

const statusColor: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  'In Preparation': 'bg-purple-100 text-purple-800',
  Ready: 'bg-cyan-100 text-cyan-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

const payStatusColors: Record<string, string> = {
  'Paid': 'bg-green-100 text-green-800',
  'Fully Paid': 'bg-green-100 text-green-800',
  'Partially Paid': 'bg-amber-100 text-amber-800',
  'Advance Paid': 'bg-blue-100 text-blue-800',
  'Unpaid': 'bg-red-100 text-red-800',
};

function formatDate(d: string) {
  if (!d) return '';
  return new Date(d.includes('T') ? d : d + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ─── ORDER DETAIL MODAL ────────────────────────────────────────────────
interface OrderDetailProps {
  order: Order;
  onClose: () => void;
  onUpdated: () => void;
}

const OrderDetail: React.FC<OrderDetailProps> = ({ order: initialOrder, onClose, onUpdated }) => {
  const [order, setOrder] = useState<Order>(initialOrder);
  const [totalAmt, setTotalAmt] = useState(String(initialOrder.totalAmount || ''));
  const [payments, setPayments] = useState<OrderPayment[]>(normalizeOrderPayments(initialOrder));
  const [notes, setNotes] = useState(initialOrder.notes || '');
  const [status, setStatus] = useState<OrderStatus>(initialOrder.status);
  const [payError, setPayError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  // Payment Add / Edit Modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
  const [payAmountInput, setPayAmountInput] = useState('');
  const [payDateInput, setPayDateInput] = useState('');
  const [payMethodInput, setPayMethodInput] = useState<PaymentMethod>('UPI');
  const [payNoteInput, setPayNoteInput] = useState('');
  const [modalError, setModalError] = useState('');

  // Delete Payment Confirmation Modal state
  const [deletingPaymentId, setDeletingPaymentId] = useState<string | null>(null);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  // Automatic Dynamic Calculations
  const total = parseFloat(totalAmt) || 0;
  const currentTotalPaid = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const currentBalanceDue = Math.max(0, total - currentTotalPaid);
  const currentPayStatus: 'Unpaid' | 'Partially Paid' | 'Paid' =
    currentTotalPaid <= 0 ? 'Unpaid' : currentTotalPaid >= total && total > 0 ? 'Paid' : 'Partially Paid';

  function openAddPaymentModal() {
    setEditingPaymentId(null);
    setPayAmountInput('');
    setPayDateInput(new Date().toISOString().split('T')[0]);
    setPayMethodInput('UPI');
    setPayNoteInput('');
    setModalError('');
    setIsPaymentModalOpen(true);
  }

  function openEditPaymentModal(payment: OrderPayment) {
    setEditingPaymentId(payment.id);
    setPayAmountInput(String(payment.amount));
    setPayDateInput(payment.date || new Date().toISOString().split('T')[0]);
    setPayMethodInput((payment.method as PaymentMethod) || 'UPI');
    setPayNoteInput(payment.note || '');
    setModalError('');
    setIsPaymentModalOpen(true);
  }

  function handleSavePayment(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setModalError('');

    const amt = parseFloat(payAmountInput);
    if (isNaN(amt) || amt <= 0) {
      setModalError('Payment amount must be greater than ₹0.');
      return;
    }
    if (!payDateInput) {
      setModalError('Please select a valid payment date.');
      return;
    }
    if (!payMethodInput) {
      setModalError('Please select a payment method.');
      return;
    }

    if (total <= 0) {
      setModalError('Please set the Total Order Amount before adding payments.');
      return;
    }

    // Other payments excluding currently edited payment
    const otherPaymentsTotal = payments
      .filter((p) => p.id !== editingPaymentId)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    const maxAllowed = total - otherPaymentsTotal;
    if (amt > maxAllowed) {
      if (maxAllowed <= 0) {
        setModalError('Payment cannot exceed the total order amount.');
      } else {
        setModalError(`Payment amount exceeds the remaining balance of ₹${maxAllowed.toLocaleString('en-IN')}.`);
      }
      return;
    }

    let updatedPayments: OrderPayment[];
    if (editingPaymentId) {
      updatedPayments = payments.map((p) =>
        p.id === editingPaymentId
          ? {
              ...p,
              amount: amt,
              date: payDateInput,
              method: payMethodInput,
              note: payNoteInput.trim() || undefined,
            }
          : p
      );
    } else {
      const newPayment: OrderPayment = {
        id: `pay-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        amount: amt,
        date: payDateInput,
        method: payMethodInput,
        note: payNoteInput.trim() || undefined,
      };
      updatedPayments = [...payments, newPayment];
    }

    setPayments(updatedPayments);
    setIsPaymentModalOpen(false);
    setEditingPaymentId(null);

    // Save immediately to orderService
    const updated = orderService.update(order.id, {
      totalAmount: total,
      payments: updatedPayments,
      status,
      notes,
    });
    if (updated) setOrder(updated);
    onUpdated();
    showToast(editingPaymentId ? 'Payment updated.' : 'Payment added.');
  }

  function handleDeletePayment() {
    if (!deletingPaymentId) return;
    const updatedPayments = payments.filter((p) => p.id !== deletingPaymentId);
    setPayments(updatedPayments);
    setDeletingPaymentId(null);

    // Save immediately to orderService
    const updated = orderService.update(order.id, {
      totalAmount: total,
      payments: updatedPayments,
      status,
      notes,
    });
    if (updated) setOrder(updated);
    onUpdated();
    showToast('Payment deleted.');
  }

  async function handleSave() {
    setPayError('');
    if (total < currentTotalPaid) {
      setPayError(`Total amount cannot be less than total paid (₹${currentTotalPaid.toLocaleString('en-IN')}).`);
      return;
    }

    setSaving(true);
    try {
      const updated = orderService.update(order.id, {
        totalAmount: total,
        payments,
        status,
        notes,
      });
      if (updated) setOrder(updated);
      onUpdated();
      showToast('Order saved successfully.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {/* Fixed full-screen backdrop */}
      <div
        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium">
          <Check size={16} /> {toast}
        </div>
      )}

      {/* Scrollable modal wrapper */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center p-4 pt-8 overflow-y-auto pointer-events-none">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 overflow-hidden pointer-events-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">{order.id}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Created: {formatDate(order.createdAt)}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Customer Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Customer Name</p>
                <p className="font-semibold text-slate-900">{order.customerName}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Mobile Number</p>
                <p className="font-semibold text-slate-900">{order.mobile}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Order / Event Date</p>
                <p className="font-semibold text-slate-900">{formatDate(order.orderDate)}</p>
              </div>
              {order.eventType && (
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Event Type</p>
                  <p className="font-semibold text-slate-900">{order.eventType}</p>
                </div>
              )}
              {order.eventAddress && (
                <div className="col-span-2">
                  <p className="text-slate-500 text-xs mb-0.5">Delivery Address</p>
                  <p className="font-semibold text-slate-900">{order.eventAddress}</p>
                </div>
              )}
              {order.guestCount && (
                <div>
                  <p className="text-slate-500 text-xs mb-0.5">Number of Guests</p>
                  <p className="font-semibold text-slate-900">{order.guestCount} guests</p>
                </div>
              )}
            </div>

            {/* Selected Dishes */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Selected Dishes ({order.items.length})</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center text-sm text-slate-800">
                    <span className="text-primary mr-2">•</span>
                    <span className="font-medium">{item.dishName}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Food Quantities */}
            {order.foodQuantities && order.foodQuantities.length > 0 && (
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Additional Food Quantities</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {order.foodQuantities.map((fq, i) => (
                    <div key={i} className="flex items-center justify-between text-sm text-slate-800 bg-white px-3 py-2 border border-slate-100 rounded-lg shadow-sm">
                      <div className="flex items-center truncate mr-2">
                        <span className="text-primary mr-2">•</span>
                        <span className="font-medium truncate">{fq.dishName}</span>
                      </div>
                      <span className="font-bold text-slate-900 flex-shrink-0">{fq.quantity} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PAYMENT DETAILS - MULTIPLE SPLIT PAYMENTS SYSTEM */}
            <div className="border border-slate-200 rounded-xl p-4 sm:p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Payment Details</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Record customer installment and advance payments</p>
                </div>
                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${payStatusColors[currentPayStatus]}`}>
                  {currentPayStatus}
                </span>
              </div>

              {payError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                  <AlertTriangle size={14} className="flex-shrink-0" /> {payError}
                </div>
              )}

              {/* Total Order Amount Input */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Total Amount (₹)</label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    value={totalAmt}
                    onChange={(e) => setTotalAmt(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Payment History Section */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Payment History {payments.length > 0 && `(${payments.length})`}
                  </h5>
                  <button
                    type="button"
                    onClick={openAddPaymentModal}
                    className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                    Add Payment
                  </button>
                </div>

                {payments.length === 0 ? (
                  <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-5 text-center text-slate-400">
                    <p className="text-xs font-medium text-slate-600">No payments recorded yet</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Click <strong>+ Add Payment</strong> to record an advance or installment</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {payments.map((p, idx) => (
                      <div
                        key={p.id || idx}
                        className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 transition-colors"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-slate-800">Payment #{idx + 1}</span>
                            <span className="inline-block px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[11px] font-medium">
                              {p.method}
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-500">{formatDate(p.date)}</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-base font-bold text-slate-900">₹{p.amount.toLocaleString('en-IN')}</span>
                            {p.note && (
                              <span className="text-xs text-slate-600 italic">
                                — {p.note}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => openEditPaymentModal(p)}
                            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer"
                          >
                            <Pencil size={12} />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingPaymentId(p.id)}
                            className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Automatic Ledger Summary */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between items-center text-slate-600 text-xs">
                  <span>Total Paid:</span>
                  <span className="font-bold text-sm text-green-700">₹{currentTotalPaid.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 text-xs">
                  <span>Balance Due:</span>
                  <span className="font-bold text-sm text-slate-900">₹{currentBalanceDue.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 text-xs pt-2 border-t border-slate-200">
                  <span>Status:</span>
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${payStatusColors[currentPayStatus]}`}>
                    {currentPayStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Order Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as OrderStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                >
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                placeholder="Delivery instructions, payment notes, special requests…"
              />
            </div>

            {/* Actions */}
            <div className="flex pt-1">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer"
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ─── ADD / EDIT PAYMENT MODAL ───────────────────────────── */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsPaymentModalOpen(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 overflow-hidden z-10">
            <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">
                {editingPaymentId ? 'Edit Payment' : 'Add Payment'}
              </h3>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {modalError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-xs flex items-center gap-2">
                <AlertTriangle size={14} className="flex-shrink-0" />
                <span>{modalError}</span>
              </div>
            )}

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Payment Amount (₹) *</label>
                <div className="relative">
                  <IndianRupee size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="1"
                    step="1"
                    autoFocus
                    value={payAmountInput}
                    onChange={(e) => setPayAmountInput(e.target.value)}
                    placeholder="e.g. 10000"
                    className="w-full pl-8 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-semibold"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Remaining balance allowed: <strong>₹{currentBalanceDue.toLocaleString('en-IN')}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Payment Date *</label>
                <input
                  type="date"
                  value={payDateInput}
                  onChange={(e) => setPayDateInput(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Payment Method *</label>
                <select
                  value={payMethodInput}
                  onChange={(e) => setPayMethodInput(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 bg-white"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Payment Note (Optional)</label>
                <input
                  type="text"
                  value={payNoteInput}
                  onChange={(e) => setPayNoteInput(e.target.value)}
                  placeholder="e.g. Advance payment, installment 2, cheque #1234"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELETE PAYMENT CONFIRMATION MODAL ───────────────────── */}
      {deletingPaymentId && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setDeletingPaymentId(null)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
            <h3 className="font-semibold text-slate-900 mb-2">Delete Payment</h3>
            <p className="text-sm text-slate-600 mb-5">
              Are you sure you want to delete this payment? This will immediately recalculate the total paid and balance due.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeletingPaymentId(null)}
                className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePayment}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium"
              >
                Delete Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ─── MAIN ORDERS LIST ─────────────────────────────────────────────────
export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedMobile, setExpandedMobile] = useState<string | null>(null);

  function loadOrders() {
    setOrders(orderService.getAll().sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ));
  }

  useEffect(() => { loadOrders(); }, []);

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customerName.toLowerCase().includes(q) || o.mobile.includes(q);
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function handleDelete(id: string) {
    orderService.delete(id);
    loadOrders();
    setDeleteConfirm(null);
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Orders</h2>
          <p className="text-sm text-slate-500 mt-0.5">{orders.length} total order(s)</p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, mobile, order ID…"
            className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
          className="px-3 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/40"
        >
          <option value="">All Statuses</option>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-100 py-12 text-center text-slate-400">
          <p className="text-sm">{orders.length === 0 ? 'No orders yet. Customer orders will appear here.' : 'No orders match your search.'}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Order ID</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Customer</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Mobile</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Order Date</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Items</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Payment</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((order) => {
                    const paid = getOrderTotalPaid(order);
                    const balance = getOrderBalanceDue(order);
                    const pStatus = getOrderPaymentStatus(order);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50">
                        <td className="px-5 py-3 font-mono text-slate-700">{order.id}</td>
                        <td className="px-5 py-3 font-medium text-slate-900">{order.customerName}</td>
                        <td className="px-5 py-3 text-slate-600">{order.mobile}</td>
                        <td className="px-5 py-3 text-slate-600">{formatDate(order.orderDate)}</td>
                        <td className="px-5 py-3 text-slate-600">
                          {order.items.length} dish(es)
                          {order.foodQuantities && order.foodQuantities.length > 0 && (
                            <span className="block text-[11px] text-slate-400 mt-0.5">
                              + {order.foodQuantities.length} kg item(s)
                            </span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <p className="font-semibold text-slate-900">
                            ₹{paid.toLocaleString('en-IN')}{' '}
                            <span className="font-normal text-slate-400">/ ₹{order.totalAmount.toLocaleString('en-IN')}</span>
                          </p>
                          <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                            <span className="text-slate-500">Bal: ₹{balance.toLocaleString('en-IN')}</span>
                            <span className={`inline-flex px-1.5 py-0.2 rounded-full text-[10px] font-semibold ${payStatusColors[pStatus]}`}>
                              {pStatus}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status]}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-blue-600 hover:text-blue-800 p-1"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(order.id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((order) => {
              const paid = getOrderTotalPaid(order);
              const balance = getOrderBalanceDue(order);
              const pStatus = getOrderPaymentStatus(order);
              return (
                <div key={order.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                  <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer"
                    onClick={() => setExpandedMobile(expandedMobile === order.id ? null : order.id)}
                  >
                    <div>
                      <p className="font-mono text-sm font-semibold text-slate-700">{order.id}</p>
                      <p className="text-sm text-slate-900">{order.customerName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status]}`}>
                        {order.status}
                      </span>
                      {expandedMobile === order.id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>
                  {expandedMobile === order.id && (
                    <div className="px-4 pb-4 pt-0 space-y-2 border-t border-slate-100">
                      <div className="text-sm text-slate-600 space-y-1.5 pt-2">
                        <p><span className="font-medium">Mobile:</span> {order.mobile}</p>
                        <p><span className="font-medium">Order Date:</span> {formatDate(order.orderDate)}</p>
                        <p>
                          <span className="font-medium">Items:</span> {order.items.length} dish(es)
                          {order.foodQuantities && order.foodQuantities.length > 0 && (
                            <span className="text-slate-500 text-xs ml-1">
                              (+ {order.foodQuantities.length} kg)
                            </span>
                          )}
                        </p>
                        <p>
                          <span className="font-medium">Payment:</span>{' '}
                          <strong className="text-slate-900">₹{paid.toLocaleString('en-IN')}</strong> / ₹{order.totalAmount.toLocaleString('en-IN')}
                        </p>
                        <p>
                          <span className="font-medium">Balance Due:</span>{' '}
                          <strong className="text-slate-900">₹{balance.toLocaleString('en-IN')}</strong>
                        </p>
                        <p className="flex items-center gap-1.5">
                          <span className="font-medium">Status:</span>
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${payStatusColors[pStatus]}`}>
                            {pStatus}
                          </span>
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium"
                        >
                          <Eye size={14} /> View
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(order.id)}
                          className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 text-red-600 py-2 rounded-lg text-sm font-medium"
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderDetail
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdated={() => {
            loadOrders();
            const updated = orderService.getById(selectedOrder.id);
            if (updated) setSelectedOrder(updated);
          }}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-semibold text-slate-900 mb-2">Delete Order</h3>
            <p className="text-sm text-slate-600 mb-5">Are you sure you want to delete order <strong>{deleteConfirm}</strong>? This cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 border border-slate-300 rounded-xl text-sm text-slate-700 hover:bg-slate-50">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
