'use client';

import { CategoryList } from './components/CategoryList';

export function CategoryManagement({ onEditCategory }) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Template Categories
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage template categories to organize your templates for better discoverability.
        </p>
      </div>
      
      <CategoryList onEditCategory={onEditCategory} />
    </div>
  );
}
