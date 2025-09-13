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
  const { toastSuccess, toastError, toastWarning } = useToast();
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Edit Category' : 'Create New Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Category name"
                required
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange('slug', e.target.value)}
                placeholder="category-slug"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Category description"
              rows={3}
            />
          </div>

          {/* Image Upload Section */}
          <div className="space-y-4">
            <Label>Category Thumbnail</Label>
            <div className="flex items-center gap-4">
              {formData.thumbnailUrl ? (
                <div className="relative">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Category thumbnail"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={removeImage}
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 bg-red-500 text-white hover:bg-red-600"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1">
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
                  className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  {uploadingImage ? 'Uploading...' : 'Upload Image'}
                </Label>
                <p className="text-xs text-gray-500 mt-1">
                  Recommended: 200x200px, max 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Color */}
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                placeholder="#FF6B6B"
                type="color"
              />
            </div>

            {/* Sort Order */}
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  handleInputChange('sortOrder', parseInt(e.target.value) || 0)
                }
                min="0"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => handleInputChange('isActive', e.target.checked)}
              className="rounded"
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : category ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
