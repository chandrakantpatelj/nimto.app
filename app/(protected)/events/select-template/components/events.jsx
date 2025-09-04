'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventActions } from '@/store/hooks';
import { Loader2, Search } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import TemplateImageDisplay from '@/components/template-image-display';

const SelectEvents = () => {
  const router = useRouter();
  const { setSelectedEvent } = useEventActions();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Handle template selection
  const handleTemplateSelect = (template) => {
    // Initialize selectedEvent with template data
    setSelectedEvent({
      // Template fields (for design)
      templateId: template.id,
      jsonContent: template.jsonContent || '',
      backgroundStyle: template.backgroundStyle || '',
      htmlContent: template.htmlContent || '',
      background: template.background || '',
      pageBackground: template.pageBackground || '',
      imagePath: template.imagePath || '',
      s3ImageUrl: template.s3ImageUrl || '', // Use template's s3ImageUrl directly

      // Event fields (empty for create mode)
      title: '',
      description: '',
      date: '',
      time: '',
      location: '',
      status: 'draft',
      guests: [],
    });

    // Navigate to design page
    router.push(`/events/design/${template.id}`);
  };

  // Fetch templates from API
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiFetch('/api/template');

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

  // Initial fetch
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Filter templates based on search query
  const filteredTemplates = templates.filter((template) => {
    if (!searchQuery) return true;

    const query = searchQuery.toLowerCase();
    return (
      template.name.toLowerCase().includes(query) ||
      template.category.toLowerCase().includes(query)
    );
  });

  const renderTemplate = (template) => {
    return (
      <Card
        key={template.id}
        className="rounded-xl group overflow-hidden h-auto"
      >
        <div className="flex flex-col gap-2">
          <div className="min-h-100 h-100 overflow-hidden rounded-tr-xl rounded-tl-xl relative bg-gray-50">
            <TemplateImageDisplay
              template={template}
              className="w-full h-full object-contain rounded-tr-xl rounded-tl-xl"
            />

            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="primary"
                onClick={() => handleTemplateSelect(template)}
              >
                Select Template
              </Button>
            </div>
          </div>

          <div className="p-4 relative">
            <h3 className="text-lg font-semibold mt-2">{template.name}</h3>

            <span className="text-sm font-medium text-secondary-foreground">
              {template.category}
            </span>

            <div className="text-sm font-medium text-purple-600">
              {template.isPremium
                ? `Premium ($${template.price || 20})`
                : 'Free'}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading templates...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <p className="text-red-500">Error: {error}</p>
        <Button onClick={() => fetchTemplates()}>Retry</Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col items-stretch gap-4 lg:gap-6.5">
        <div className="relative">
          <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 w-95"
          />
        </div>

        <div id="projects_cards">
          {filteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <p className="text-muted-foreground">
                {searchQuery
                  ? 'No templates found matching your search'
                  : 'No templates found'}
              </p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 lg:gap-4.5">
                {filteredTemplates.map((template) => renderTemplate(template))}
              </div>
              <div className="flex grow justify-center pt-5 lg:pt-7.5">
                <Button mode="link" underlined="dashed" asChild>
                  <a href="#">Show more templates</a>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default SelectEvents;
