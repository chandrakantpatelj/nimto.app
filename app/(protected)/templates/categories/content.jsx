'use client';

import { Card } from '@/components/ui/card';
import { CategoryList } from './components/CategoryList';

export function CategoryManagement({ onEditCategory }) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Template Categories
        </h2>
        <p className="text-gray-600">
          Manage template categories. Categories help organize templates for better discoverability.
        </p>
      </div>
      
      <CategoryList onEditCategory={onEditCategory} />
    </Card>
  );
}
