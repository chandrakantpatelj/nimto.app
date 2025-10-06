'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Calendar } from 'lucide-react';
import { 
  useFeaturedTemplates, 
  useFeaturedTemplatesLoading, 
  useFeaturedTemplatesError,
  useTemplateActions 
} from '@/store/hooks';

export function HomeTemplatesPreview() {
  // Redux state
  const templates = useFeaturedTemplates();
  const loading = useFeaturedTemplatesLoading();
  const error = useFeaturedTemplatesError();
  const { fetchFeaturedTemplates, clearFeaturedTemplatesError } = useTemplateActions();

  // Force refresh function (useful for manual refresh or when templates are updated)
  const refreshTemplates = async () => {
    clearFeaturedTemplatesError();
    await fetchFeaturedTemplates();
  };

  // Load featured templates on component mount
  useEffect(() => {
    fetchFeaturedTemplates();
  }, [fetchFeaturedTemplates]);

  const handleTemplateSelect = (template, source = 'home') => {
    console.log('Home page: Storing design for event creation:', {
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
        <p className="text-red-600 dark:text-red-400 mb-4">Error loading designs: {error}</p>
        <Button onClick={refreshTemplates}>Try Again</Button>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 dark:text-gray-400 mb-4">No templates available yet.</p>
        <Button asChild>
          <Link href="/templates">Browse All Designs</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Featured Designs
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Choose from our collection of beautiful invitation designs to create your perfect event
        </p>
      </div>

      <div className="grid p-3 grid-cols-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
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
                  DESIGN
                </Badge>
              </div>

              {/* Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 text-white">
                <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-2">
                  {template.name}
                </h3>
                
                {/* Template Meta Info */}
                <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm opacity-90">
                  <div className="flex items-center">
                    <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" />
                    <span className="truncate">{template.category || 'Event Design'}</span>
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
                      Use Design
                    </Link>
                  </Button>
                  {template.isPremium && (
                    <div className="text-center">
                      <Badge className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
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
            View All Designs
          </Link>
        </Button>
      </div>
    </div>
  );
}
