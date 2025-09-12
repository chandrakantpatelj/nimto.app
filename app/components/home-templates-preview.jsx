'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Eye, Calendar } from 'lucide-react';
import { apiFetch } from '@/lib/api';

export function HomeTemplatesPreview() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiFetch('/api/template?limit=6');
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch templates`);
        }

        const result = await response.json();
        if (result.success) {
          setTemplates(result.data || []);
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

    fetchTemplates();
  }, []);

  const handleTemplateSelect = (template) => {
    // Store template data in localStorage for the event creation flow
    localStorage.setItem('selectedTemplate', JSON.stringify(template));
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
        <Button onClick={() => window.location.reload()}>Try Again</Button>
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
                {template.previewImageUrl || template.s3ImageUrl ? (
                  <img
                    src={template.previewImageUrl || template.s3ImageUrl}
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
                      variant="secondary"
                      asChild
                      className="bg-white/90 hover:bg-white text-gray-900"
                    >
                      <Link href={`/templates/preview/${template.id}`}>
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleTemplateSelect(template)}
                      asChild
                    >
                      <Link href="/events/design/new">
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
                    onClick={() => handleTemplateSelect(template)}
                    asChild
                    className="text-xs"
                  >
                    <Link href="/events/design/new">
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
