import React, { useState, useEffect } from 'react';
import type { Category, MenuItem } from '../data/menu';
import { MenuItemCard } from './MenuItemCard';
import { dishService } from '../services/dishService';

interface MenuSectionProps {
  category: Category;
}

export const MenuSection: React.FC<MenuSectionProps> = ({ category }) => {
  const [customItems, setCustomItems] = useState<MenuItem[]>([]);

  useEffect(() => {
    // Read custom dishes from admin storage and filter for this category
    const adminDishes = dishService.getAll();
    const categoryCustomDishes = adminDishes
      .filter((d) => d.categoryId === category.id)
      .map((d) => ({
        id: d.id,
        name: d.name,
        categoryId: d.categoryId,
        image: d.image,
      }));
    setCustomItems(categoryCustomDishes);
  }, [category.id]);

  const allItems = [...category.items, ...customItems];

  return (
    <section id={`category-${category.id}`} className="py-8 scroll-mt-24">
      <h2 className="text-2xl font-semibold text-slate-900 mb-6">{category.name}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {allItems.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
};
