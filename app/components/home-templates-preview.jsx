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
    // Store template data in localStorage for the event creation flow
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-0">
              {/* Template Preview Image */}
              <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg">
                {template.templateThumbnailUrl || template.s3ImageUrl ? (
                  <img
                    src={template.templateThumbnailUrl || template.s3ImageUrl}
                    alt={template.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 flex items-center justify-center">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">{template.name}</p>
                    </div>
                  </div>
                )}
                {/* Overlay with action buttons */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="flex gap-2">
                    
                    <Button
                      size="sm"
                      onClick={() => handleTemplateSelect(template, 'home')}
                      asChild
                    >
                      <Link href={`/events/design/${template.id}`}>
                        Use Template
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg line-clamp-1">
                    {template.name}
                  </h3>
                  <div className="flex gap-1 ml-2">
                    {template.isPremium && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 text-xs">
                        Premium
                      </Badge>
                    )}
                    {template.isSystemTemplate && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {template.category || 'Event Template'}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {template.isPremium ? `$${template.price || 20}` : 'Free'}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleTemplateSelect(template, 'create-event')}
                    asChild
                    className="text-xs"
                  >
                    <Link href={`/events/design/${template.id}`}>
                      Create Event
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
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
