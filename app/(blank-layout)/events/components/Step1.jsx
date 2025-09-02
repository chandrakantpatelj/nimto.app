import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import {
  CalendarDays,
  Clock3,
  Info,
  Loader2,
  MapPin,
  User,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DateInput, TimeField } from '@/components/ui/datefield';
import { Input, InputAddon, InputGroup } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { showCustomToast } from '@/components/common/custom-toast';
import PixieEditor from '@/components/image-editor/PixieEditor';
import { useEventCreation } from '../context/EventCreationContext';

function Step1() {
  const params = useParams();
  const templateId = params.id;
  const eventId = params.eventId; // For edit mode
  const { eventData, updateEventData } = useEventCreation();

  const [isLoading, setIsLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [templateImagePath, setTemplateImagePath] = useState('');
  const [newImageBase64, setNewImageBase64] = useState(null); // Store base64 data for new images
  // State flags to prevent multiple API calls and unnecessary re-renders
  const [hasUploadedNewImage, setHasUploadedNewImage] = useState(false); // Track if user uploaded a new image
  const [templateFetched, setTemplateFetched] = useState(false); // Track if template has been fetched
  const [eventDataLoaded, setEventDataLoaded] = useState(false); // Track if event data has been loaded

  // Date picker popover state
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Check if we're in edit mode or create mode
  const isEditMode = !!eventId;

  // Initialize with existing event data if in edit mode
  // This useEffect is optimized to prevent multiple API calls and unnecessary re-renders
  useEffect(() => {
    console.log('eventData', eventData);
    // Handle edit mode
    if (isEditMode && eventData && !eventDataLoaded) {
      setTemplateLoading(false);
      setEventDataLoaded(true);

      // Set the image path from existing event data
      if (eventData.imagePath && !hasUploadedNewImage) {
        setTemplateImagePath(eventData.imagePath);

        // Use the s3ImageUrl that's already provided by the API
        if (eventData.s3ImageUrl) {
          setImageUrl(eventData.s3ImageUrl);
        } else {
          // Fallback: use image proxy API with the image path
          const proxyImageUrl = `/api/image-proxy?path=${encodeURIComponent(eventData.s3ImageUrl)}`;
          setImageUrl(proxyImageUrl);
        }
      } else if (hasUploadedNewImage) {
        // Skipping eventData image setup - new image uploaded
      }

      // Load existing event content into Pixie editor if available
      if (eventData.jsonContent) {
        console.log('eventData.jsonContent', eventData.jsonContent);
        loadEventContentIntoPixie(eventData);
      }
    }
    // Handle create mode - fetch template
    else if (templateId && !isEditMode && !templateFetched) {
      setTemplateFetched(true);
      fetchTemplate();
    }
    // Handle case when no template ID is available
    else if (!templateId && !isEditMode) {
      setTemplateLoading(false);
    }
    // Handle case when template is already fetched but still loading
    else if (templateFetched && templateLoading) {
      setTemplateLoading(false);
    }
  }, [
    isEditMode,
    templateId,
    hasUploadedNewImage,
    templateFetched,
    eventDataLoaded,
  ]);
  // Reset flags when templateId changes
  useEffect(() => {
    setTemplateFetched(false);
    setEventDataLoaded(false);
    setHasUploadedNewImage(false);
  }, [templateId, eventId]);

  // Initial load effect - ensure template is fetched on mount
  useEffect(() => {
    if (templateId && !isEditMode && !templateFetched && !templateLoading) {
      setTemplateFetched(true);
      fetchTemplate();
    }
  }, [templateId, isEditMode, templateFetched, templateLoading]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      setTemplateLoading(false);
      setTemplateFetched(false);
      setEventDataLoaded(false);
    };
  }, []);

  // Fetch template data (only for create mode)
  const fetchTemplate = async () => {
    if (!templateId) {
      return;
    }

    try {
      setTemplateLoading(true);

      const response = await apiFetch(`/api/template/${templateId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch template');
      }

      const result = await response.json();

      if (result.success) {
        const template = result.data;

        // Update form data with template data
        updateEventData({
          templateId: template.id,
          jsonContent: template.jsonContent || '',
          backgroundStyle: template.backgroundStyle
            ? JSON.stringify(template.backgroundStyle)
            : '',
          htmlContent: template.htmlContent || '',
          background: template.background || '#FFFFFF',
          pageBackground: template.pageBackground || '#e2e8f0',
          title: template.name || '',
        });

        // Set template image path if available
        if (template.s3ImageUrl) {
          setTemplateImagePath(template.s3ImageUrl);
          updateEventData({ imagePath: template.imagePath }); // Store the actual S3 path, not the proxy URL
          setImageUrl(template.s3ImageUrl);
        }

        // Load template content into Pixie editor
        loadTemplateIntoPixie(template);

        showCustomToast('Template loaded successfully', 'success');
      } else {
        throw new Error(result.error || 'Failed to fetch template');
      }
    } catch (error) {
      showCustomToast('Failed to load template', 'error');
      // Reset the flag on error so user can retry
      setTemplateFetched(false);
    } finally {
      setTemplateLoading(false);
    }
  };

  // Load template content into Pixie editor
  const loadTemplateIntoPixie = (template) => {
    if (!template?.jsonContent) return;

    try {
      const jsonContent = parseJsonContent(template.jsonContent);
      const hasObjects =
        jsonContent?.canvas &&
        Array.isArray(jsonContent.canvas.objects) &&
        jsonContent.canvas.objects.length > 0;
      if (!hasObjects) return;

      // Initialize Pixie editor with template content
      const trySetState = () => {
        if (window.pixieRef?.current?.setState) {
          try {
            window.pixieRef.current.setState(jsonContent);
          } catch (err) {
            // ignore bad state
          }
        }
      };

      if (window.pixieEditor && window.pixieEditor.loadTemplate) {
        window.pixieEditor.loadTemplate(jsonContent);
      } else {
        setTimeout(trySetState, 1000);
      }
    } catch (error) {
      // Error loading template into Pixie
    }
  };

  // Load existing event content into Pixie editor
  const loadEventContentIntoPixie = (event) => {
    if (!event?.jsonContent) return;

    try {
      const jsonContent = parseJsonContent(event.jsonContent);
      const hasObjects =
        jsonContent?.canvas &&
        Array.isArray(jsonContent.canvas.objects) &&
        jsonContent.canvas.objects.length > 0;
      if (!hasObjects) return;

      // Initialize Pixie editor with existing event content
      const trySetState = () => {
        if (window.pixieRef?.current?.setState) {
          try {
            window.pixieRef.current.setState(jsonContent);
          } catch (err) {
            // ignore bad state
          }
        }
      };

      if (window.pixieEditor && window.pixieEditor.loadTemplate) {
        window.pixieEditor.loadTemplate(jsonContent);
      } else {
        setTimeout(trySetState, 1000);
      }
    } catch (error) {
      // Error loading event content into Pixie
    }
  };

  // Handle background changes
  const handleBackgroundChange = (type, value) => {
    updateEventData({ [type]: value });

    // Apply background changes to Pixie editor if available
    if (window.pixieEditor && window.pixieEditor.applyBackground) {
      window.pixieEditor.applyBackground(type, value);
    }
  };

  // Handle image upload - only load into Pixie, don't save to server yet
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
      setIsLoading(true);

      // Create a temporary URL for the uploaded file
      const tempImageUrl = URL.createObjectURL(file);

      // Convert file to base64 for later use
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64Data = e.target.result;
        setNewImageBase64(base64Data);
        updateEventData({ newImageBase64: base64Data });
      };
      reader.readAsDataURL(file);

      // Store the file for later saving
      setUploadedImageFile(file);

      // Update the image URL to force Pixie editor to reload with new image
      setImageUrl(tempImageUrl);

      // Clear the template image path since we're using a new image
      setTemplateImagePath('');
      setHasUploadedNewImage(true); // Mark that a new image has been uploaded

      showCustomToast(
        'Image loaded successfully. Click "Save Template" to save it permanently.',
        'success',
      );
    } catch (error) {
      showCustomToast('Failed to load image', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to parse JSON content safely
  const parseJsonContent = (content) => {
    if (!content) return null;

    try {
      return typeof content === 'string' ? JSON.parse(content) : content;
    } catch (error) {
      console.error('Error parsing JSON content:', error);
      return null;
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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Full Size Pixie Editor */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">1</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Design Your Event
              </h1>
              <p className="text-sm text-gray-500">
                Customize your event invitation design
              </p>
            </div>
          </div>
        </div>

        {/* Pixie Editor Container */}
        <div className="flex-1 p-6">
          {templateLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600">
                  {isEditMode ? 'Loading event...' : 'Loading template...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full rounded-lg overflow-hidden border border-gray-200 bg-white">
              <PixieEditor
                key={`pixie-${templateId || eventId}-${hasUploadedNewImage}`} // Use templateId/eventId instead of imageUrl to prevent unnecessary re-renders
                initialImageUrl={imageUrl || templateImagePath}
                initialContent={(() => {
                  const parsed = eventData?.jsonContent
                    ? parseJsonContent(eventData.jsonContent)
                    : null;
                  const valid =
                    parsed?.canvas &&
                    Array.isArray(parsed.canvas.objects) &&
                    parsed.canvas.objects.length > 0;
                  return valid ? parsed : null;
                })()}
                width="100%"
                height="100%"
                onEditorReady={(saveFunction) => {
                  // Store the save function globally for access
                  window.pixieEditor = {
                    save: saveFunction,
                    applyBackground: (type, value) => {
                      // Apply background changes to Pixie editor
                      if (window.pixieRef?.current?.canvas) {
                        const canvas = window.pixieRef.current.canvas;
                        if (type === 'background') {
                          canvas.backgroundColor = value;
                        } else if (type === 'pageBackground') {
                          // This would be applied to the page container
                        }
                        canvas.renderAll();
                      }
                    },
                    loadTemplate: (content) => {
                      // Load template content into Pixie editor with validation
                      const hasObjects =
                        content?.canvas &&
                        Array.isArray(content.canvas.objects) &&
                        content.canvas.objects.length > 0;
                      if (!hasObjects) return;
                      if (window.pixieRef?.current?.setState) {
                        try {
                          window.pixieRef.current.setState(content);
                        } catch (_) {
                          // ignore
                        }
                      }
                    },
                  };
                }}
                onSave={(state) => {
                  console.log('state1234', state);
                  updateEventData({ jsonContent: state });
                  // showCustomToast('Template saved successfully', 'success');
                }}
                onImageUpload={(file) => {
                  // Handle image upload in Pixie editor
                  setUploadedImageFile(file);
                  const tempUrl = URL.createObjectURL(file);
                  setImageUrl(tempUrl);

                  // Clear the template image path since we're using a new image
                  setTemplateImagePath('');
                  setHasUploadedNewImage(true); // Mark that a new image has been uploaded

                  // Convert file to base64 for later use
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const base64Data = e.target.result;
                    setNewImageBase64(base64Data);
                    updateEventData({ newImageBase64: base64Data });
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Right Side - Design Tools */}
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        {/* Design Tools Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Design Tools
          </h3>
          <p className="text-sm text-gray-500">
            Customize your invitation design
          </p>
        </div>

        {/* Design Tools Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Image Upload */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Upload New Image
              </Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <svg
                    className="w-8 h-8 text-gray-400 mb-2"
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
                  <span className="text-sm text-gray-600">
                    {isLoading ? 'Loading...' : 'Click to upload image'}
                  </span>
                  <span className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF up to 5MB
                  </span>
                </label>
              </div>
            </div>

            {/* Current Image Preview */}
            {(templateImagePath || imageUrl) && (
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-3 block">
                  {uploadedImageFile ? 'Uploaded Image' : 'Template Image'}
                </Label>
                <div className="relative rounded-lg overflow-hidden border border-gray-200">
                  <img
                    src={imageUrl || templateImagePath}
                    alt={
                      uploadedImageFile ? 'Uploaded Image' : 'Template Image'
                    }
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div
                    className="absolute inset-0 bg-gray-100 flex items-center justify-center"
                    style={{ display: 'none' }}
                  >
                    <span className="text-gray-500 text-xs">
                      Image failed to load
                    </span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {uploadedImageFile
                    ? 'Your uploaded image is ready for editing.'
                    : 'This is the template image. Upload a new image to replace it.'}
                </p>
              </div>
            )}

            {/* Background Settings */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Canvas Background
              </Label>
              <Input
                type="text"
                value={eventData.background}
                onChange={(e) =>
                  handleBackgroundChange('background', e.target.value)
                }
                placeholder="e.g., #ffffff, linear-gradient(...), or image URL"
                className="w-full"
              />
              <div
                className="w-full h-8 mt-2 rounded border"
                style={getBackgroundStyle(eventData.background)}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-3 block">
                Page Background
              </Label>
              <Input
                type="text"
                value={eventData.pageBackground}
                onChange={(e) =>
                  handleBackgroundChange('pageBackground', e.target.value)
                }
                placeholder="e.g., #ffffff, linear-gradient(...), or image URL"
                className="w-full"
              />
              <div
                className="w-full h-8 mt-2 rounded border"
                style={getBackgroundStyle(eventData.pageBackground)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step1;
