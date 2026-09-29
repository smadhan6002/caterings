import React, { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp, Eye, Trash2, X, Check, AlertTriangle, IndianRupee } from 'lucide-react';
import { orderService } from '../../services/orderService';
import type { Order, OrderStatus, PaymentStatus } from '../../types/admin';

const ORDER_STATUSES: OrderStatus[] = [
  'Pending', 'Confirmed', 'In Preparation', 'Ready', 'Completed', 'Cancelled',
];

const statusColor: Record<string, string> = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Confirmed: 'bg-blue-100 text-blue-800',
  'In Preparation': 'bg-purple-100 text-purple-800',
  Ready: 'bg-cyan-100 text-cyan-800',
  Completed: 'bg-green-100 text-green-800',
  Cancelled: 'bg-red-100 text-red-800',
};

function getPaymentStatus(order: Order): PaymentStatus {
  const remaining = order.totalAmount - order.advanceAmount - order.balancePaid;
  if (remaining <= 0 && order.totalAmount > 0) return 'Fully Paid';
  if (order.advanceAmount > 0 && order.balancePaid > 0) return 'Partially Paid';
  if (order.advanceAmount > 0) return 'Advance Paid';
  return 'Unpaid';
}

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
  const [totalAmt, setTotalAmt] = useState(String(order.totalAmount || ''));
  const [advanceAmt, setAdvanceAmt] = useState(String(order.advanceAmount || ''));
  const [balancePaid, setBalancePaid] = useState(String(order.balancePaid || ''));
  const [notes, setNotes] = useState(order.notes || '');
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [payError, setPayError] = useState('');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  }

  const total = parseFloat(totalAmt) || 0;
  const advance = parseFloat(advanceAmt) || 0;
  const bPaid = parseFloat(balancePaid) || 0;
  const remaining = Math.max(0, total - advance - bPaid);
  const payStatus = getPaymentStatus({ ...order, totalAmount: total, advanceAmount: advance, balancePaid: bPaid });

  function validatePayment(): boolean {
    setPayError('');
    if (advance < 0) { setPayError('Advance cannot be negative.'); return false; }
    if (bPaid < 0) { setPayError('Balance paid cannot be negative.'); return false; }
    if (advance > total) { setPayError('Advance cannot exceed total amount.'); return false; }
    return true;
  }

  async function handleSave() {
    if (!validatePayment()) return;
    setSaving(true);
    try {
      const updated = orderService.update(order.id, {
        totalAmount: total,
        advanceAmount: advance,
        balancePaid: bPaid,
        status,
        notes,
      });
      if (updated) setOrder(updated);
      onUpdated();
      showToast('Order updated.');
    } finally {
      setSaving(false);
    }
  }

  const payStatusColors: Record<string, string> = {
    'Fully Paid': 'bg-green-100 text-green-800',
    'Advance Paid': 'bg-blue-100 text-blue-800',
    'Partially Paid': 'bg-yellow-100 text-yellow-800',
    'Unpaid': 'bg-red-100 text-red-800',
  };

  return (
    <>
      {/* Fixed full-screen backdrop — separate from scrollable container so it always covers everything */}
      <div
        className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-[200] bg-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm">
          <Check size={16} /> {toast}
        </div>
      )}

      {/* Scrollable modal wrapper — sits above backdrop */}
      <div className="fixed inset-0 z-[101] flex items-start justify-center p-4 pt-8 overflow-y-auto pointer-events-none">
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4 overflow-hidden pointer-events-auto">
          {/* Header */}

        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900">{order.id}</h3>
            <p className="text-xs text-slate-500 mt-0.5">Created: {formatDate(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Customer</p>
              <p className="font-semibold text-slate-900">{order.customerName}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Mobile</p>
              <p className="font-semibold text-slate-900">{order.mobile}</p>
            </div>
            <div>
              <p className="text-slate-500 text-xs mb-0.5">Order Date</p>
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
                <p className="text-slate-500 text-xs mb-0.5">Address</p>
                <p className="font-semibold text-slate-900">{order.eventAddress}</p>
              </div>
            )}
            {order.guestCount && (
              <div>
                <p className="text-slate-500 text-xs mb-0.5">Guest Count</p>
                <p className="font-semibold text-slate-900">{order.guestCount}</p>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-slate-50 rounded-xl p-4">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-3">Ordered Items</h4>
            <div className="space-y-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-800">• {item.dishName}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment */}
          <div className="border border-slate-200 rounded-xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Payment Details</h4>
            {payError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-xs flex items-center gap-2">
                <AlertTriangle size={12} /> {payError}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Total Amount (₹)</label>
                <div className="relative">
                  <IndianRupee size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    value={totalAmt}
                    onChange={(e) => setTotalAmt(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Advance Paid (₹)</label>
                <div className="relative">
                  <IndianRupee size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    value={advanceAmt}
                    onChange={(e) => setAdvanceAmt(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Balance Paid (₹)</label>
                <div className="relative">
                  <IndianRupee size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="number"
                    min="0"
                    value={balancePaid}
                    onChange={(e) => setBalancePaid(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            {/* Summary line */}
            <div className="flex items-center gap-4 pt-2 text-sm">
              <span className="text-slate-500">Balance Due: <strong className="text-slate-900">₹{remaining.toLocaleString('en-IN')}</strong></span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${payStatusColors[payStatus]}`}>
                {payStatus}
              </span>
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
              className="w-full bg-primary hover:bg-primary/90 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
            >
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
          </div>
        </div>
      </div>
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
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Advance</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Status</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50">
                      <td className="px-5 py-3 font-mono text-slate-700">{order.id}</td>
                      <td className="px-5 py-3 font-medium text-slate-900">{order.customerName}</td>
                      <td className="px-5 py-3 text-slate-600">{order.mobile}</td>
                      <td className="px-5 py-3 text-slate-600">{formatDate(order.orderDate)}</td>
                      <td className="px-5 py-3 text-slate-600">{order.items.length} dish(es)</td>
                      <td className="px-5 py-3 text-slate-600">₹{order.advanceAmount.toLocaleString('en-IN')}</td>
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((order) => (
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
                    <div className="text-sm text-slate-600 space-y-1 pt-2">
                      <p><span className="font-medium">Mobile:</span> {order.mobile}</p>
                      <p><span className="font-medium">Order Date:</span> {formatDate(order.orderDate)}</p>
                      <p><span className="font-medium">Items:</span> {order.items.length} dish(es)</p>
                      <p><span className="font-medium">Advance:</span> ₹{order.advanceAmount.toLocaleString('en-IN')}</p>
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
            ))}
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
