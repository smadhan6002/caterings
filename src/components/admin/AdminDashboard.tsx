import React, { useEffect, useState } from 'react';
import { ShoppingBag, Clock, CheckCircle, TrendingUp, IndianRupee, AlertCircle } from 'lucide-react';
import { orderService } from '../../services/orderService';
import type { Order } from '../../types/admin';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, color, bgColor }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${bgColor}`}>
      <span className={color}>{icon}</span>
    </div>
    <div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    setOrders(orderService.getAll());
  }, []);

  const totalOrders = orders.length;
  const pending = orders.filter((o) => o.status === 'Pending').length;
  const confirmed = orders.filter((o) => o.status === 'Confirmed' || o.status === 'In Preparation' || o.status === 'Ready').length;
  const completed = orders.filter((o) => o.status === 'Completed').length;
  const cancelled = orders.filter((o) => o.status === 'Cancelled').length;
  const totalAdvance = orders.reduce((s, o) => s + o.advanceAmount, 0);
  const totalBalancePending = orders.reduce(
    (s, o) => s + Math.max(0, o.totalAmount - o.advanceAmount - o.balancePaid),
    0
  );

  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const statusColor: Record<string, string> = {
    Pending: 'bg-yellow-100 text-yellow-800',
    Confirmed: 'bg-blue-100 text-blue-800',
    'In Preparation': 'bg-purple-100 text-purple-800',
    Ready: 'bg-cyan-100 text-cyan-800',
    Completed: 'bg-green-100 text-green-800',
    Cancelled: 'bg-red-100 text-red-800',
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Dashboard</h2>
        <p className="text-sm text-slate-500 mt-0.5">Overview of your catering orders</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <StatCard label="Total Orders" value={totalOrders} icon={<ShoppingBag size={22} />} color="text-primary" bgColor="bg-orange-100" />
        <StatCard label="Pending" value={pending} icon={<Clock size={22} />} color="text-yellow-600" bgColor="bg-yellow-100" />
        <StatCard label="Active" value={confirmed} icon={<TrendingUp size={22} />} color="text-blue-600" bgColor="bg-blue-100" />
        <StatCard label="Completed" value={completed} icon={<CheckCircle size={22} />} color="text-green-600" bgColor="bg-green-100" />
        <StatCard label="Advance Collected" value={`₹${totalAdvance.toLocaleString('en-IN')}`} icon={<IndianRupee size={22} />} color="text-primary" bgColor="bg-orange-100" />
        <StatCard label="Balance Pending" value={`₹${totalBalancePending.toLocaleString('en-IN')}`} icon={<AlertCircle size={22} />} color="text-red-600" bgColor="bg-red-100" />
      </div>

      {/* Cancelled quick note */}
      {cancelled > 0 && (
        <p className="text-sm text-slate-500">{cancelled} order(s) cancelled.</p>
      )}

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Recent Orders</h3>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-10 text-center text-slate-400 text-sm">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left font-medium text-slate-500">Order ID</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-500">Customer</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-500 hidden sm:table-cell">Order Date</th>
                  <th className="px-5 py-3 text-left font-medium text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-mono text-slate-700">{order.id}</td>
                    <td className="px-5 py-3 text-slate-900">{order.customerName}</td>
                    <td className="px-5 py-3 text-slate-600 hidden sm:table-cell">
                      {new Date(order.orderDate + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[order.status] ?? 'bg-slate-100 text-slate-700'}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
