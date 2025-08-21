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
import { PixieEditor } from '@/components/image-editor';
import { useTemplateImage } from '@/hooks/use-template-image';


function EditTemplate() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchingTemplate, setFetchingTemplate] = useState(false);
  const [imageUrl, setImageUrl] = useState(''); // Will be set from template or upload
  const [uploadedImageFile, setUploadedImageFile] = useState(null); // Store uploaded file for later saving
  const [uploadedImagePath, setUploadedImagePath] = useState(''); // Store uploaded image path
  const [templateImagePath, setTemplateImagePath] = useState(''); // Store template image path
  
  // Template image operations
  const { 
    getTemplateImage, 
    saveTemplateImage, 
    uploadTemplateImage, 
    loading: imageLoading, 
    error: imageError 
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

  // Pixie editor handlers
  const handleSave = async (editedImageData) => {
    try {
      setIsLoading(true);
      
      // Store the edited image data temporarily, don't upload to S3 yet
      // The image will be uploaded when the template is saved
      setFormData((prev) => ({
        ...prev,
        htmlContent: editedImageData.html || '',
        content: editedImageData.content || [],
        backgroundStyle: editedImageData.backgroundStyle || {},
        editedImageData: editedImageData, // Store for later upload
      }));

      showCustomToast('Image changes saved locally. Click "Save Template" to update the image in S3.', 'success');
    } catch (error) {
      console.error('Error saving image:', error);
      showCustomToast('Failed to save image changes', 'error');
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
      setUploadedImageFile(file);
      
      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
    } catch (error) {
      console.error('Error handling image:', error);
      showCustomToast(`Failed to process image: ${error.message}`, 'error');
    }
  };

  // Get CSS background value for styling
  const getBackgroundStyle = (value) => {
    if (!value) return {};
    
    // Check if it's a URL
    if (value.startsWith('http') || value.startsWith('/')) {
      return { backgroundImage: `url(${value})`, backgroundSize: 'cover', backgroundPosition: 'center' };
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
          content: template.content || [],
          backgroundStyle: template.backgroundStyle || {},
          htmlContent: template.htmlContent || '',
        });

        // Set image URL if template has one
        if (template.imagePath) {
          try {
            // Get the full S3 URL for the template image
            const imageData = await getTemplateImage(templateId);
            setImageUrl(imageData.imageUrl);
            setTemplateImagePath(template.imagePath);
          } catch (err) {
            console.log('No image found for template or failed to load');
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

      // Handle image upload/update logic
      let finalImagePath = templateImagePath;

      // Handle edited image from Pixie if there are changes
      if (formData.editedImageData) {
        try {
          const result = await saveTemplateImage(templateId, formData.editedImageData);
          finalImagePath = result.imagePath;
          setTemplateImagePath(result.imagePath);
          // Clear the edited image data
          setFormData((prev) => {
            const { editedImageData, ...rest } = prev;
            return rest;
          });
          
          showCustomToast(`Template image updated! ${result.oldImageDeleted ? 'Old image replaced.' : ''}`, 'success');
        } catch (error) {
          console.error('Failed to save edited image:', error);
          throw new Error('Failed to save edited image to S3');
        }
      }

      // If there's a new uploaded file, handle it
      if (uploadedImageFile) {
        try {
          // Check if template already has an imagePath
          if (templateImagePath) {
            // Update existing image in S3
            const result = await uploadTemplateImage(templateId, uploadedImageFile);
            finalImagePath = result.imagePath;
            setTemplateImagePath(result.imagePath);
            showCustomToast('Template image updated in S3!', 'success');
          } else {
            // Add new image to S3
            const result = await uploadTemplateImage(templateId, uploadedImageFile);
            finalImagePath = result.imagePath;
            setTemplateImagePath(result.imagePath);
            showCustomToast('New image added to S3!', 'success');
          }
          
          // Clear the uploaded file
          setUploadedImageFile(null);
        } catch (error) {
          console.error('Failed to upload/update image:', error);
          throw new Error('Failed to upload image to S3');
        }
      }

      // Skip image refresh for now since S3 is not publicly accessible
      // The image will be updated when there are actual changes
      if (templateImagePath && !formData.editedImageData && !uploadedImageFile) {
        console.log('📁 Using existing image path:', templateImagePath);
        finalImagePath = templateImagePath;
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
        content: formData.content,
        backgroundStyle: formData.backgroundStyle,
        htmlContent: formData.htmlContent || null,
        imagePath: finalImagePath,
        previewImageUrl: finalImagePath,
      };

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
        successMessage = 'Template updated successfully';
      } else {
        // Create new template
        response = await apiFetch('/api/template/create-template', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(templateData),
        });
        successMessage = 'Template created successfully';
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save template');
      }

      const result = await response.json();

      if (result.success) {
        showCustomToast(successMessage, 'success');
        router.push('/templates');
      } else {
        throw new Error(result.error || 'Failed to save template');
      }
    } catch (err) {
      console.error('Error saving template:', err);
      setError(err.message);
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
            <TabsContent value="security">
              <div className="py-3">
                {/* Upload Image Section */}
                <div className="mb-6">
                  <Label className="text-muted-foreground mb-2 block">Upload New Image</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
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
                      className={`cursor-pointer flex flex-col items-center ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <span className="text-sm text-gray-600">Uploading...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-sm text-gray-600">
                            Click to upload new image
                          </span>
                          <span className="text-xs text-gray-500 mt-1">
                            PNG, JPG, GIF up to 5MB (uploads immediately to S3)
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                {/* Current Image Section */}
                {(templateImagePath || imageUrl) && (
                  <div className="mb-4">
                    <Label className="text-muted-foreground mb-2 block">
                      Current Template Image
                    </Label>
                    <div className="relative">
                      <img
                        src={imageUrl || templateImagePath}
                        alt="Template Image"
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          // console.error('Image failed to load:', e.target.src);
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
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all rounded-lg flex items-center justify-center">
                        <span className="text-white text-xs font-medium opacity-0 hover:opacity-100">
                          Current Template Image
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      This is the current template image stored in S3. Upload a new image to replace it, or edit with Pixie.
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-500">
                  {templateImagePath 
                    ? 'Template image loaded from S3. Edit with Pixie or upload a new image to replace it.'
                    : 'Upload an image to get started. Images are stored in S3 with unique paths.'
                  }
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </aside>
        <main 
          className="flex-1 overflow-auto p-8"
          style={getBackgroundStyle(formData.pageBackground)}
        >
          <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Image Editor</h1>
              <p className="text-gray-600">
                Edit your image using the powerful Pixie editor
              </p>
            </div>

            <div 
              className="rounded-lg shadow-sm border border-gray-200 p-6"
              style={getBackgroundStyle(formData.background)}
            >
              <PixieEditor
                initialImageUrl={imageUrl}
                initialContent={formData.content}
                initialBackgroundStyle={formData.backgroundStyle}
                onSave={handleSave}
                height="700px"
                config={{
                  // Additional Pixie configuration options
                  ui: {
                    // Customize the UI as needed
                  }
                }}
              />
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
