import React from 'react';
import type { Category } from '../data/menu';
import { MenuItemCard } from './MenuItemCard';

interface MenuSectionProps {
  category: Category;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ category }) => {
  return (
    <section id={`category-${category.id}`} className="py-8 scroll-mt-24">
      <h2 className="text-2xl font-semibold text-slate-900 mb-6">{category.name}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
