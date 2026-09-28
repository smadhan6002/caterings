import React, { useState, useEffect } from 'react';
import { authService } from '../../services/authService';
import { AdminLogin } from './AdminLogin';
import { AdminSidebar, AdminTopbar } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { AdminDishes } from './AdminDishes';
import { AdminOrders } from './AdminOrders';
import type { AdminView } from './AdminSidebar';

export const AdminPage: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isLoggedIn());
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Re-check session whenever the component mounts
  useEffect(() => {
    setIsLoggedIn(authService.isLoggedIn());
  }, []);

  function handleLogin() {
    setIsLoggedIn(true);
    setActiveView('dashboard');
  }

  function handleLogout() {
    authService.logout();
    setIsLoggedIn(false);
  }

  if (!isLoggedIn) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const viewMap: Record<AdminView, React.ReactNode> = {
    dashboard: <AdminDashboard />,
    dishes: <AdminDishes />,
    orders: <AdminOrders />,
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      <AdminSidebar
        activeView={activeView}
        onNavigate={setActiveView}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminTopbar activeView={activeView} onMenuOpen={() => setSidebarOpen(true)} />
        {/* Desktop page title */}
        <div className="hidden lg:block px-6 pt-6 pb-0">
          <h1 className="text-lg font-bold text-slate-900 capitalize">
            {activeView === 'dashboard' ? 'Dashboard' :
             activeView === 'dishes' ? 'Dish Management' : 'Order Management'}
          </h1>
        </div>
        <main className="flex-1 overflow-y-auto">
          {viewMap[activeView]}
        </main>
      </div>
    </div>
  );
};
