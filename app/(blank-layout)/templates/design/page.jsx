'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useTemplateImage } from '@/hooks/use-template-image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { showCustomToast } from '@/components/common/custom-toast';
import PixieEditor from '@/components/image-editor/PixieEditor';

function Design() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const pixieEditorRef = useRef(null);
  const sidebarRef = useRef(null);

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

  // Handle image selection from Pixie dialog
  const handleImageSelect = (file) => {
    try {
      // Validate file
      if (!file.type.startsWith('image/')) {
        showCustomToast('Please select a valid image file', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        showCustomToast('Image size should be less than 5MB', 'error');
        return;
      }

      // Store the file in local state
      setUploadedImageFile(file);

      // Create preview URL
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);

      showCustomToast('Image selected successfully!', 'success');
    } catch (error) {
      showCustomToast('Failed to process selected image', 'error');
    }
  };

  // Manually trigger the image dialog
  const handleShowImageDialog = () => {
    if (pixieEditorRef?.current?.showImageDialog) {
      pixieEditorRef.current.showImageDialog();
    } else {
      showCustomToast('Editor not ready. Please try again.', 'error');
    }
  };

  // Handle click outside sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
            showCustomToast(
              'Template created but image upload failed',
              'warning',
            );
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
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col overflow-hidden">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-white/90 backdrop-blur-md border-b border-white/20 shadow-lg">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="bg-white/90 backdrop-blur-md border-white/20 shadow-lg hover:bg-white/95"
        >
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
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Back
        </Button>

        <Button
          onClick={handleSaveTemplate}
          disabled={loading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Save Template
            </>
          )}
        </Button>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Collapsible Sidebar - starts below header */}
        <div
          ref={sidebarRef}
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transition-all duration-300 ease-in-out ${
            sidebarExpanded ? 'w-80' : 'w-12'
          }`}
          onMouseEnter={() => setSidebarExpanded(true)}
        >
          {/* Vertical Line Indicator */}
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-500"></div>

          {/* Sidebar Content */}
          <div className="h-full bg-white/95 backdrop-blur-md border-r border-white/20 shadow-xl">
            {sidebarExpanded && (
              <div className="p-4 h-full overflow-y-auto">
                <div className="space-y-4">
                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-red-500 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <p className="text-red-700 text-sm font-medium">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Design Assets
                      </h3>
                    </div>

                    <Button
                      onClick={handleShowImageDialog}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                    >
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      Add Image
                    </Button>
                  </div>

                  {/* Template Details */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-800">
                        Template Details
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium text-slate-700 mb-1 block">
                          Template Name
                        </Label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={handleTemplateNameChange}
                          placeholder="Enter template name"
                          className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-slate-700 mb-1 block">
                          Category
                        </Label>
                        <Input
                          type="text"
                          value={formData.category}
                          onChange={(e) =>
                            handleInputChange('category', e.target.value)
                          }
                          placeholder="e.g., Birthday, Corporate, Wedding"
                          className="rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-slate-700 mb-2 block">
                          Type
                        </Label>
                        <RadioGroup
                          value={formData.isPremium ? 'premium' : 'free'}
                          onValueChange={handleTypeChange}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                            <RadioGroupItem
                              value="free"
                              id="free"
                              className="text-green-500"
                            />
                            <Label
                              htmlFor="free"
                              className="flex items-center space-x-2 cursor-pointer text-sm"
                            >
                              <div className="w-4 h-4 bg-green-100 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-2 h-2 text-green-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                              <span className="text-slate-700">Free</span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                            <RadioGroupItem
                              value="premium"
                              id="premium"
                              className="text-amber-500"
                            />
                            <Label
                              htmlFor="premium"
                              className="flex items-center space-x-2 cursor-pointer text-sm"
                            >
                              <div className="w-4 h-4 bg-amber-100 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-2 h-2 text-amber-600"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                              <span className="text-slate-700">Premium</span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {formData.isPremium && (
                        <div>
                          <Label className="text-xs font-medium text-slate-700 mb-1 block">
                            Price (USD)
                          </Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500 text-sm">$</span>
                            </div>
                            <Input
                              type="number"
                              value={formData.price}
                              onChange={(e) =>
                                handleInputChange('price', e.target.value)
                              }
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="pl-8 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Indicator */}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
          <div className="w-[1000px] h-[600px] bg-white/70 backdrop-blur-sm rounded-2xl border shadow-xl overflow-hidden">
            <PixieEditor
              ref={pixieEditorRef}
              initialImageUrl={imageUrl}
              initialContent={canvasState}
              onSave={handleCanvasSave}
              width="1000px"
              height="600px"
              onImageUpload={handleImageUpload}
              onImageSelect={handleImageSelect}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Design;
