'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showCustomToast } from '@/components/common/custom-toast';

import { TemplateHeader } from '../../events/components';
import { useTemplateImage } from '@/hooks/use-template-image';

function Design() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Template image operations
  const {
    uploadTemplateImage,
    loading: imageLoading,
    error: imageError,
  } = useTemplateImage();

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

  // Image state
  const [imageUrl, setImageUrl] = useState('');
  const [canvasState, setCanvasState] = useState(null);
  const [uploadedImageFile, setUploadedImageFile] = useState(null); // Store uploaded file for later saving

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

  // Handle image upload - store file for later upload on form submit
  const handleImageUpload = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      showCustomToast('Please select a valid image file', 'error');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showCustomToast('Image size should be less than 5MB', 'error');
      return;
    }

    try {
      // Store the file for later upload
      console.log('file', file);
      setUploadedImageFile(file);

      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      console.log('previewUrl', previewUrl);

      setImageUrl(previewUrl);
      showCustomToast('Image selected successfully!', 'success');
    } catch (error) {
      showCustomToast(`Failed to process image: ${error.message}`, 'error');
    }
  };

  // Handle canvas save
  const handleCanvasSave = (state) => {
    setCanvasState(state);
    setFormData((prev) => ({
      ...prev,
      content: state.canvas?.objects || [],
      backgroundStyle: state.canvas?.background || {},
      htmlContent: state.htmlContent || '',
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

      // Create template first
      const response = await apiFetch('/api/template/create-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create template');
      }

      const result = await response.json();

      if (result.success) {
        // Upload image if one was selected
        if (uploadedImageFile) {
          try {
            showCustomToast('Uploading image to S3...', 'info');
            await uploadTemplateImage(result.data.id, uploadedImageFile);
            showCustomToast('Image uploaded successfully!', 'success');
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError);
            showCustomToast('Template created but image upload failed', 'warning');
          }
        }

        showCustomToast('Template created successfully', 'success');
        router.push('/templates');
      } else {
        throw new Error(result.error || 'Failed to create template');
      }
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              <TabsTrigger value="design">Design</TabsTrigger>
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
            <TabsContent value="design">
              <div className="py-3">
                <div className="w-full mb-5">
                  <Label className="text-muted-foreground">
                    Upload New Image
                  </Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                    <label className="cursor-pointer block text-center">
                      <svg
                        className="mx-auto h-8 w-8 text-gray-400 mb-2"
                        stroke="currentColor"
                        fill="none"
                        viewBox="0 0 48 48"
                      >
                        <path
                          d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <p className="text-sm font-medium text-gray-600">
                        Click to upload new image
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, GIF up to 5MB (uploads when template is saved)
                      </p>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            handleImageUpload(file);
                          }
                        }}
                        disabled={loading || imageLoading}
                      />
                    </label>
                  </div>
                  {imageLoading && (
                    <div className="mt-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full animate-pulse"></div>
                        </div>
                        <span className="text-xs text-gray-500">Uploading...</span>
                      </div>
                    </div>
                  )}
                  {uploadedImageFile && (
                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                      <p className="text-xs text-green-600">
                        ✓ Image selected: {uploadedImageFile.name}
                      </p>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-2">
                    Upload an image to get started. Images are uploaded to S3 when
                    the template is saved.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
        <main className="flex-1 overflow-auto p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Image Editor
              </h1>
              <p className="text-gray-600">
                Edit your image using the powerful Pixie editor
              </p>
            </div>

            {/* Image Editor Removed */}
            <div className="h-[700px] flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
              <div className="text-center text-gray-500">
                <p className="text-lg font-medium">Image Editor Removed</p>
                <p className="text-sm">Image editing functionality has been removed from the application.</p>
              </div>
            </div>
          </div>
        </main>
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

export default Design;
