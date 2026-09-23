import React from 'react';
import { categories } from './data/menu';
import { CartProvider } from './context/CartContext';
import { Hero } from './components/Hero';
import { CategoryNav } from './components/CategoryNav';
import { MenuSection } from './components/MenuSection';
import { CartActionBar } from './components/CartActionBar';
import { CartDrawer } from './components/CartDrawer';

function MainApp() {
  const [activeCategory, setActiveCategory] = React.useState(categories[0].id);

  // Intersection Observer to update active category on scroll
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the first intersecting section
        const visible = entries.find(entry => entry.isIntersecting);
        if (visible) {
          const id = visible.target.id.replace('category-', '');
          setActiveCategory(id);
        }
      },
      {
        rootMargin: '-20% 0px -70% 0px', // Trigger when section is in top half
      }
    );

    categories.forEach(cat => {
      const el = document.getElementById(`category-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen pb-24">
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
    <CartProvider>
      <MainApp />
    </CartProvider>
  );
}
