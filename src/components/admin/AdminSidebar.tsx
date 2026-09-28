import React from 'react';
import { LayoutDashboard, UtensilsCrossed, ClipboardList, LogOut, ChefHat, X, Menu } from 'lucide-react';
import { siteConfig } from '../../config/site';

export type AdminView = 'dashboard' | 'dishes' | 'orders';

interface AdminSidebarProps {
  activeView: AdminView;
  onNavigate: (view: AdminView) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { view: AdminView; label: string; icon: React.ReactNode }[] = [
  { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { view: 'dishes', label: 'Dishes', icon: <UtensilsCrossed size={18} /> },
  { view: 'orders', label: 'Orders', icon: <ClipboardList size={18} /> },
];

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeView,
  onNavigate,
  onLogout,
  isOpen,
  onClose,
}) => {
  const content = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
            <ChefHat size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 truncate">{siteConfig.name}</p>
            <p className="text-xs text-slate-500">Admin Panel</p>
          </div>
        </div>
        {/* Close button — mobile only */}
        <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-slate-700 p-1">
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => { onNavigate(item.view); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
              activeView === item.view
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-200">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 bg-white border-r border-slate-200 h-screen sticky top-0">
        {content}
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <aside className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};

interface AdminTopbarProps {
  activeView: AdminView;
  onMenuOpen: () => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ activeView, onMenuOpen }) => {
  const labels: Record<AdminView, string> = {
    dashboard: 'Dashboard',
    dishes: 'Dish Management',
    orders: 'Order Management',
  };
  return (
    <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-30">
      <button
        onClick={onMenuOpen}
        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
      >
        <Menu size={20} />
      </button>
      <h1 className="font-semibold text-slate-900 text-base">{labels[activeView]}</h1>
    </header>
  );
};
