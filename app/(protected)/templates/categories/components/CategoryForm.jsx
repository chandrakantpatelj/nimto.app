'use client';

import React, { useEffect, useState } from 'react';
import { Image as ImageIcon, Save, Upload, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useS3Upload } from '@/hooks/use-s3-upload';
import { useToast } from '@/providers/toast-provider';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function CategoryForm({ category, onClose, onSuccess }) {
  const { toastSuccess, toastError } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    thumbnailUrl: '',
    color: '',
    sortOrder: 0,
    isActive: true,
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const { uploadFile } = useS3Upload();

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        thumbnailUrl: category.thumbnailUrl || '',
        color: category.color || '',
        sortOrder: category.sortOrder || 0,
        isActive: category.isActive !== false,
      });
    }
  }, [category]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Auto-generate slug from name
    if (field === 'name' && !category) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      setFormData((prev) => ({
        ...prev,
        slug: slug,
      }));
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toastError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toastError('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      const result = await uploadFile(file, 'category-thumbnails');
      setFormData((prev) => ({
        ...prev,
        thumbnailUrl: result.url,
      }));
      toastSuccess('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toastError('Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({
      ...prev,
      thumbnailUrl: '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toastError('Name is required');
      return;
    }

    if (!formData.slug.trim()) {
      toastError('Slug is required');
      return;
    }

    try {
      setLoading(true);

      const url = category
        ? `/api/template-categories/${category.id}`
        : '/api/template-categories';

      const method = category ? 'PUT' : 'POST';

      const response = await apiFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toastSuccess(
          category
            ? 'Category updated successfully'
            : 'Category created successfully',
        );
        onSuccess();
      } else {
        const result = await response.json();
        toastError(result.error || 'Failed to save category');
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toastError('Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[85vh] overflow-y-auto mx-2 sm:mx-0 p-4 sm:p-6">
        <DialogHeader className="pb-2 sm:pb-4">
          <DialogTitle className="text-lg sm:text-xl font-semibold">
            {category ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
            {/* Name */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="name" className="text-sm font-medium sm:text-base">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Category name"
                required
                className="text-sm sm:text-base h-11 sm:h-10"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="slug" className="text-sm font-medium sm:text-base">
                Slug <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="category-slug"
                required
                className="text-sm sm:text-base h-11 sm:h-10"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="description" className="text-sm font-medium sm:text-base">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Category description"
              rows={4}
              className="text-sm sm:text-base resize-none min-h-[100px]"
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-2.5">
            <Label className="text-sm font-medium sm:text-base">Category Thumbnail</Label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              {formData.thumbnailUrl ? (
                <div className="relative">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Category thumbnail"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-700"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 h-7 w-7 sm:h-8 sm:w-8 rounded-full p-0 bg-red-500 text-white hover:bg-red-600 border-2 border-white shadow-md"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                  <ImageIcon className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              <div className="flex-1 w-full sm:w-auto">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="thumbnail-upload"
                  disabled={uploadingImage}
                />
                <Label
                  htmlFor="thumbnail-upload"
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-3 sm:px-4 sm:py-2.5 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium sm:text-base w-full sm:w-auto justify-center min-h-[44px] sm:min-h-0"
                >
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5" />
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center sm:text-left">
                  Recommended: 200x200px, max 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-4">
            {/* Color */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="color" className="text-sm font-medium sm:text-base">
                Color
              </Label>
              <div className="flex items-center gap-3">
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="#FF6B6B"
                  type="color"
                  className="h-11 w-20 sm:h-10 sm:w-16 cursor-pointer"
                />
                <Input
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  placeholder="#FF6B6B"
                  type="text"
                  className="flex-1 text-sm sm:text-base h-11 sm:h-10"
                />
              </div>
            </div>

            {/* Sort Order */}
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="sortOrder" className="text-sm font-medium sm:text-base">
                Sort Order
              </Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  handleInputChange('sortOrder', parseInt(e.target.value) || 0)
                }
                min="0"
                className="text-sm sm:text-base h-11 sm:h-10"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-3 p-3 sm:p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded h-5 w-5 sm:h-4 sm:w-4 cursor-pointer accent-blue-600"
            />
            <Label htmlFor="isActive" className="text-sm font-medium sm:text-base cursor-pointer flex-1">
              Active Category
            </Label>
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-5 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11 sm:h-10 text-sm sm:text-base font-medium"
              disabled={loading}
            >
              <X className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
            <Button 
              type="submit" 
              disabled={loading || uploadingImage} 
              className="flex-1 h-11 sm:h-10 text-sm sm:text-base font-medium"
            >
              <Save className="h-4 w-4 sm:mr-2" />
              {loading ? (
                <span>Saving...</span>
              ) : (
                <>
                  <span className="hidden sm:inline">
                    {category ? 'Update Category' : 'Create Category'}
                  </span>
                  <span className="sm:hidden">
                    {category ? 'Update' : 'Create'}
                  </span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
