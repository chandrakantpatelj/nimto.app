'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, MapPin, Pencil, Search, Trash2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import DeleteEvent from './delete-event';

const Events = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [templateToDelete, setTemplateToDelete] = useState(null);
  const [deletingTemplateId, setDeletingTemplateId] = useState(null);

  // Fetch templates from API
  const fetchTemplates = async (search = '') => {
    try {
      setLoading(true);
      setError(null);

      const url = '/api/template';
      // const url = search
      //   ? `/api/template?search=${encodeURIComponent(search)}`
      //   : '/api/template';

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

  // Delete template function
  const deleteTemplate = async (templateId) => {};

  // Handle delete button click
  const handleDeleteClick = (template) => {
    setTemplateToDelete(template);
    setShowDeleteDialog(true);
  };

  // Initial fetch
  useEffect(() => {
    fetchTemplates();
  }, []);

  const renderTemplate = (template, index) => {
    const isDeleting = deletingTemplateId === template.id;

    return (
      <Card
        className={`rounded-xl relative h-auto ${isDeleting ? 'opacity-50' : ''}`}
        key={template.id || index}
      >
        {/* {isDeleting && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10 rounded-xl">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Deleting...</p>
            </div>
          </div>
        )} */}
        <div className="flex flex-col gap-2 justify-between h-100">
          <div className="mb-2 min-h-32 h-100 overflow-hidden rounded-tr-xl rounded-tl-xl">
            <img
              src={
                template.previewImageUrl ||
                template.imagePath ||
                toAbsoluteUrl('/media/template-img.png')
              }
              className="w-full "
              alt={template.name}
              onError={(e) => {
                e.target.src = toAbsoluteUrl('/media/template-img.png');
              }}
            />
          </div>
          <div className="p-4 relative">
            <span className="text-sm text-primary uppercase">Conference</span>

            <div className="absolute top-4 right-4 flex gap-1">
              <Button variant="softPrimary" mode="icon">
                <Pencil className="text-primary" />
              </Button>

              <Button variant="softDanger" mode="icon">
                <Trash2 className="text-red-500" />
              </Button>
            </div>

            <h3 className="text-lg font-semibold mt-2">
              Tech Innovators Conference 2024
            </h3>

            <div className="flex items-center gap-2 text-sm  mt-1">
              <img
                src="https://i.pravatar.cc/24"
                alt="Avatar"
                className="w-7 h-7 rounded-full"
              />
              <span>Event Post</span>
            </div>

            <div className="flex items-center  mt-3">
              <CalendarCheck className="w-5 h-5 mr-2 " />
              <span className="text-sm font-medium text-secondary-foreground">
                26/10/2025
              </span>
            </div>

            <div className="flex items-center  mt-1">
              <MapPin className="w-5 h-5  mr-2 " />
              <span className="text-sm font-medium text-secondary-foreground">
                Silicon Valley Convention Center
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <>
      <div className="flex flex-col items-stretch gap-4 lg:gap-6.5">
        <div className="relative">
          <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Search by title, location, category or host..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 w-95"
          />
        </div>

        <div id="projects_cards">
          {templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-12">
              <p className="text-muted-foreground">No events found</p>
              {searchQuery && (
                <Button variant="outline" onClick={() => setSearchQuery('')}>
                  Clear search
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 lg:gap-4.5">
                {templates.map((template, index) => {
                  return renderTemplate(template, index);
                })}
              </div>
              <div className="flex grow justify-center pt-5 lg:pt-7.5">
                <Button mode="link" underlined="dashed" asChild>
                  <Link href="#">Show more templates</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Events;
