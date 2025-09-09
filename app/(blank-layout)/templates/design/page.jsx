'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { useTemplateImage } from '@/hooks/use-template-image';
import { showCustomToast } from '@/components/common/custom-toast';
import TemplateDesignLayout from './components/TemplateDesignLayout';

function CreateTemplate() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Template image operations
  const { uploadTemplateImage } = useTemplateImage();

  // Handle save template - CREATE API logic
  const handleSaveTemplate = async (templateData, uploadedImageFile) => {
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
            showCustomToast('Uploading image to S3...', 'info');
            await uploadTemplateImage(result.data.id, uploadedImageFile);
            showCustomToast('Image uploaded successfully!', 'success');
          } catch (uploadError) {
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
