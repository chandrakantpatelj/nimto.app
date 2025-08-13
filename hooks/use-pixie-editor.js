import { useState, useCallback } from 'react';

export const usePixieEditor = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editorState, setEditorState] = useState(null);

  const saveImage = useCallback(async (state, imageName = null) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/save-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          state,
          imageName: imageName || `image_${Date.now()}`
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setEditorState(result);
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetState = useCallback(() => {
    setEditorState(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    isLoading,
    error,
    editorState,
    saveImage,
    clearError,
    resetState,
  };
};
