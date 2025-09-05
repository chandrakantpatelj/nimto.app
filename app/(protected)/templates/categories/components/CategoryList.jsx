'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Folder, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { apiFetch } from '@/lib/api';
import { showCustomToast } from '@/components/common/custom-toast';

export function CategoryList({ onEditCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, category: null });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await apiFetch('/api/template-categories');
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        }
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      showCustomToast('Failed to fetch categories', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (category) => {
    try {
      const response = await apiFetch(`/api/template-categories/${category.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        showCustomToast('Category deleted successfully', 'success');
        fetchCategories();
      } else {
        const result = await response.json();
        showCustomToast(result.error || 'Failed to delete category', 'error');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      showCustomToast('Failed to delete category', 'error');
    }
    setDeleteDialog({ open: false, category: null });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      {categories.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">No categories found.</p>
          <Button onClick={() => onEditCategory(null)}>
            Create First Category
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map(category => (
            <div 
              key={category.id}
              className="flex items-center p-4 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {/* Category Icon */}
              <div className="mr-4">
                {category.icon ? (
                  <span className="text-2xl">{category.icon}</span>
                ) : (
                  <Folder className="h-6 w-6 text-gray-400" />
                )}
              </div>

              {/* Category Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  {!category.isActive && (
                    <Badge variant="secondary" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                </div>
                {category.description && (
                  <p className="text-sm text-gray-600 mb-2">{category.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>Slug: {category.slug}</span>
                  <span>Sort Order: {category.sortOrder}</span>
                  {category.color && (
                    <div className="flex items-center gap-1">
                      <span>Color:</span>
                      <div 
                        className="w-4 h-4 rounded-full border border-gray-200"
                        style={{ backgroundColor: category.color }}
                        title={category.color}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditCategory(category)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteDialog({ open: true, category })}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => setDeleteDialog({ open, category: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the category "{deleteDialog.category?.name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleDelete(deleteDialog.category)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
