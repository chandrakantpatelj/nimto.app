'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSelectedTemplate, useTemplateActions } from '@/store/hooks';
import { apiFetch } from '@/lib/api';
import { useTemplateImage } from '@/hooks/use-template-image';
import { useToast } from '@/providers/toast-provider';
import TemplateDesignLayout from '../components/TemplateDesignLayout';

function EditTemplate() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id;

  // Redux state and actions
  const selectedTemplate = useSelectedTemplate();
  const { fetchTemplateById } = useTemplateActions();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fetchingTemplate, setFetchingTemplate] = useState(false);

  // Template image operations
  const { uploadTemplateImage } = useTemplateImage();

  // Toast functions
  const { toastSuccess, toastError, toastInfo, toastWarning } = useToast();

  // Fetch template data using Redux - OPTIMIZED: No local formData needed
  const fetchTemplateData = async () => {
    if (!templateId) {
      return;
    }

    try {
      setFetchingTemplate(true);
      setError(null);

      if (!selectedTemplate || selectedTemplate.id !== templateId) {
        const result = await fetchTemplateById(templateId);
        if (!result.payload) {
          throw new Error('Failed to fetch template');
        }
      }
      console.log('selectedTemplate222', selectedTemplate);
    } catch (err) {
      setError(err.message);
      toastError('Failed to load template');
    } finally {
      setFetchingTemplate(false);
    }
  };
  console.log('selectedTemplate', selectedTemplate);

  // Load template data on component mount - FIXED: Prevent multiple API calls
  useEffect(() => {
    fetchTemplateData();
  }, [templateId]); // Removed selectedTemplate from dependencies to prevent multiple calls

  // Handle save template - UPDATE API logic - OPTIMIZED: Use selectedTemplate directly
  const handleSaveTemplate = async (
    templateData,
    uploadedImageFile,
    thumbnailData,
  ) => {
    try {
      setLoading(true);
      setError(null);

      // Use selectedTemplate as base, merge with form changes

      const templateToSave = {
        ...templateData,
        // imagePath: templateImagePath,
      };

      // Update existing template
      const response = await apiFetch(`/api/template/${templateId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(templateToSave),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update template');
      }

      const result = await response.json();

      if (result.success) {
        // Upload image if there's a new uploaded file
        if (uploadedImageFile) {
          await uploadTemplateImage(templateId, uploadedImageFile);
        }

        // Upload thumbnail if thumbnail data is available
        if (thumbnailData) {
          try {
            const thumbnailResponse = await apiFetch(
              `/api/template/${templateId}/upload-thumbnail`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  imageBlob: thumbnailData.base64Data,
                  imageFormat: 'png',
                }),
              },
            );

            if (!thumbnailResponse.ok) {
              const thumbnailError = await thumbnailResponse.json();
              throw new Error(
                thumbnailError.error || 'Failed to upload thumbnail',
              );
            }

            const thumbnailResult = await thumbnailResponse.json();
            if (thumbnailResult.success) {
            } else {
              throw new Error(
                thumbnailResult.error || 'Failed to upload thumbnail',
              );
            }
          } catch (thumbnailError) {
            console.error('Thumbnail upload failed:', thumbnailError);
            toastWarning(
              'Template updated but thumbnail upload failed: ' +
                thumbnailError.message,
            );
          }
        }

        toastSuccess('Template updated successfully');
        router.push('/templates');
      } else {
        throw new Error(result.error || 'Failed to update template');
      }
    } catch (err) {
      setError(err.message);
      throw err;
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

  // Don't render until selectedTemplate is loaded
  if (!selectedTemplate) {
    return null;
  }

  return (
    <TemplateDesignLayout
      mode="edit"
      initialFormData={selectedTemplate}
      onSave={handleSaveTemplate}
      loading={loading}
      error={error}
      headerButtonText="Update Template"
    />
  );
}

export default EditTemplate;
