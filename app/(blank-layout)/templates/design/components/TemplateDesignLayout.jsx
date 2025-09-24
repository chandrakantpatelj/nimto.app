'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useToast } from '@/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import PixieEditor from '@/components/image-editor/PixieEditor';

const TemplateDesignLayout = ({
  initialFormData = null,
  onSave,
  loading = false,
  error = null,
  headerButtonText = 'Save Template',
}) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toastSuccess, toastError, toastWarning } = useToast();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [internalLoading, setInternalLoading] = useState(false);
  const pixieEditorRef = useRef(null);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Form state
  const [formData, setFormData] = useState(
    initialFormData || {
      name: '',
      category: '',
      isPremium: false,
      price: 0,
      jsonContent: null,
    },
  );

  // Image state
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImageFile, setUploadedImageFile] = useState(null);

  // Initialize form data when initialFormData changes
  useEffect(() => {
    if (initialFormData) {
      setFormData(initialFormData);
      setImageUrl(initialFormData?.s3ImageUrl || '');
    }
  }, [initialFormData]);

  // Handle form field changes
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle template name change
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

  // Validate image file
  const validateImageFile = (file) => {
    if (!file) {
      toastError('No file selected');
      return false;
    }
    if (!file.type.startsWith('image/')) {
      toastError('Please select a valid image file');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      toastError('Image size should be less than 5MB');
      return false;
    }
    return true;
  };

  // Handle image selection from file input or Pixie dialog
  const handleImageSelect = (fileOrEvent) => {
    try {
      const file = fileOrEvent?.target?.files?.[0] || fileOrEvent;

      if (!validateImageFile(file)) return;

      setUploadedImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
    } catch (error) {
      toastError('Failed to process selected image');
    }
  };

  // Handle image replacement while preserving content
  const handleReplaceImage = (file) => {
    if (!pixieEditorRef?.current?.replaceImage) {
      toastError('Editor not ready. Please try again.');
      return;
    }

    if (!validateImageFile(file)) return;

    try {
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
      setUploadedImageFile(file);
      pixieEditorRef.current.replaceImage(previewUrl);
      toastSuccess('Image replaced successfully!');
    } catch (error) {
      toastError('Failed to replace image');
    }
  };

  // Handle save - create template and upload thumbnail
  const handleSaveTemplate = async () => {
    try {
      // Set internal loading state immediately when button is clicked
      setInternalLoading(true);

      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Template name is required');
      }
      if (!formData.category.trim()) {
        throw new Error('Category is required');
      }

      // Get Pixie state and thumbnail data
      const pixieState = JSON.parse(await pixieEditorRef.current.save());
      const thumbnailData = await pixieEditorRef.current.getThumbnailData();

      // Prepare the data for API
      const templateData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        isPremium: formData.isPremium,
        price: formData.isPremium ? parseFloat(formData.price) || 0 : 0,
        jsonContent: pixieState?.canvas?.objects?.length
          ? JSON.stringify(pixieState)
          : null,
      };

      // Clean up the object URL after a delay to free memory
      if (thumbnailData.objectUrl) {
        setTimeout(() => {
          URL.revokeObjectURL(thumbnailData.objectUrl);
        }, 10000); // 10 seconds delay
      }

      // Call the parent's save function - this will handle the loading state
      await onSave(templateData, uploadedImageFile, thumbnailData);
    } catch (err) {
      toastError(err.message || 'Failed to save template');
    } finally {
      // Reset internal loading state
      setInternalLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col overflow-hidden relative">
      {/* Impressive Loading Overlay */}
      {(loading || internalLoading) && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
        >
          <div
            className="absolute bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-2xl border border-white/30 dark:border-slate-700/30 max-w-xs sm:max-w-sm md:max-w-md w-full mx-4"
            style={{
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'fade-in 0.3s ease-out forwards',
            }}
          >
            <div className="text-center space-y-6 sm:space-y-7 md:space-y-8">
              {/* Animated Logo/Icon */}
              <div className="relative mx-auto w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 rounded-2xl sm:rounded-3xl animate-pulse shadow-lg"></div>
                <div className="absolute inset-2 sm:inset-3 bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner">
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-600 dark:text-purple-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                {/* Spinning Ring */}
                <div className="absolute inset-0 border-3 sm:border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-2xl sm:rounded-3xl animate-spin shadow-lg"></div>
                {/* Outer Glow */}
                <div className="absolute inset-[-3px] sm:inset-[-4px] bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-indigo-600/20 rounded-2xl sm:rounded-3xl blur-sm animate-pulse"></div>
              </div>

              {/* Loading Text */}
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200">
                  {headerButtonText === 'Create Template'
                    ? 'Creating Template'
                    : 'Updating Template'}
                </h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 px-2">
                  Please wait while we process your template...
                </p>
              </div>

              {/* Animated Progress Dots */}
              <div className="flex justify-center space-x-2 sm:space-x-3">
                <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-500 rounded-full animate-bounce shadow-lg"></div>
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded-full animate-bounce shadow-lg"
                  style={{ animationDelay: '0.1s' }}
                ></div>
                <div
                  className="w-3 h-3 sm:w-4 sm:h-4 bg-indigo-500 rounded-full animate-bounce shadow-lg"
                  style={{ animationDelay: '0.2s' }}
                ></div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 sm:h-3 overflow-hidden shadow-inner">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse shadow-lg"></div>
              </div>

              {/* Status Messages */}
              <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 space-y-1 sm:space-y-2">
                <p className="flex items-center justify-center space-x-2">
                  <span className="text-purple-500 text-sm sm:text-base">
                    ✨
                  </span>
                  <span className="truncate">Processing template data...</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <span className="text-blue-500 text-sm sm:text-base">🎨</span>
                  <span className="truncate">Optimizing image assets...</span>
                </p>
                <p className="flex items-center justify-center space-x-2">
                  <span className="text-indigo-500 text-sm sm:text-base">
                    💾
                  </span>
                  <span className="truncate">Saving to database...</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-white/20 dark:border-slate-700/20 shadow-lg">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-white/20 dark:border-slate-700/20 shadow-lg hover:bg-white/95 dark:hover:bg-slate-800/95 text-slate-700 dark:text-slate-300"
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

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-white/20 dark:border-slate-700/20 shadow-lg hover:bg-white/95 dark:hover:bg-slate-800/95 text-slate-700 dark:text-slate-300"
            title={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          <Button
            onClick={handleSaveTemplate}
            disabled={loading || internalLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                d="M5 13l4 4L19 7"
              />
            </svg>
            {headerButtonText}
          </Button>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 pt-16">
        {/* Collapsible Sidebar */}
        <div
          className={`fixed left-0 top-16 h-[calc(100vh-4rem)] z-40 transition-all duration-300 ease-in-out ${
            sidebarExpanded ? 'w-80' : 'w-16'
          }`}
        >
          {/* Vertical Line Indicator */}
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-500"></div>

          {/* Toggle Button */}
          <button
            onClick={toggleSidebar}
            className={`absolute top-4 z-50 p-2 rounded-lg bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200 ${
              sidebarExpanded ? 'right-4' : 'right-3'
            }`}
            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <svg
              className={`w-4 h-4 text-slate-600 dark:text-slate-300 transition-transform duration-200 ${
                sidebarExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Sidebar Content */}
          <div className="h-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-white/20 dark:border-slate-700/20 shadow-xl">
            {sidebarExpanded ? (
              <div className="p-4 h-full overflow-y-auto">
                <div className="space-y-4">
                  {/* Error Display */}
                  {error && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-red-500 dark:text-red-400 mr-2"
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
                        <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                          {error}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Design Assets */}
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
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Design Assets
                      </h3>
                    </div>

                    <Button
                      onClick={() =>
                        document.getElementById('replace-image-upload')?.click()
                      }
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
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Replace Image
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
                      <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Template Details
                      </h3>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                          Template Name
                        </Label>
                        <Input
                          type="text"
                          value={formData.name}
                          onChange={handleTemplateNameChange}
                          placeholder="Enter template name"
                          className="rounded-lg border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                          Category
                        </Label>
                        <Input
                          type="text"
                          value={formData.category}
                          onChange={(e) =>
                            handleInputChange('category', e.target.value)
                          }
                          placeholder="e.g., Birthday, Corporate, Wedding"
                          className="rounded-lg border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      <div>
                        <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                          Type
                        </Label>
                        <RadioGroup
                          value={formData.isPremium ? 'premium' : 'free'}
                          onValueChange={handleTypeChange}
                          className="space-y-2"
                        >
                          <div className="flex items-center space-x-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <RadioGroupItem
                              value="free"
                              id="free"
                              className="text-green-500"
                            />
                            <Label
                              htmlFor="free"
                              className="flex items-center space-x-2 cursor-pointer text-sm"
                            >
                              <div className="w-4 h-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-2 h-2 text-green-600 dark:text-green-400"
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
                              <span className="text-slate-700 dark:text-slate-300">
                                Free
                              </span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2 p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <RadioGroupItem
                              value="premium"
                              id="premium"
                              className="text-amber-500"
                            />
                            <Label
                              htmlFor="premium"
                              className="flex items-center space-x-2 cursor-pointer text-sm"
                            >
                              <div className="w-4 h-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                                <svg
                                  className="w-2 h-2 text-amber-600 dark:text-amber-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              </div>
                              <span className="text-slate-700 dark:text-slate-300">
                                Premium
                              </span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {formData.isPremium && (
                        <div>
                          <Label className="text-xs font-medium text-slate-700 dark:text-slate-300 mb-1 block">
                            Price (USD)
                          </Label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <span className="text-slate-500 dark:text-slate-400 text-sm">
                                $
                              </span>
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
                              className="pl-8 rounded-lg border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Collapsed Sidebar Content */
              <div className="h-full flex flex-col items-center justify-start space-y-4 p-2 pt-20">
                {/* Design Assets Icon */}
                <div
                  className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
                  title="Design Assets"
                >
                  <svg
                    className="w-4 h-4 text-white"
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

                {/* Template Details Icon */}
                <div
                  className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
                  title="Template Details"
                >
                  <svg
                    className="w-4 h-4 text-white"
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

                {/* Type/Text Icon */}
                <div
                  className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200"
                  title="Type/Text"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h7"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div
          className={`flex-1 flex items-center justify-center p-4 overflow-hidden transition-all duration-300 ${
            sidebarExpanded ? 'ml-80' : 'ml-16'
          }`}
        >
          <div className="w-[93vw] h-[92vh] bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden relative">
            {!imageUrl && !formData?.s3ImageUrl ? (
              /* Empty State - No Image */
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                <div className="text-center space-y-6">
                  {/* Upload Icon */}
                  <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg
                      className="w-10 h-10 text-white"
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
                  </div>

                  {/* Text Content */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">
                      Start Your Design
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 max-w-sm">
                      Upload an image or start with a blank canvas to create
                      your template
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() =>
                        document.getElementById('image-upload')?.click()
                      }
                      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg
                        className="w-4 h-4 inline mr-2"
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
                      Upload Image
                    </button>

                    {/* <button
                      onClick={() => {
                        // Start with blank canvas
                        setImageUrl('');
                      }}
                      className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      <svg
                        className="w-4 h-4 inline mr-2"
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
                      Start Blank
                    </button> */}
                  </div>

                  {/* Tips */}
                  <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                    <p>
                      💡 <strong>Tip:</strong> Supported formats: JPG, PNG, GIF
                    </p>
                    <p>
                      🎨 <strong>Tip:</strong> Use the sidebar tools to add
                      text, shapes, and stickers
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Pixie Editor with Image */
              <PixieEditor
                ref={pixieEditorRef}
                initialImageUrl={imageUrl || formData?.s3ImageUrl}
                initialContent={formData?.jsonContent}
                width="93vw"
                height="92vh"
                onImageSelect={handleImageSelect}
              />
            )}

            {/* Hidden File Inputs */}
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <input
              id="replace-image-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleReplaceImage(file);
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDesignLayout;
