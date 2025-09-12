'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { showCustomToast } from '@/components/common/custom-toast';
import PixieEditor from '@/components/image-editor/PixieEditor';
import { Moon, Sun } from 'lucide-react';

const TemplateDesignLayout = ({
  initialFormData = null,
  onSave,
  loading = false,
  error = null,
  headerButtonText = 'Save Template',
}) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
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
      background: '',
      pageBackground: '',
      content: [],
      backgroundStyle: {},
      htmlContent: '',
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
      showCustomToast('No file selected', 'error');
      return false;
    }
    if (!file.type.startsWith('image/')) {
      showCustomToast('Please select a valid image file', 'error');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      showCustomToast('Image size should be less than 5MB', 'error');
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
      showCustomToast('Image selected successfully!', 'success');
    } catch (error) {
      showCustomToast('Failed to process selected image', 'error');
    }
  };

  // Handle image replacement while preserving content
  const handleReplaceImage = (file) => {
    if (!pixieEditorRef?.current?.replaceImage) {
      showCustomToast('Editor not ready. Please try again.', 'error');
      return;
    }

    if (!validateImageFile(file)) return;

    try {
      const previewUrl = URL.createObjectURL(file);
      setImageUrl(previewUrl);
      setUploadedImageFile(file);
      pixieEditorRef.current.replaceImage(previewUrl);
      showCustomToast('Image replaced successfully!', 'success');
    } catch (error) {
      showCustomToast('Failed to replace image', 'error');
    }
  };

  // Handle save - call the parent's onSave function
  const handleSaveTemplate = async () => {
    try {
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Template name is required');
      }
      if (!formData.category.trim()) {
        throw new Error('Category is required');
      }

      const pixieState = JSON.parse(await pixieEditorRef.current.save());

      // Prepare the data for API
      const templateData = {
        name: formData.name.trim(),
        category: formData.category.trim(),
        isPremium: formData.isPremium,
        price: formData.isPremium ? parseFloat(formData.price) || 0 : 0,
        background: formData.background || null,
        pageBackground: formData.pageBackground || null,
        content: pixieState?.canvas?.objects?.length ? pixieState : [],
        backgroundStyle: formData.backgroundStyle,
        htmlContent: formData.htmlContent || null,
      };

      // Call the parent's save function with template data and uploaded file
      await onSave(templateData, uploadedImageFile);
    } catch (err) {
      showCustomToast(err.message || 'Failed to save template', 'error');
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col overflow-hidden">
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
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
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
                {headerButtonText}
              </>
            )}
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
                              <span className="text-slate-700 dark:text-slate-300">Free</span>
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
                              <span className="text-slate-700 dark:text-slate-300">Premium</span>
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
                              <span className="text-slate-500 dark:text-slate-400 text-sm">$</span>
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
          <div className="w-[1000px] h-[600px] bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden relative">
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

                    <button
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
                    </button>
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
                width="1000px"
                height="600px"
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
