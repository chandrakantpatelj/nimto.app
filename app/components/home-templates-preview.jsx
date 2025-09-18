'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar } from 'lucide-react';
import { apiFetch } from '@/lib/api';

// Cache management utilities
const CACHE_KEY = 'homeTemplatesCache';
const CACHE_TIMESTAMP_KEY = 'homeTemplatesCacheTimestamp';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

const clearTemplatesCache = () => {
  localStorage.removeItem(CACHE_KEY);
  localStorage.removeItem(CACHE_TIMESTAMP_KEY);
};

const getCachedTemplates = () => {
  const cachedTemplates = localStorage.getItem(CACHE_KEY);
  const cacheTimestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
  const now = Date.now();

  if (cachedTemplates && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_EXPIRY) {
    try {
      return JSON.parse(cachedTemplates);
    } catch (parseError) {
      console.warn('Failed to parse cached templates:', parseError);
      return null;
    }
  }
  return null;
};

const setCachedTemplates = (templates) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(templates));
  localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
};

// Export cache utilities for use in other components
export { clearTemplatesCache, getCachedTemplates, setCachedTemplates };

export function HomeTemplatesPreview() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Force refresh function (useful for manual refresh or when templates are updated)
  const refreshTemplates = async () => {
    clearTemplatesCache();
    setLoading(true);
    setError(null);
    
    try {
      const response = await apiFetch('/api/template?limit=6');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch templates`);
      }

      const result = await response.json();
      if (result.success) {
        const templateData = result.data || [];
        setTemplates(templateData);
        setCachedTemplates(templateData);
      } else {
        throw new Error(result.error || 'Failed to fetch templates');
      }
    } catch (err) {
      console.error('Error refreshing templates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check if this is a page refresh (performance.navigation.type === 1)
        const isPageRefresh = performance.navigation && performance.navigation.type === 1;
        
        // If it's a page refresh, clear cache and fetch fresh data
        if (isPageRefresh) {
          clearTemplatesCache();
        }

        // Check for cached templates first (only if not a page refresh)
        if (!isPageRefresh) {
          const cachedTemplates = getCachedTemplates();
          if (cachedTemplates) {
            setTemplates(cachedTemplates);
            setLoading(false);
            return;
          }
        }

        // Fetch fresh data from API
        const response = await apiFetch('/api/template?limit=6');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch templates`);
        }

        const result = await response.json();
        if (result.success) {
          const templateData = result.data || [];
          setTemplates(templateData);
          setCachedTemplates(templateData);
        } else {
          throw new Error(result.error || 'Failed to fetch templates');
        }
      } catch (err) {
        console.error('Error fetching templates:', err);
        setError(err.message);
        
        // Try to use cached data as fallback even if expired
        const fallbackTemplates = localStorage.getItem(CACHE_KEY);
        if (fallbackTemplates) {
          try {
            const parsedTemplates = JSON.parse(fallbackTemplates);
            setTemplates(parsedTemplates);
            setError(null); // Clear error if we have fallback data
          } catch (parseError) {
            console.warn('Failed to parse fallback cached templates:', parseError);
          }
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

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
    // The template already has the correct s3ImageUrl from the API
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
    // Store navigation source for smart redirect
    localStorage.setItem('navigationSource', source);
    // Clear any existing event data to ensure fresh template loading
    localStorage.removeItem('selectedEvent');
  };

  if (loading) {
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
        <Button onClick={refreshTemplates}>Try Again</Button>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No templates available yet.</p>
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
          Featured Templates
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Choose from our collection of beautiful invitation templates to create your perfect event
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
        {templates.map((template) => (
          <div key={template.id} className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            {/* Template Background Image */}
            <div className="relative aspect-[3/4] overflow-hidden">
              {template.templateThumbnailUrl || template.s3ImageUrl ? (
                <img
                  src={template.templateThumbnailUrl || template.s3ImageUrl}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                </div>
              )}

              {/* Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

              {/* Status Badge */}
              <div className="absolute top-3 left-3">
                <Badge className="bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 shadow-sm">
                  TEMPLATE
                </Badge>
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                  {template.name}
                </h3>
                
                {/* Template Meta Info */}
                <div className="space-y-1 text-sm opacity-90">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1.5" />
                    <span>{template.category || 'Event Template'}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="h-3 w-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    <span>Ready to use</span>
                  </div>

                  <div className="flex items-center">
                    <svg className="h-3 w-3 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span>by {template.isSystemTemplate ? 'Nimto' : 'Community'}</span>
                  </div>
                </div>
              </div>

              {/* Hover Action Buttons */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                <div className="flex flex-col gap-2">
                  <Button
                    onClick={() => handleTemplateSelect(template, 'home')}
                    asChild
                    className="bg-white text-gray-900 hover:bg-gray-100 font-medium"
                  >
                    <Link href={`/events/design/${template.id}`}>
                      Use Template
                    </Link>
                  </Button>
                  {template.isPremium && (
                    <div className="text-center">
                      <Badge className="bg-yellow-500 text-white text-xs px-2 py-1">
                        ${template.price || 20}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

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
