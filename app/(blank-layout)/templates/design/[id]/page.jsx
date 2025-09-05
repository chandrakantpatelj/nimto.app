'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { getProxiedImageUrl, isExternalImageUrl } from '@/lib/image-proxy';
import { useTemplateImage } from '@/hooks/use-template-image';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showCustomToast } from '@/components/common/custom-toast';
import { PixieEditor } from '@/components/image-editor';
import { TemplateHeader } from '../../../events/components';

function EditTemplate() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingTemplate, setFetchingTemplate] = useState(false);
  const [imageUrl, setImageUrl] = useState(''); // Will be set from template or upload
  const [templateImageLoading, setTemplateImageLoading] = useState(false); // Track template image loading state
  const [uploadedImageFile, setUploadedImageFile] = useState(null); // Store uploaded file for later saving
  const [uploadedImagePath, setUploadedImagePath] = useState(''); // Store uploaded image path
  const [templateImagePath, setTemplateImagePath] = useState(''); // Store template image path
  const [pixieDataCaptured, setPixieDataCaptured] = useState(false); // Track if Pixie data has been captured
  const [pixieEditorReady, setPixieEditorReady] = useState(false); // Track if Pixie editor is ready
  const latestUserEditsRef = useRef(null); // Track the latest user edits for testing
  const pixieSaveFunctionRef = useRef(null); // Store the Pixie save function

  // Template image operations
  const {
    getTemplateImage,
    saveTemplateImage,
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
    background: '#FFFFFF', // Default white canvas background
    pageBackground: '#e2e8f0', // Default light gray page background
    content: [], // This will be populated from the canvas
    backgroundStyle: {}, // This will be populated from the canvas
    htmlContent: '', // This will be populated from the canvas
  });

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

  // Extract only user edits from Pixie data
  const extractUserEdits = (data) => {
    if (!data) return null;

    let parsedData = data;
    if (typeof data === 'string') {
      try {
        parsedData = JSON.parse(data);
      } catch (e) {
        console.error('Failed to parse data:', e);
        return null;
      }
    }

    // Return the complete data structure as-is
    // This includes all user modifications: filters, text, drawings, stickers, frames, etc.
    return {
      // Complete Pixie state
      // pixieState: parsedData,

      // Canvas data with all objects
      canvas: parsedData.canvas || null,

      // Editor state
      editor: parsedData.editor || null,

      // Individual components for easy access
      // objects: parsedData.canvas?.objects || [],
      // filters: parsedData.filters || null,
      // globalFilters: parsedData.globalFilters || null,
      // imageFilters: parsedData.imageFilters || null,
      // filteredObjects: parsedData.filteredObjects || null,

      // Metadata
      timestamp: parsedData.timestamp || new Date().toISOString(),
      version: parsedData.version || '1.0',

      // Exported image
      // exportedImage: parsedData.exportedImage || null,

      // HTML content if available
      // htmlContent: parsedData.html || null
    };
  };

  // Pixie editor handlers
  const handleSave = async (editedImageData) => {
    try {
      setIsLoading(true);

      // Debug: Log the full edited image data to see all modifications
      console.log('Complete Pixie data:', editedImageData);

      // Extract all user edits and modifications
      const userEdits = extractUserEdits(editedImageData);

      // Debug: Log the extracted user edits
      console.log('Extracted complete user edits:', userEdits);

      // Store the latest user edits in ref for testing
      latestUserEditsRef.current = userEdits;

      // Store the complete data in the content field
      setFormData((prev) => {
        const newFormData = {
          ...prev,
          content: userEdits, // Store complete data
          htmlContent: editedImageData.html || '',
          background: editedImageData.background || prev.background,
          pageBackground: editedImageData.pageBackground || prev.pageBackground,
        };

        // Update local storage with complete data
        localStorage.setItem('templateFormData', JSON.stringify(newFormData));

        return newFormData;
      });

      // Show success message
      showCustomToast('Template saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving template:', error);
      showCustomToast('Failed to save template', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Handle cancel action - could navigate back or reset
    router.back();
  };

  // Handle background changes
  const handleBackgroundChange = (type, value) => {
    setFormData((prev) => ({
      ...prev,
      [type]: value,
    }));

    // Apply background changes to Pixie editor if available
    if (window.pixieEditor && window.pixieEditor.applyBackground) {
      window.pixieEditor.applyBackground(type, value);
    }
  };

  // Handle Pixie editor ready
  const handlePixieEditorReady = (saveFunction) => {
    // Store the save function for later use
  };

  // Fallback to mark editor as ready after a timeout
  useEffect(() => {
    if (imageUrl && !pixieEditorReady) {
      const timeout = setTimeout(() => {
        setPixieEditorReady(true);
      }, 5000); // 5 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [imageUrl, pixieEditorReady]);

  // Handle image upload - store file for later upload on form submit
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
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
    } catch (error) {
      showCustomToast(`Failed to process image: ${error.message}`, 'error');
    }
  };

  // Get CSS background value for styling
  const getBackgroundStyle = (value) => {
    if (!value) return {};

    // Check if it's a URL
    if (value.startsWith('http') || value.startsWith('/')) {
      return {
        backgroundImage: `url(${value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      };
    }

    // Check if it's a gradient
    if (value.includes('gradient')) {
      return { background: value };
    }

    // Default to color
    return { backgroundColor: value };
  };

  // Fetch template data
  const fetchTemplateData = async () => {
    if (!templateId || templateId === 'new') {
      return; // Don't fetch for new templates
    }

    try {
      setFetchingTemplate(true);
      setError(null);

      const response = await apiFetch(`/api/template/${templateId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch template');
      }

      const result = await response.json();

      if (result.success && result.data) {
        const template = result.data;

        // Prefill form with template data
        setFormData({
          name: template.name || '',
          category: template.category || '',
          isPremium: template.isPremium || false,
          price: template.price || 0,
          background: template.background || '',
          pageBackground: template.pageBackground || '',
          content: template.content || [], // This contains the saved Pixie user edits
          backgroundStyle: template.backgroundStyle || {},
          htmlContent: template.htmlContent || '',
        });

        // Log the retrieved Pixie data
        if (template.content) {
          // Show toast notification about loading saved edits
        }

        // Set image URL if template has one
        if (template.imagePath) {
          try {
            setTemplateImageLoading(true);
            // Get the full S3 URL for the template image
            const imageData = await getTemplateImage(templateId);
            const originalUrl = imageData.imageUrl;

            // Use proxied URL for external images to avoid CORS issues
            if (isExternalImageUrl(originalUrl)) {
              const proxiedUrl = getProxiedImageUrl(originalUrl);
              setImageUrl(proxiedUrl);
            } else {
              setImageUrl(originalUrl);
            }

            setTemplateImagePath(template.imagePath);
          } catch (err) {
            console.error('❌ Failed to load template image:', err);
            // Try to construct the URL manually as fallback
            try {
              const fallbackUrl = `https://nimptotemplatebucket.s3.ap-southeast-2.amazonaws.com/nimptotemplatebucket/${template.imagePath}`;
              // Use proxied URL for the fallback as well
              const proxiedFallbackUrl = getProxiedImageUrl(fallbackUrl);
              setImageUrl(proxiedFallbackUrl);
              setTemplateImagePath(template.imagePath);
            } catch (fallbackErr) {
              console.error('❌ Fallback URL also failed:', fallbackErr);
            }
          } finally {
            setTemplateImageLoading(false);
          }
        }
      } else {
        throw new Error(result.error || 'Failed to load template');
      }
    } catch (err) {
      console.error('Error fetching template:', err);
      setError(err.message);
      showCustomToast('Failed to load template', 'error');
    } finally {
      setFetchingTemplate(false);
    }
  };

  // Load template data on component mount
  useEffect(() => {
    fetchTemplateData();
  }, [templateId]);

  // Save template function
  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      setError(null);
      let userEdits = {};
      const saveFunction =
        pixieSaveFunctionRef.current || window.pixieSaveFunction;

      if (saveFunction) {
        const success = await saveFunction();
        if (success) {
          const latestUserEdits = latestUserEditsRef.current;
          console.log('latestUserEdits', latestUserEdits);
          userEdits = extractUserEdits(latestUserEdits);
        }
      }

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
        content: userEdits, // This will store the optimized Pixie JSON data in jsonContent field
        backgroundStyle: formData.backgroundStyle,
        htmlContent: formData.htmlContent || null,
        imagePath: templateImagePath,
      };

      // SAVE TO DATABASE: Actual save functionality
      let response;
      let successMessage;

      if (templateId && templateId !== 'new') {
        // Update existing template
        response = await apiFetch(`/api/template/${templateId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
        });
        successMessage = 'Template updated successfully with Pixie edits';
      } else {
        // Create new template
        response = await apiFetch('/api/template/create-template', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
        });
        successMessage = 'Template created successfully with Pixie edits';
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save template');
      }

      const result = await response.json();

      if (result.success) {
        // Upload image if there's a new uploaded file
        if (uploadedImageFile) {
          const savedTemplateId = result.data?.id || templateId;
          await uploadTemplateImage(savedTemplateId, uploadedImageFile);
        }

        showCustomToast(successMessage, 'success');

        // Navigate back to templates list
        router.push('/templates');
      } else {
        throw new Error(result.error || 'Failed to save template');
      }
    } catch (err) {
      console.error('Error in save template function:', err);
      setError(err.message);
      showCustomToast(err.message || 'Failed to save template', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching template data
  if (fetchingTemplate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-700">Loading template...</div>
        </div>
      </div>
    );
  }

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
                onChange={(e) => handleInputChange('category', e.target.value)}
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
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            {/* Upload Image Section */}
            <div className="w-full mb-5">
              <Label className="text-muted-foreground mb-2 block">
                Template Image
              </Label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={loading}
              />
              <label
                htmlFor="image-upload"
                className={`inline-flex items-center px-4 py-2 border border-blue-300 rounded-md shadow-sm text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    Upload Image
                  </>
                )}
              </label>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>

            {/* Current Image Preview */}
            {(templateImagePath || imageUrl) && (
              <div className="w-full mb-5">
                <Label className="text-muted-foreground mb-2 block">
                  Current Image
                </Label>
                <div className="relative">
                  <img
                    src={imageUrl || templateImagePath}
                    alt="Template Image"
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center"
                    style={{ display: 'none' }}
                  >
                    <span className="text-gray-500 text-xs">
                      Image failed to load
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>
        <main
          className="flex-1 overflow-auto p-8"
          style={getBackgroundStyle(formData.pageBackground)}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Image Editor
              </h1>
              <p className="text-gray-600">
                Edit your image using the powerful Pixie editor
              </p>
            </div>

            <div
              className="rounded-lg shadow-sm border border-gray-200 p-6"
              style={getBackgroundStyle(formData.background)}
            >
              {templateImageLoading ? (
                <div className="flex items-center justify-center h-[700px] bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
                  <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-700">
                        Loading Template Image
                      </h3>
                      <p className="text-sm text-gray-500">
                        Fetching image from S3...
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <PixieEditor
                  initialImageUrl={imageUrl}
                  initialContent={formData.content} // Pass the saved Pixie user edits
                  onSave={handleSave}
                  onEditorReady={handlePixieEditorReady}
                  height="700px"
                  config={{
                    // Additional Pixie configuration options
                    ui: {
                      // Customize the UI as needed
                    },
                    // Enable external image support
                    allowExternalImages: true,
                    cors: {
                      allowExternalImages: true,
                      allowCrossOrigin: true,
                      allowCredentials: true,
                    },
                    export: {
                      allowExternalImages: true,
                      ignoreExternalImageErrors: true,
                      format: 'png',
                      quality: 1,
                    },
                    tools: {
                      crop: {
                        allowExternalImages: true,
                        ignoreExternalImageErrors: true,
                      },
                    },
                  }}
                />
              )}
            </div>

            {isLoading && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-gray-700">Saving image...</div>
                </div>
              </div>
            )}
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
                    handleBackgroundChange('background', e.target.value)
                  }
                  placeholder="e.g., #ffffff, linear-gradient(...), or image URL"
                />
                {/* Background preview */}
                <div
                  className="w-full h-8 mt-2 rounded border"
                  style={getBackgroundStyle(formData.background)}
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
                    handleBackgroundChange('pageBackground', e.target.value)
                  }
                  placeholder="e.g., #ffffff, linear-gradient(...), or image URL"
                />
                {/* Background preview */}
                <div
                  className="w-full h-8 mt-2 rounded border"
                  style={getBackgroundStyle(formData.pageBackground)}
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
