'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  useActiveFilters,
  useAllTemplates,
  useEventActions,
  useTemplateActions,
  useTemplateError,
  useTemplateLoading,
  useTemplatePagination,
} from '@/store/hooks';
import { Crown, Loader2, Sparkles, Star, Trash2, Zap } from 'lucide-react';
import { useSession } from 'next-auth/react';
import PropTypes from 'prop-types';
import { useRoleBasedAccess } from '@/hooks/use-role-based-access';
import { useToast } from '@/providers/toast-provider';
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TemplateImageDisplay from '@/components/template-image-display';
import LazyImage from './LazyImage';

const INITIAL_LIMIT = 6;
const LOAD_MORE_STEP = 6;

const EnhancedTemplates = ({
  searchQuery = '',
  selectedCategory = null,
  filters = {},
}) => {
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();
  const { data: session } = useSession();
  const { roles } = useRoleBasedAccess();
  const isSuperAdmin = roles.isSuperAdmin;
  const isAdmin = roles.isAdmin;
  const isAuthenticated = !!session;

  // Redux state and actions
  const allTemplates = useAllTemplates();
  const loading = useTemplateLoading();
  const error = useTemplateError();
  const activeFilters = useActiveFilters();
  const pagination = useTemplatePagination();
  const {
    fetchTemplates,
    deleteTemplate,
    setActiveFilters,
    setSelectedTemplate,
    setPagination,
  } = useTemplateActions();

  const { setSelectedEvent } = useEventActions();

  // Local state for UI
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingTemplateId, setDeletingTemplateId] = useState(null);

  // Local state for "Load More"
  const [displayLimit, setDisplayLimit] = useState(INITIAL_LIMIT);

  const sentinelRef = useRef(null);

  // Derived state for initial load
  const initialLoading = loading && allTemplates.length === 0;
  const loadingMore = loading && allTemplates.length > 0;

  // Update active filters in Redux when props change
  useEffect(() => {
    const newFilters = {
      searchQuery,
      selectedCategory,
      orientation: filters.orientation,
      premium: filters.premium,
      trending: filters.trending,
      featured: filters.featured,
      new: filters.new,
    };

    const filtersChanged = Object.keys(newFilters).some(
      (key) => activeFilters[key] !== newFilters[key],
    );

    if (filtersChanged) {
      setActiveFilters(newFilters);
    }
  }, [searchQuery, selectedCategory, filters, activeFilters, setActiveFilters]);

  // Load templates using Redux with server-side filtering
  const loadTemplates = async (limit = displayLimit) => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.append('search', searchQuery);
      if (selectedCategory) params.append('category', selectedCategory);
      if (filters.orientation)
        params.append('orientation', filters.orientation);
      if (filters.premium === 'premium') params.append('isPremium', 'true');
      if (filters.premium === 'free') params.append('isPremium', 'false');
      if (filters.trending) params.append('trending', 'true');
      if (filters.featured) params.append('featured', 'true');
      if (filters.new) params.append('new', 'true');

      params.append('limit', limit.toString());
      params.append('offset', '0');

      await fetchTemplates(params.toString());
    } catch (err) {
      console.error('❌ Component: Error fetching templates:', err);
    }
  };

  // Load templates when filters change (reset to initial limit)
  useEffect(() => {
    setDisplayLimit(INITIAL_LIMIT);
    loadTemplates(INITIAL_LIMIT);
  }, [searchQuery, selectedCategory, filters]);

  //// Scroll to bottom after loading more templates
  //useEffect(() => {
  //  if (displayLimit > INITIAL_LIMIT) {
  //    window.scrollTo({
  //      top: document.documentElement.scrollHeight,
  //      behavior: 'smooth',
  //    });
  //  }
  //}, [allTemplates, displayLimit]);

  // Load templates on component mount based on stored filters
  useEffect(() => {
    if (
      activeFilters &&
      (activeFilters.searchQuery ||
        activeFilters.selectedCategory ||
        activeFilters.orientation ||
        activeFilters.premium ||
        activeFilters.trending ||
        activeFilters.featured ||
        activeFilters.new)
    ) {
      loadTemplatesFromStoredFilters(displayLimit);
    } else if (allTemplates.length === 0) {
      loadTemplates(displayLimit);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount

  // Load templates based on stored Redux filters
  const loadTemplatesFromStoredFilters = async (limit = displayLimit) => {
    try {
      const params = new URLSearchParams();
      if (activeFilters.searchQuery)
        params.append('search', activeFilters.searchQuery);
      if (activeFilters.selectedCategory)
        params.append('category', activeFilters.selectedCategory);
      if (activeFilters.orientation)
        params.append('orientation', activeFilters.orientation);
      if (activeFilters.premium === 'premium')
        params.append('isPremium', 'true');
      if (activeFilters.premium === 'free') params.append('isPremium', 'false');
      if (activeFilters.trending) params.append('trending', 'true');
      if (activeFilters.featured) params.append('featured', 'true');
      if (activeFilters.new) params.append('new', 'true');

      params.append('limit', limit.toString());
      params.append('offset', '0');

      await fetchTemplates(params.toString());
    } catch (err) {
      console.error('Error loading templates from stored filters:', err);
    }
  };

  // Load more handler
  const handleLoadMore = () => {
    const newLimit = displayLimit + LOAD_MORE_STEP;
    setDisplayLimit(newLimit);
    loadTemplates(newLimit);
  };

  // Infinite scroll effect
  useEffect(() => {
    if (loading) return; // Don't observe while loading

    const observer = new window.IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          allTemplates.length < pagination.total
        ) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      }
    );

    const sentinel = sentinelRef.current;
    if (sentinel) observer.observe(sentinel);

    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allTemplates, loading, pagination.total]);

  const handleTemplateSelect = (template) => {
    setSelectedEvent(null);
    localStorage.setItem('navigationSource', 'templates');
    router.push(`/events/design/${template.id}`);
  };

  const handleEdit = (template) => {
    setSelectedTemplate(template);
    router.push(`/templates/design/${template.id}`);
  };

  const handleDelete = async (template) => {
    try {
      setDeleteLoading(true);
      setDeletingTemplateId(template.id);

      await deleteTemplate(template.id);

      toastSuccess('Design deleted successfully');
      setShowDeleteDialog(false);
      setTemplateToDelete(null);
    } catch (err) {
      toastError(`Failed to delete design: ${err.message}`);
    } finally {
      setDeleteLoading(false);
      setDeletingTemplateId(null);
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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-white';
      case 'landscape':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-700 dark:text-white';
      case 'square':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-700 dark:text-white';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-white';
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
        <Button onClick={() => loadTemplates(displayLimit)}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Templates Grid */}
      {allTemplates.length === 0 ? (
        <div className="text-center py-8 sm:py-12 px-4 sm:px-0">
          <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm sm:text-base">
            No templates found.
          </p>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/templates/design">Create Your First Design</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4 lg:gap-5 px-2 sm:px-4 md:px-0">
            {allTemplates.map((template) => (
              <Card
                key={template.id}
                className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-105 border-0 shadow-sm sm:shadow-md bg-white dark:bg-slate-800 rounded-md sm:rounded-lg lg:rounded-xl overflow-hidden"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardContent className="p-0">
                  {/* Template Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    {template.templateThumbnailUrl || template.s3ImageUrl ? (
                      <LazyImage
                        src={
                          template.templateThumbnailUrl || template.s3ImageUrl
                        }
                        alt={template.name}
                        className="w-full h-full group-hover:scale-110 transition-transform duration-300"
                        placeholder={
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                {template.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Loading...
                            </span>
                          </div>
                        }
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <TemplateImageDisplay
                          template={template}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-0.5 left-0.5 sm:top-1 sm:left-1 flex flex-col gap-0.5 sm:gap-1">
                      {template.badge && (
                        <Badge
                          variant={getBadgeVariant(template.badge)}
                          className="text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 bg-white/90 dark:bg-slate-800/90 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-slate-600 shadow-sm"
                        >
                          {getBadgeIcon(template.badge)}
                          <span className="hidden sm:inline">
                            {template.badge}
                          </span>
                        </Badge>
                      )}
                      {template.isTrending && (
                        <Badge
                          variant="default"
                          className="text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 bg-orange-500 text-white shadow-sm"
                        >
                          <Zap className="h-2 w-2 mr-0.5 sm:mr-1" />
                          <span className="hidden sm:inline">Trending</span>
                        </Badge>
                      )}
                      {template.isFeatured && (isSuperAdmin || isAdmin) && (
                        <Badge
                          variant="outline"
                          className="text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 bg-white/90 dark:bg-slate-800/90 text-gray-900 dark:text-gray-100 border border-yellow-300 dark:border-yellow-600 shadow-sm"
                        >
                          <Star className="h-2 w-2 mr-0.5 sm:mr-1" />
                          <span className="hidden sm:inline">Featured</span>
                        </Badge>
                      )}
                      {template.isNew && (
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 bg-green-500 text-white shadow-sm"
                        >
                          <Sparkles className="h-2 w-2 mr-0.5 sm:mr-1" />
                          <span className="hidden sm:inline">New</span>
                        </Badge>
                      )}
                    </div>

                    {/* Price Badge */}
                    <div className="absolute top-0.5 right-0.5 sm:top-1 sm:right-1">
                      {template.isPremium ? (
                        <Badge
                          variant="destructive"
                          className="text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 bg-red-500 text-white shadow-sm"
                        >
                          ${template.price}
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 bg-green-500 text-white shadow-sm"
                        >
                          Free
                        </Badge>
                      )}
                    </div>

                    {/* Orientation Badge */}
                    {template.orientation && (
                      <div className="absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1">
                        <Badge
                          className={`text-xs px-1.5 py-0.5 sm:px-2 sm:py-1 ${getOrientationColor(template.orientation)} border border-gray-300 dark:border-slate-500 shadow-lg font-semibold`}
                        >
                          <span className="hidden sm:inline">
                            {template.orientation.toUpperCase()}
                          </span>
                          <span className="sm:hidden">
                            {template.orientation.charAt(0).toUpperCase()}
                          </span>
                        </Badge>
                      </div>
                    )}

                    {/* Popularity Indicator */}
                    {template.popularity > 0 && (
                      <div className="absolute bottom-0.5 left-0.5 sm:bottom-1 sm:left-1">
                        <div className="flex items-center bg-black/80 dark:bg-slate-900/90 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-xs shadow-sm border border-gray-600 dark:border-slate-500">
                          <Star className="h-2 w-2 mr-0.5 sm:mr-1 fill-yellow-400 text-yellow-400" />
                          <span className="hidden sm:inline">
                            {Math.round(template.popularity * 100)}%
                          </span>
                          <span className="sm:hidden">
                            {Math.round(template.popularity * 100)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Template Info */}
                  <div className="p-1.5 sm:p-2 md:p-3">
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-0.5 sm:mb-1 line-clamp-1 text-xs sm:text-sm">
                      {template.name}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 sm:mb-2 font-medium">
                      {template.category}
                    </p>

                    {/* Colors */}
                    {template.colors && template.colors.length > 0 && (
                      <div className="flex gap-1 mb-2">
                        {template.colors.slice(0, 3).map((color, index) => (
                          <div
                            key={`${color}-${index}`}
                            className="w-3 h-3 rounded-full border border-gray-200 dark:border-slate-600"
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          />
                        ))}
                        {template.colors.length > 3 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            +{template.colors.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex flex-col gap-1 mt-2">
                      <Button
                        className="cursor-pointer group focus-visible:outline-hidden inline-flex items-center justify-center has-data-[arrow=true]:justify-between whitespace-nowrap font-medium ring-offset-background disabled:pointer-events-none disabled:opacity-60 [&_svg]:shrink-0 h-8.5 rounded-md px-3 gap-1.5 text-[0.8125rem] leading-(--text-sm--line-height) [&_svg:not([class*=size-])]:size-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateSelect(template);
                        }}
                      >
                        Use Design
                      </Button>
                      <div className="flex gap-1">
                        {isAuthenticated && isSuperAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border border-gray-200 dark:border-slate-600 hover:border-purple-500 hover:text-purple-600 dark:hover:text-purple-400 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 font-semibold py-1 rounded-md transition-all duration-300 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(template);
                            }}
                          >
                            Edit
                          </Button>
                        )}
                        {isAuthenticated && isSuperAdmin && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 dark:hover:border-red-700 bg-white dark:bg-slate-700 font-semibold py-1 rounded-md transition-all duration-300 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              confirmDelete(template);
                            }}
                            disabled={deletingTemplateId === template.id}
                          >
                            {deletingTemplateId === template.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Infinite scroll sentinel loader */}
          {allTemplates.length < pagination.total && (
            <div ref={sentinelRef} className="flex justify-center p-4">
              {loadingMore ? (
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              ) : null}
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Design</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{templateToDelete?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>
              Cancel
            </AlertDialogCancel>
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

EnhancedTemplates.propTypes = {
  searchQuery: PropTypes.string,
  selectedCategory: PropTypes.string,
  filters: PropTypes.object,
};

export { EnhancedTemplates };
