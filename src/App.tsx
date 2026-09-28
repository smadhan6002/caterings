import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { categories } from './data/menu';
import { CartProvider } from './context/CartContext';
import { Hero } from './components/Hero';
import { CategoryNav } from './components/CategoryNav';
import { MenuSection } from './components/MenuSection';
import { CartActionBar } from './components/CartActionBar';
import { CartDrawer } from './components/CartDrawer';
import { AdminPage } from './components/admin/AdminPage';

function AdminLoginButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/admin')}
      className="fixed top-3 right-3 sm:top-4 sm:right-4 z-40 bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow transition-colors flex items-center gap-1.5"
      aria-label="Admin login"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
      Admin
    </button>
  );
}

function MainApp() {
  const [activeCategory, setActiveCategory] = React.useState(categories[0].id);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find(entry => entry.isIntersecting);
        if (visible) {
          const id = visible.target.id.replace('category-', '');
          setActiveCategory(id);
        }
      },
      { rootMargin: '-20% 0px -70% 0px' }
    );

    categories.forEach(cat => {
      const el = document.getElementById(`category-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen pb-24">
      <AdminLoginButton />
      <Hero />
      <CategoryNav categories={categories} activeCategory={activeCategory} />

      <main className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {categories.map((category) => (
          <MenuSection key={category.id} category={category} />
        ))}
      </main>

      <CartActionBar />
      <CartDrawer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/" element={<MainApp />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/admin/*" element={<AdminPage />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
