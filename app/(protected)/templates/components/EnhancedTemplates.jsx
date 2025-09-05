'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Trash2, Star, Crown, Zap, Sparkles } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { getProxiedImageUrl } from '@/lib/image-proxy';
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
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { showCustomToast } from '@/components/common/custom-toast';
import TemplateImageDisplay from '@/components/template-image-display';

const EnhancedTemplates = ({ searchQuery = '', selectedCategory = null, filters = {} }) => {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState(null);

  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (filters.orientation) params.append('orientation', filters.orientation);
      if (filters.premium === 'premium') params.append('isPremium', 'true');
      if (filters.premium === 'free') params.append('isPremium', 'false');
      if (filters.trending) params.append('trending', 'true');
      if (filters.featured) params.append('featured', 'true');
      if (filters.new) params.append('new', 'true');

      const url = `/api/template?${params.toString()}`;
      const response = await apiFetch(url);

      if (!response.ok) {
        throw new Error('Failed to fetch templates');
      }

      const result = await response.json();

      if (result.success) {
        setTemplates(result.data);
      } else {
        throw new Error(result.error || 'Failed to fetch templates');
      }
    } catch (err) {
      console.error('Error fetching templates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, [searchQuery, selectedCategory, filters]);

  const handleTemplateSelect = (template) => {
    // Navigate to events design page with template
    router.push(`/events/design/${template.id}`);
  };

  const handleEdit = (template) => {
    router.push(`/templates/design/${template.id}`);
  };

  const handleDelete = async (template) => {
    try {
      setDeleteLoading(true);
      setDeletingTemplateId(template.id);

      const response = await apiFetch(`/api/template/${template.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete template');
      }

      showCustomToast('Template deleted successfully', 'success');
      fetchTemplates(); // Refresh the list
    } catch (err) {
      console.error('Error deleting template:', err);
      showCustomToast(`Failed to delete template: ${err.message}`, 'error');
    } finally {
      setDeleteLoading(false);
      setDeletingTemplateId(null);
      setShowDeleteDialog(false);
      setTemplateToDelete(null);
    }
  };

  const confirmDelete = (template) => {
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  const getBadgeVariant = (badge) => {
    switch (badge) {
      case 'Premium':
        return 'destructive';
      case 'Trending':
        return 'default';
      case 'New':
        return 'secondary';
      case 'Featured':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case 'Premium':
        return <Crown className="h-3 w-3 mr-1" />;
      case 'Trending':
        return <Zap className="h-3 w-3 mr-1" />;
      case 'Featured':
        return <Star className="h-3 w-3 mr-1" />;
      case 'New':
        return <Sparkles className="h-3 w-3 mr-1" />;
      default:
        return null;
    }
  };

  const getOrientationColor = (orientation) => {
    switch (orientation) {
      case 'portrait':
        return 'bg-blue-100 text-blue-800';
      case 'landscape':
        return 'bg-purple-100 text-purple-800';
      case 'square':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchTemplates}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Templates Grid */}
      {templates.length === 0 ? (
        <div className="text-center py-8 sm:py-12 px-4 sm:px-0">
          <p className="text-gray-600 mb-4 text-sm sm:text-base">No templates found.</p>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/templates/design">Create Your First Template</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6 sm:mb-8 px-4 sm:px-0">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Templates ({templates.length})
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 px-4 sm:px-0">
            {templates.map((template) => (
              <Card 
                key={template.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-2xl hover:scale-105 border-0 shadow-lg bg-white rounded-xl sm:rounded-2xl overflow-hidden"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardContent className="p-0">
                  {/* Template Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {template.thumbnailUrl || template.previewImageUrl ? (
                      <img
                        src={getProxiedImageUrl(template.thumbnailUrl || template.previewImageUrl)}
                        alt={template.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <TemplateImageDisplay 
                          template={template}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {template.badge && (
                        <Badge 
                          variant={getBadgeVariant(template.badge)}
                          className="text-xs font-medium"
                        >
                          {getBadgeIcon(template.badge)}
                          {template.badge}
                        </Badge>
                      )}
                      {template.isTrending && (
                        <Badge variant="default" className="text-xs font-medium">
                          <Zap className="h-3 w-3 mr-1" />
                          Trending
                        </Badge>
                      )}
                      {template.isFeatured && (
                        <Badge variant="outline" className="text-xs font-medium">
                          <Star className="h-3 w-3 mr-1" />
                          Featured
                        </Badge>
                      )}
                      {template.isNew && (
                        <Badge variant="secondary" className="text-xs font-medium">
                          <Sparkles className="h-3 w-3 mr-1" />
                          New
                        </Badge>
                      )}
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-2 right-2">
                      {template.isPremium ? (
                        <Badge variant="destructive" className="text-xs font-medium">
                          ${template.price}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs font-medium">
                          Free
                        </Badge>
                      )}
                    </div>

                    {/* Orientation Badge */}
                    {template.orientation && (
                      <div className="absolute bottom-2 right-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getOrientationColor(template.orientation)}`}
                        >
                          {template.orientation.toUpperCase()}
                        </Badge>
                      </div>
                    )}

                    {/* Popularity Indicator */}
                    {template.popularity > 0 && (
                      <div className="absolute bottom-2 left-2">
                        <div className="flex items-center bg-black/70 text-white px-2 py-1 rounded text-xs">
                          <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                          {Math.round(template.popularity * 100)}%
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div className="p-4 sm:p-6">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 text-base sm:text-lg">
                      {template.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 font-medium">
                      {template.category}
                    </p>
                    
                    {/* Colors */}
                    {template.colors && template.colors.length > 0 && (
                      <div className="flex gap-1 mb-2">
                        {template.colors.slice(0, 4).map((color, index) => (
                          <div
                            key={`${color}-${index}`}
                            className="w-4 h-4 rounded-full border border-gray-200"
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          />
                        ))}
                        {template.colors.length > 4 && (
                          <span className="text-xs text-gray-500">
                            +{template.colors.length - 4}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Keywords */}
                    {template.keywords && template.keywords.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {template.keywords.slice(0, 2).map((keyword, index) => (
                          <Badge key={`${keyword}-${index}`} variant="outline" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                        {template.keywords.length > 2 && (
                          <span className="text-xs text-gray-500">
                            +{template.keywords.length - 2} more
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-3 sm:mt-4">
                      <Button 
                        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 sm:py-2 rounded-lg transition-all duration-300 text-sm sm:text-base"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template);
                        }}
                      >
                        Use Template
                      </Button>
                      <div className="flex gap-2 sm:gap-3">
                        <Button 
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none border-2 border-gray-200 hover:border-purple-500 hover:text-purple-600 font-semibold py-2 rounded-lg transition-all duration-300 text-sm sm:text-base"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(template);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 sm:flex-none border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 font-semibold py-2 rounded-lg transition-all duration-300 text-sm sm:text-base"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmDelete(template);
                          }}
                          disabled={deletingTemplateId === template.id}
                        >
                          {deletingTemplateId === template.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(templateToDelete)}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export { EnhancedTemplates };
