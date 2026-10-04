import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';
import { categories } from './data/menu';
import { CartProvider } from './context/CartContext';
import { Hero } from './components/Hero';
import { CategoryNav } from './components/CategoryNav';
import { MenuSection } from './components/MenuSection';
import { CartActionBar } from './components/CartActionBar';
import { CartDrawer } from './components/CartDrawer';
import { RiceSuggestionModal } from './components/RiceSuggestionModal';
import { AdminPage } from './components/admin/AdminPage';

function AdminLoginButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/admin')}
      className="fixed top-3 right-3 sm:top-4 sm:right-6 z-50 bg-slate-900/90 hover:bg-slate-800 text-white text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-3.5 sm:py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 flex items-center gap-1.5 cursor-pointer backdrop-blur-sm border border-slate-700/50"
      aria-label="Admin login"
    >
      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-300" />
      <span>Admin</span>
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
      <RiceSuggestionModal />
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
