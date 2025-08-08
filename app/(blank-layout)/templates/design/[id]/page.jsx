'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showCustomToast } from '@/components/common/custom-toast';
import { TemplateHeader } from '../components';

function EditTemplate() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    isPremium: false,
    price: 0,
    background: '',
    pageBackground: '',
    content: [], // This will be populated from the canvas
    backgroundStyle: {}, // This will be populated from the canvas
    htmlContent: '', // This will be populated from the canvas
  });

  // Fetch template data on component mount
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setFetching(true);
        setError(null);
        
        const templateId = params.id;
        if (!templateId) {
          throw new Error('Template ID is required');
        }

        const response = await apiFetch(`/api/template/${templateId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch template');
        }

        const result = await response.json();

        if (result.success && result.data) {
          const template = result.data;
          
          // Prefill the form with fetched data
          setFormData({
            name: template.name || '',
            category: template.category || '',
            isPremium: template.isPremium || false,
            price: template.price || 0,
            background: template.background || '',
            pageBackground: template.pageBackground || '',
            content: template.content || [], // Parsed JSON content
            backgroundStyle: template.backgroundStyle || {}, // Parsed JSON background style
            htmlContent: template.htmlContent || '',
          });
        } else {
          throw new Error(result.error || 'Failed to fetch template');
        }
      } catch (err) {
        console.error('Error fetching template:', err);
        setError(err.message);
        showCustomToast('Failed to load template', 'error');
      } finally {
        setFetching(false);
      }
    };

    fetchTemplate();
  }, [params.id]);

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle template name change (for header input)
  const handleTemplateNameChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name: value,
    }));
  };

  // Handle radio button change
  const handleTypeChange = (value) => {
    setFormData((prev) => ({
      ...prev,
      isPremium: value === 'premium',
    }));
  };

  // Save template function
  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Template name is required');
      }
      if (!formData.category.trim()) {
        throw new Error('Category is required');
      }

      const templateId = params.id;
      if (!templateId) {
        throw new Error('Template ID is required');
      }

      // Prepare the data for API
      const templateData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        isPremium: formData.isPremium,
        price: formData.isPremium ? parseFloat(formData.price) || 0 : 0,
        background: formData.background || null,
        pageBackground: formData.pageBackground || null,
        content: formData.content,
        backgroundStyle: formData.backgroundStyle,
        htmlContent: formData.htmlContent || null,
        // These will be populated when canvas is implemented
        previewImageUrl: null,
        imagePath: null,
      };

      const response = await apiFetch(`/api/template/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update template');
      }

      const result = await response.json();

      if (result.success) {
        showCustomToast('Template updated successfully', 'success');
        router.push('/templates');
      } else {
        throw new Error(result.error || 'Failed to update template');
      }
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching template
  if (fetching) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading template preview...</p>
        </div>
      </div>
    );
  }

  // Show error state if template failed to load
  if (error && !fetching) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-gray-800 text-lg font-semibold mb-3">Failed to Load Template</h2>
          <p className="text-gray-500 mb-6 text-sm">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => router.push('/templates')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors ml-3"
            >
              Back to Templates
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Full page loader for save operation only */}
      {loading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Saving template...</p>
          </div>
        </div>
      )}
      
      <TemplateHeader
        onSave={handleSaveTemplate}
        loading={loading}
        templateName={formData.name}
        onTemplateNameChange={handleTemplateNameChange}
      />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 flex-shrink-0 bg-white p-4 border-r border-slate-200 overflow-y-auto min-h-[calc(100vh-var(--header-height))] h-100">
          <Tabs
            defaultValue="profile"
            className="text-sm text-muted-foreground"
          >
            <TabsList variant="line">
              <TabsTrigger value="profile">Details</TabsTrigger>
              <TabsTrigger value="security">Design</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">
              <div className="py-3">
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="w-full mb-5">
                  <Label className="text-muted-foreground">Template Name</Label>
                  <Input
                    type="text"
                    value={formData.name}
                    onChange={handleTemplateNameChange}
                    placeholder="Enter template name"
                  />
                </div>
                <div className="w-full mb-5">
                  <Label className="text-muted-foreground">Category</Label>
                  <Input
                    type="text"
                    value={formData.category}
                    onChange={(e) =>
                      handleInputChange('category', e.target.value)
                    }
                    placeholder="e.g., Birthday, Corporate, Wedding"
                  />
                </div>
                <Label className="text-muted-foreground">Type </Label>

                <RadioGroup
                  value={formData.isPremium ? 'premium' : 'free'}
                  onValueChange={handleTypeChange}
                  className="flex items-center gap-5 mb-5"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label
                      htmlFor="free"
                      className="text-foreground text-sm font-normal"
                    >
                      Free
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="premium" id="premium" />
                    <Label
                      htmlFor="premium"
                      className="text-foreground text-sm font-normal"
                    >
                      Premium
                    </Label>
                  </div>
                </RadioGroup>
                {formData.isPremium && (
                  <div className="w-full mb-5">
                    <Label className="text-muted-foreground">
                      Price (in dollars)
                    </Label>
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange('price', e.target.value)
                      }
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="security">Content for Design</TabsContent>
          </Tabs>
        </aside>
        <main className="flex-1 overflow-auto p-8"></main>
        <aside className="w-74 flex-shrink-0 bg-white p-4 border-l border-slate-200 overflow-y-auto min-h-[calc(100vh-var(--header-height))] h-100">
          <div className="space-y-6">
            <h3 className="font-semibold text-lg mb-2 border-b pb-2">
              Canvas Settings
            </h3>
            <div className="py-3">
              <p className="text-primary fw-500">Canvas Background</p>
              <div className="w-full mb-5">
                <Label className="text-muted-foreground">
                  Color, Gradient, or URL
                </Label>
                <Input
                  type="text"
                  value={formData.background}
                  onChange={(e) =>
                    handleInputChange('background', e.target.value)
                  }
                  placeholder="e.g., #ffffff, linear-gradient(...), or image URL"
                />
              </div>
              <hr className="my-3" />
              <p className="text-primary fw-500">Page Background</p>

              <div className="w-full mb-5">
                <Label className="text-muted-foreground">
                  Color, Gradient, or URL
                </Label>
                <Input
                  type="text"
                  value={formData.pageBackground}
                  onChange={(e) =>
                    handleInputChange('pageBackground', e.target.value)
                  }
                  placeholder="e.g., #ffffff, linear-gradient(...), or image URL"
                />
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export default EditTemplate;
