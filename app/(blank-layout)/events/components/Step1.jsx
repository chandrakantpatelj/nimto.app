import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useEventActions, useEvents } from '@/store/hooks';
import { format } from 'date-fns';
import {
  CalendarDays,
  Clock3,
  Info,
  Loader2,
  MapPin,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { DateInput, TimeField } from '@/components/ui/datefield';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { showCustomToast } from '@/components/common/custom-toast';
import PixieEditorRedux from '@/components/image-editor/PixieEditorRedux';

function Step1({ mode = 'create' }) {
  const params = useParams();
  const templateId = params.id;
  const eventId = params.eventId; // For edit mode
  const isEditMode = !!eventId; // Determine if we're in edit mode
  const { selectedEvent: eventData } = useEvents();
  const { updateSelectedEvent } = useEventActions();

  // Update function - always updates selectedEvent
  const updateEventData = updateSelectedEvent;

  const [isLoading, setIsLoading] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadedImageFile, setUploadedImageFile] = useState(null);
  const [templateImagePath, setTemplateImagePath] = useState('');
  const [newImageBase64, setNewImageBase64] = useState(null); // Store base64 data for new images
  // State flags to prevent multiple API calls and unnecessary re-renders
  const [hasUploadedNewImage, setHasUploadedNewImage] = useState(false); // Track if user uploaded a new image

  const [eventDataLoaded, setEventDataLoaded] = useState(false); // Track if event data has been loaded

  // Date picker popover state
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Initialize with existing event data if in edit mode
  // This useEffect is optimized to prevent multiple API calls and unnecessary re-renders
  useEffect(() => {
    // Handle edit mode
    if (eventData && !eventDataLoaded) {
      setEventDataLoaded(true);

      // Set the image path from existing event data
      if (eventData.s3ImageUrl && !hasUploadedNewImage) {
        // eventData.s3ImageUrl is already a proxy URL, use it directly
        console.log('Using s3ImageUrl directly:', eventData.s3ImageUrl);
        setImageUrl(eventData.s3ImageUrl);
      } else if (hasUploadedNewImage) {
        // Skipping eventData image setup - new image uploaded
      }

      // Note: PixieEditorRedux handles content initialization via initialContent prop
      // No need to manually set state here as it's handled by the Pixie component
    }
    // Handle create mode - template data should already be in Redux from template selection
    else if (mode === 'create') {
      setTemplateLoading(false);
      // PixieEditorRedux will handle content loading via initialContent prop
    }
  }, [mode, templateId, hasUploadedNewImage, eventDataLoaded]);
  // Reset flags when templateId changes
  useEffect(() => {
    setEventDataLoaded(false);
    setHasUploadedNewImage(false);
  }, [templateId, eventId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Cleanup any pending operations
      setTemplateLoading(false);
      setEventDataLoaded(false);
    };
  }, []);

  // Save Pixie content when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      // Try to save current Pixie state when leaving Step 1
      try {
        if (window.pixieRef?.current?.getState) {
          const currentState = window.pixieRef.current.getState();
          console.log('currentState', currentState);
          if (currentState) {
            updateEventData({ jsonContent: currentState });
          }
        }
      } catch (error) {
        console.error('Failed to save Pixie content on unmount:', error);
      }
    };
  }, [updateEventData]);

  // Add beforeunload event listener to save data when user tries to leave the page
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      // Try to save current Pixie state before page unload
      try {
        if (window.pixieRef?.current?.getState) {
          const currentState = window.pixieRef.current.getState();
          if (currentState) {
            // Create unique key based on template/event ID to prevent cross-contamination
            const uniqueKey = `pixie_autosave_${templateId || eventId || 'new'}`;
            localStorage.setItem(uniqueKey, JSON.stringify(currentState));
            console.log(
              `Saved Pixie state to localStorage with key: ${uniqueKey}`,
            );
          }
        }
      } catch (error) {
        console.error('Failed to save Pixie content on page unload:', error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [templateId, eventId]); // Add dependencies to ensure we have the correct IDs

  // Clean up autosave data when work is successfully saved
  const clearAutosaveData = () => {
    try {
      const uniqueKey = `pixie_autosave_${templateId || eventId || 'new'}`;
      localStorage.removeItem(uniqueKey);
      console.log(`Cleared autosave data for key: ${uniqueKey}`);
    } catch (error) {
      console.error('Failed to clear autosave data:', error);
    }
  };

  // Check for autosave data on component mount
  useEffect(() => {
    const checkForAutosaveData = () => {
      try {
        const uniqueKey = `pixie_autosave_${templateId || eventId || 'new'}`;
        const autosaveData = localStorage.getItem(uniqueKey);

        if (autosaveData) {
          console.log(`Found autosave data for key: ${uniqueKey}`);
          // You could show a recovery dialog here if needed
          // For now, just log it - PixieEditorRedux will handle loading
        }
      } catch (error) {
        console.error('Failed to check for autosave data:', error);
      }
    };

    checkForAutosaveData();
  }, [templateId, eventId]);

  // Note: Content loading is now handled by PixieEditorRedux via initialContent prop
  // This follows the single responsibility principle - PixieEditorRedux manages its own state

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

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Full Size Pixie Editor */}
      <div className="flex-1 flex flex-col">
        {/* Header */}

        {/* Pixie Editor Container */}
        <div className="flex-1 p-6">
          {templateLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600">
                  {mode === 'edit' ? 'Loading event...' : 'Loading template...'}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full w-[800] rounded-lg overflow-hidden border border-gray-200 bg-white">
              <PixieEditorRedux
                key={`pixie-${templateId || eventId}-${hasUploadedNewImage}`} // Use templateId/eventId instead of imageUrl to prevent unnecessary re-renders
                initialImageUrl={imageUrl}
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

                  // Also store the save function globally for backward compatibility
                  window.pixieSaveFunction = saveFunction;

                  // Create a robust save function that always works
                  window.pixieForceSave = async () => {
                    try {
                      // Try the main save function first
                      if (saveFunction) {
                        await saveFunction();
                        return true;
                      }
                      // Fallback: get state directly and update Redux
                      if (window.pixieRef?.current?.getState) {
                        const currentState = window.pixieRef.current.getState();
                        if (currentState) {
                          console.log('state12345', currentState);
                          updateEventData({ jsonContent: currentState });
                          return true;
                        }
                      }
                      return false;
                    } catch (error) {
                      console.error(
                        'Failed to force save Pixie content:',
                        error,
                      );
                      return false;
                    }
                  };
                }}
                onSave={(state) => {
                  console.log('state1234', state);
                  updateEventData({ jsonContent: state });
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
      {false && (
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          {/* Design Tools Header */}

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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Step1;
