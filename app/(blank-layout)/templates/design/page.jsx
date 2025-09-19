'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useTemplateImage } from '@/hooks/use-template-image';
import { useToast } from '@/providers/toast-provider';
import TemplateDesignLayout from './components/TemplateDesignLayout';

function CreateTemplate() {
  const router = useRouter();
  const { toastSuccess, toastWarning, toastInfo } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Template image operations
  const { uploadTemplateImage } = useTemplateImage();

  // Handle save template - CREATE API logic
  const handleSaveTemplate = async (
    templateData,
    uploadedImageFile,
    thumbnailData,
  ) => {
    try {
      setLoading(true);
      setError(null);

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
            toastInfo('Uploading image to S3...');
            await uploadTemplateImage(result.data.id, uploadedImageFile);
            toastSuccess('Image uploaded successfully!');
          } catch (uploadError) {
            toastWarning('Template created but image upload failed');
          }
        }

        // Upload thumbnail if thumbnail data is available
        if (thumbnailData) {
          try {
            toastInfo('Uploading thumbnail...');
            const thumbnailResponse = await apiFetch(
              `/api/template/${result.data.id}/upload-thumbnail`,
              {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  imageBlob: thumbnailData.base64Data,
                  imageFormat: 'png',
                }),
              },
            );

            if (!thumbnailResponse.ok) {
              const errorData = await thumbnailResponse.json();
              throw new Error(errorData.error || 'Failed to upload thumbnail');
            }

            const thumbnailResult = await thumbnailResponse.json();
            console.log('Thumbnail upload successful:', thumbnailResult);
            toastSuccess('Thumbnail uploaded successfully!');
          } catch (thumbnailError) {
            console.error('Thumbnail upload failed:', thumbnailError);
            toastWarning(
              'Template created but thumbnail upload failed: ' +
                thumbnailError.message,
            );
          }
        }

        toastSuccess('Template created successfully');
        router.push('/templates');
      } else {
        throw new Error(result.error || 'Failed to create template');
      }
    } catch (err) {
      console.error('Error creating template:', err);
      setError(err.message);
      throw err; // Re-throw to let the layout handle the error display
    } finally {
      setLoading(false);
    }
  };

  return (
    <TemplateDesignLayout
      mode="create"
      onSave={handleSaveTemplate}
      loading={loading}
      error={error}
      headerButtonText="Create Template"
    />
  );
}

export default CreateTemplate;
