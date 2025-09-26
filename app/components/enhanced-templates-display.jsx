'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar, Eye, Heart } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export function EnhancedTemplatesDisplay({ selectedCategory = null, searchQuery = '' }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const fetchTemplates = async (pageNum = 1, category = selectedCategory, search = searchQuery, append = false) => {
    try {
      setLoading(true);
      setError(null);

      let url = `/api/template?limit=12&page=${pageNum}`;
      
      if (category) {
        url += `&category=${encodeURIComponent(category)}`;
      }
      
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }

      const response = await apiFetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch templates`);
      }

      const result = await response.json();
      if (result.success) {
        const templateData = result.data || [];
        
        if (append) {
          setTemplates(prev => [...prev, ...templateData]);
        } else {
          setTemplates(templateData);
        }
        
        setHasMore(templateData.length === 12);
        setPage(pageNum);
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
    fetchTemplates(1, selectedCategory, searchQuery, false);
  }, [selectedCategory, searchQuery]);

  const loadMore = () => {
    fetchTemplates(page + 1, selectedCategory, searchQuery, true);
  };

  const handleTemplateSelect = (template, source = 'home') => {
    console.log('Home page: Storing template for event creation:', {
      id: template.id,
      name: template.name,
      s3ImageUrl: template.s3ImageUrl,
      imagePath: template.imagePath,
      templateThumbnailUrl: template.templateThumbnailUrl,
      source
    });
    
    // Store template data in localStorage for the event creation flow
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    localStorage.setItem('navigationSource', source);
    localStorage.removeItem('selectedEvent');
  };

  if (loading && templates.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">Error loading templates: {error}</p>
        <Button onClick={() => fetchTemplates(1, selectedCategory, searchQuery, false)}>
          Try Again
        </Button>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {selectedCategory ? `No templates found for ${selectedCategory}` : 'No templates found'}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {searchQuery ? 'Try adjusting your search terms' : 'Check back later for new templates'}
        </p>
        <Button asChild>
          <Link href="/templates">Browse All Templates</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {selectedCategory ? `${selectedCategory} Templates` : 'Featured Templates'}
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          {selectedCategory 
            ? `Beautiful ${selectedCategory.toLowerCase()} invitation templates for your special event`
            : 'Choose from our collection of beautiful invitation templates to create your perfect event'
          }
        </p>
        {templates.length > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Showing {templates.length} template{templates.length !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {templates.map((template) => (
          <div key={template.id} className="group relative rounded-lg sm:rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-gray-800">
            {/* Template Background Image */}
            <div className="relative aspect-[3/4] overflow-hidden">
              {template.templateThumbnailUrl || template.s3ImageUrl ? (
                <img
                  src={template.templateThumbnailUrl || template.s3ImageUrl}
                  alt={template.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm">No Preview</p>
                  </div>
                </div>
              )}

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Status Badge */}
              <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
                <Badge className="bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 shadow-sm">
                  {template.isPremium ? 'PREMIUM' : 'TEMPLATE'}
                </Badge>
              </div>

              {/* Premium Badge */}
              {template.isPremium && (
                <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
                  <Badge className="bg-yellow-500 text-white text-xs font-medium px-1.5 py-0.5 sm:px-2 sm:py-1 shadow-sm">
                    ${template.price || 20}
                  </Badge>
                </div>
              )}

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 text-white">
                <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-2">
                  {template.name}
                </h3>
                
                {/* Template Meta Info */}
                <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm opacity-90">
                  <div className="flex items-center">
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" />
                    <span className="truncate">{template.category || 'Event Template'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <span className="truncate">Ready to use</span>
                  </div>

                  <div className="flex items-center">
                    <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="truncate">by {template.isSystemTemplate ? 'Nimto' : 'Community'}</span>
                  </div>
                </div>
              </div>

              {/* Hover Action Buttons */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex flex-col gap-1 sm:gap-2">
                  <Button
                    onClick={() => handleTemplateSelect(template, 'home')}
                    asChild
                    size="sm"
                    className="bg-white text-gray-900 hover:bg-gray-100 font-medium text-xs sm:text-sm"
                  >
                    <Link href={`/events/design/${template.id}`}>
                      Use Template
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/90 text-gray-900 hover:bg-white border-white/50 text-xs sm:text-sm"
                    asChild
                  >
                    <Link href={`/templates/${template.id}`}>
                      <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      Preview
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="text-center">
          <Button 
            onClick={loadMore}
            disabled={loading}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Templates'
            )}
          </Button>
        </div>
      )}

      {/* View All Button */}
      <div className="text-center">
        <Button asChild size="lg" variant="outline">
          <Link href="/templates">
            View All Templates
          </Link>
        </Button>
      </div>
    </div>
  );
}
