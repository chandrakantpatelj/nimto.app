'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Moon, Plus, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useToast } from '@/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import AdvancedProcessingLoader from '@/components/common/advanced-processing-loader';
import PixieEditor from '@/components/image-editor/PixieEditor';
import { CategoryForm } from '@/app/(protected)/templates/categories/components/CategoryForm';

const TemplateDesignLayout = ({
  initialFormData = null,
  onSave,
  loading = false,
  error = null,
  headerButtonText = 'Save Template',
}) => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { toastSuccess, toastError } = useToast();
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [internalLoading, setInternalLoading] = useState(false);
  const pixieEditorRef = useRef(null);

  // Toggle sidebar function
  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  // Auto-collapse sidebar on mobile for better UX
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarExpanded(false);
      } else {
        setSidebarExpanded(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Call once on mount

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Category state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);

  // Fetch template categories
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch('/api/template-categories');
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
      } else {
        toastError('Failed to load categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toastError('Failed to load categories');
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [toastError]);

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

  // Handle category form close
  const handleCategoryFormClose = () => {
    setShowCategoryForm(false);
  };

  // Handle category creation success
  const handleCategoryFormSuccess = () => {
    setShowCategoryForm(false);
    fetchCategories(); // Refresh the categories list
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
      {/* Advanced Loading Overlay */}
      <AdvancedProcessingLoader
        isVisible={loading || internalLoading}
        title={
          headerButtonText === 'Create Template'
            ? 'Creating Template'
            : 'Updating Template'
        }
        description="Please wait while we process your template..."
        tasks={[
          { icon: '✨', text: 'Processing template data...' },
          { icon: '🎨', text: 'Optimizing image assets...' },
          { icon: '💾', text: 'Saving to database...' },
        ]}
      />
      {/* Fixed Header - Mobile Responsive */}
      <div className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-2 py-2 sm:px-4 sm:py-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-white/20 dark:border-slate-700/20 shadow-lg h-12 sm:h-14">
        <div className="flex items-center gap-2">
          {/* Mobile Menu Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleSidebar}
            className="md:hidden bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-white/20 dark:border-slate-700/20 shadow-lg hover:bg-white/95 dark:hover:bg-slate-800/95 text-slate-700 dark:text-slate-300 h-8 w-8 p-0"
            title="Toggle menu"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-white/20 dark:border-slate-700/20 shadow-lg hover:bg-white/95 dark:hover:bg-slate-800/95 text-slate-700 dark:text-slate-300 h-8 px-2 sm:px-3"
          >
            <svg
              className="w-4 h-4 sm:mr-2"
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
            <span className="hidden sm:inline">Back</span>
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
            className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-white/20 dark:border-slate-700/20 shadow-lg hover:bg-white/95 dark:hover:bg-slate-800/95 text-slate-700 dark:text-slate-300 h-8 w-8 p-0"
            title={
              theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
            }
          >
            {theme === 'dark' ? (
              <Sun className="w-3 h-3 sm:w-4 sm:h-4" />
            ) : (
              <Moon className="w-3 h-3 sm:w-4 sm:h-4" />
            )}
          </Button>

          <Button
            onClick={handleSaveTemplate}
            disabled={loading || internalLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-2 py-1.5 sm:px-4 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed h-8 text-xs sm:text-sm"
          >
            <svg
              className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2"
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
            <span className="hidden sm:inline">{headerButtonText}</span>
            <span className="sm:hidden">Save</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 pt-12 sm:pt-14">
        {/* Mobile Backdrop Overlay */}
        {sidebarExpanded && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={toggleSidebar}
            style={{ top: '3rem' }}
          />
        )}

        {/* Collapsible Sidebar - Responsive */}
        <div
          className={`
            fixed left-0 bottom-0 z-40 transition-all duration-300 ease-in-out
            ${sidebarExpanded ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0
            ${sidebarExpanded ? 'w-80' : 'md:w-20'}
            top-12 sm:top-14
          `}
        >
          {/* Vertical Line Indicator */}
          <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-500 to-indigo-500"></div>

          {/* Toggle Button - Desktop Only */}
          <button
            onClick={toggleSidebar}
            className={`
              hidden md:block absolute top-4 z-50 p-2 rounded-lg 
              bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-800 
              shadow-lg border border-slate-200 dark:border-slate-700 transition-all duration-200
              ${sidebarExpanded ? 'right-4' : 'right-3'}
            `}
            title={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
            aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
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
          <div className="h-full w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-white/20 dark:border-slate-700/20 shadow-xl flex flex-col">
            {sidebarExpanded ? (
              <div className="flex flex-col h-full">
                {/* Mobile Close Button */}
                <div className="md:hidden flex justify-between items-center p-3 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                    Template Settings
                  </h3>
                  <button
                    onClick={toggleSidebar}
                    className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <svg
                      className="w-5 h-5 text-slate-600 dark:text-slate-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                <div className="p-3 sm:p-4 flex-1 overflow-y-auto">
                  <div className="space-y-3 sm:space-y-4">
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
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-white"
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
                        <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                          Design Assets
                        </h3>
                      </div>

                      <Button
                        onClick={() =>
                          document
                            .getElementById('replace-image-upload')
                            ?.click()
                        }
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg py-2.5 sm:py-2 text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-200 min-h-[44px] sm:min-h-0"
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
                        <div className="w-6 h-6 sm:w-7 sm:h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                          <svg
                            className="w-3 h-3 sm:w-4 sm:h-4 text-white"
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
                        <h3 className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200">
                          Template Details
                        </h3>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                            Template Name
                          </Label>
                          <Input
                            type="text"
                            value={formData.name}
                            onChange={handleTemplateNameChange}
                            placeholder="Enter template name"
                            className="rounded-lg border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 h-11 sm:h-10"
                          />
                        </div>

                        <div>
                          <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
                            Category
                          </Label>
                          <Select
                            value={formData.category}
                            onValueChange={(value) => {
                              if (value === '__add_category__') {
                                setShowCategoryForm(true);
                              } else {
                                handleInputChange('category', value);
                              }
                            }}
                            disabled={categoriesLoading}
                          >
                            <SelectTrigger className="rounded-lg border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 h-11 sm:h-10">
                              <SelectValue
                                placeholder={
                                  categoriesLoading
                                    ? 'Loading categories...'
                                    : 'Select a category'
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem
                                  key={category.id}
                                  value={category.slug}
                                >
                                  {category.name}
                                </SelectItem>
                              ))}
                              <SelectItem
                                value="__add_category__"
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                              >
                                <div className="flex items-center gap-2">
                                  <Plus className="h-4 w-4" />
                                  Add Category
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
                            Type
                          </Label>
                          <RadioGroup
                            value={formData.isPremium ? 'premium' : 'free'}
                            onValueChange={handleTypeChange}
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2 p-3 sm:p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[44px] sm:min-h-0">
                              <RadioGroupItem
                                value="free"
                                id="free"
                                className="text-green-500 w-5 h-5 sm:w-4 sm:h-4"
                              />
                              <Label
                                htmlFor="free"
                                className="flex items-center space-x-2 cursor-pointer text-sm flex-1"
                              >
                                <div className="w-5 h-5 sm:w-4 sm:h-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 sm:w-2 sm:h-2 text-green-600 dark:text-green-400"
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
                            <div className="flex items-center space-x-2 p-3 sm:p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors min-h-[44px] sm:min-h-0">
                              <RadioGroupItem
                                value="premium"
                                id="premium"
                                className="text-amber-500 w-5 h-5 sm:w-4 sm:h-4"
                              />
                              <Label
                                htmlFor="premium"
                                className="flex items-center space-x-2 cursor-pointer text-sm flex-1"
                              >
                                <div className="w-5 h-5 sm:w-4 sm:h-4 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                                  <svg
                                    className="w-3 h-3 sm:w-2 sm:h-2 text-amber-600 dark:text-amber-400"
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
                            <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">
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
                                className="pl-8 rounded-lg border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500/20 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 h-11 sm:h-10"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Collapsed Sidebar Content - Desktop Only */
              <div className="hidden md:flex h-full flex-col items-center justify-start space-y-4 p-2 pt-16">
                {/* Design Assets Icon */}
                <button
                  className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 border-0"
                  title="Design Assets"
                  onClick={toggleSidebar}
                  aria-label="Open Design Assets"
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
                </button>

                {/* Template Details Icon */}
                <button
                  className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 border-0"
                  title="Template Details"
                  onClick={toggleSidebar}
                  aria-label="Open Template Details"
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
                </button>

                {/* Type/Text Icon */}
                <button
                  className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center cursor-pointer hover:scale-110 transition-transform duration-200 border-0"
                  title="Type/Text"
                  onClick={toggleSidebar}
                  aria-label="Open Type/Text Settings"
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
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area - Mobile Responsive */}
        <div
          className={`
            flex-1 transition-all duration-300 
            ml-0 
            ${sidebarExpanded ? 'md:ml-80' : 'md:ml-20'}
          `}
        >
          <div className="w-full h-[calc(100vh-3rem)] sm:h-[calc(100vh-3.5rem)] overflow-hidden relative">
            {!imageUrl && !formData?.s3ImageUrl ? (
              /* Empty State - No Image - Mobile Optimized */
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 p-4 sm:p-6">
                <div className="text-center space-y-3 sm:space-y-4 max-w-md">
                  {/* Upload Icon */}
                  <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                    <svg
                      className="w-6 h-6 sm:w-8 sm:h-8 text-white"
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
                  <div className="space-y-1 sm:space-y-2">
                    <h3 className="text-base sm:text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-200">
                      Start Your Design
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mx-auto px-2">
                      Upload an image or start with a blank canvas to create
                      your template
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 sm:gap-3 justify-center px-2">
                    <button
                      onClick={() =>
                        document.getElementById('image-upload')?.click()
                      }
                      className="flex items-center justify-center px-4 py-2.5 sm:px-5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 text-xs sm:text-sm font-medium"
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
                      Upload Image
                    </button>
                  </div>

                  {/* Tips */}
                  <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 px-2 hidden sm:block">
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
              /* Pixie Editor with Image - Mobile Responsive */
              <PixieEditor
                ref={pixieEditorRef}
                initialImageUrl={imageUrl || formData?.s3ImageUrl}
                initialContent={formData?.jsonContent}
                width="100%"
                height="100%"
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

      {/* Category Form Modal */}
      {showCategoryForm && (
        <CategoryForm
          category={null}
          onClose={handleCategoryFormClose}
          onSuccess={handleCategoryFormSuccess}
        />
      )}
    </div>
  );
};

export default TemplateDesignLayout;
