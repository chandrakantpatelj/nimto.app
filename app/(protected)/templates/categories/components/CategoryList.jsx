'use client';

import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Image as ImageIcon, Eye, EyeOff, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
import LazyImage from '../../components/LazyImage';

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
    <div className="space-y-4">
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Categories Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first template category to get started.</p>
          <Button onClick={() => onEditCategory(null)} className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700">
            <ImageIcon className="h-4 w-4 mr-2" />
            Create First Category
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Categories ({categories.length})
            </h3>
            <Button 
              onClick={() => onEditCategory(null)}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Add Category
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {categories.map(category => (
              <Card 
                key={category.id}
                className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg bg-white dark:bg-gray-800 rounded-2xl overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Image Section with Overlay */}
                  <div className="relative h-48 overflow-hidden">
                    {category.thumbnailUrl ? (
                      <LazyImage
                        src={category.thumbnailUrl}
                        alt={category.name}
                        className="w-full h-full group-hover:scale-110 transition-transform duration-500"
                        placeholder={
                          <div className="flex flex-col items-center gap-3">
                            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                {category.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
                          </div>
                        }
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 flex items-center justify-center">
                        <span className="text-6xl font-bold text-white">
                          {category.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    {/* Dark Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                    
                    {/* Overlay Text */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="text-white">
                        <p className="text-sm font-medium opacity-90 mb-1">Template Category</p>
                        <h3 className="text-xl font-bold leading-tight">{category.name}</h3>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="absolute top-4 right-4">
                      {category.isActive ? (
                        <Badge className="bg-green-500 text-white border-0 shadow-lg">
                          <Eye className="h-3 w-3 mr-1" />
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-gray-500 text-white border-0 shadow-lg">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-6 bg-gray-50 dark:bg-gray-700">
                    {/* Rating and Details */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 ml-1">4.8</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">(24 reviews)</span>
                        </div>
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        Sort: {category.sortOrder}
                      </div>
                    </div>

                    {/* Description */}
                    {category.description ? (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                        {category.description}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 leading-relaxed">
                        Beautiful templates for {category.name.toLowerCase()} events. Perfect for creating memorable invitations and celebrations.
                      </p>
                    )}

                    {/* Action Button */}
                    <Button 
                      className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-600 dark:hover:bg-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 mb-3"
                      onClick={() => onEditCategory(category)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Manage Category
                    </Button>

                    {/* Secondary Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-purple-200 dark:border-purple-600 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-300 dark:hover:border-purple-500 rounded-lg"
                        onClick={() => onEditCategory(category)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-200 dark:border-red-600 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-500 rounded-lg"
                        onClick={() => setDeleteDialog({ open: true, category })}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
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
