import { useState, useCallback } from 'react';

export function useTemplateImage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get template image by ID
  const getTemplateImage = useCallback(async (templateId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/template/${templateId}/image`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch template image');
      }

      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Save edited image from Pixie using the new update-image API
  const saveTemplateImage = useCallback(async (templateId, imageData, imageFormat = 'png') => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/template/${templateId}/update-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageData,
          imageFormat,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save template image');
      }

      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Upload new image file using the new update-image API
  const uploadTemplateImage = useCallback(async (templateId, file) => {
    setLoading(true);
    setError(null);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`/api/template/${templateId}/update-image`, {
        method: 'PUT',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload image');
      }

      return result.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getTemplateImage,
    saveTemplateImage,
    uploadTemplateImage,
    loading,
    error,
  };
}
