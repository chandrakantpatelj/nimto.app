import { useRouter } from 'next/navigation';
import { useEventActions } from '@/store/hooks';
import { showCustomToast } from '@/components/common/custom-toast';

/**
 * Custom hook for handling Pixie editor navigation with state saving
 * @param {Object} options - Configuration options
 * @param {string} options.nextRoute - Route to navigate to after saving
 * @param {boolean} options.showToast - Whether to show success/error toasts
 * @returns {Object} Navigation utilities
 */
export const usePixieNavigation = ({ nextRoute, showToast = true } = {}) => {
  const router = useRouter();
  const { updateSelectedEvent } = useEventActions();

  /**
   * Save Pixie editor state and navigate to next step
   * @param {Object} pixieRef - Reference to Pixie editor component
   * @param {Object} options - Additional options
   * @param {string} options.customRoute - Override the default next route
   * @param {boolean} options.includeExportedImage - Whether to include exported image
   * @returns {Promise<boolean>} Success status
   */
  const saveAndNavigate = async (pixieRef, options = {}) => {
    const {
      customRoute,
      includeExportedImage = true,
      additionalData = {},
    } = options;

    if (!pixieRef?.current) {
      if (showToast) {
        showCustomToast('Editor not ready', 'error');
      }
      return false;
    }

    try {
      // Get the updated state from Pixie editor
      const success = await pixieRef.current.save();

      if (success) {
        // Get the current state to access exported image
        const currentState = pixieRef.current.getState();

        if (currentState) {
          // Prepare update data
          const updateData = {
            jsonContent: JSON.stringify(currentState),
            ...additionalData,
          };

          // Add exported image if requested and available
          if (includeExportedImage && currentState.exportedImage) {
            updateData.previewImage = currentState.exportedImage;
            updateData.imageThumbnail = currentState.exportedImage;
          }

          // Update Redux store
          updateSelectedEvent(updateData);

          if (showToast) {
            showCustomToast('Design saved successfully', 'success');
          }

          // Navigate to next step
          const route = customRoute || nextRoute;
          if (route) {
            router.push(route);
          }

          return true;
        }
      } else {
        if (showToast) {
          showCustomToast('Failed to save design', 'error');
        }
        return false;
      }
    } catch (error) {
      console.error('Error saving design:', error);
      if (showToast) {
        showCustomToast('Failed to save design', 'error');
      }
      return false;
    }

    return false;
  };

  /**
   * Quick save without navigation
   * @param {Object} pixieRef - Reference to Pixie editor component
   * @param {Object} options - Additional options
   * @returns {Promise<boolean>} Success status
   */
  const quickSave = async (pixieRef, options = {}) => {
    const { includeExportedImage = true, additionalData = {} } = options;

    if (!pixieRef?.current) {
      if (showToast) {
        showCustomToast('Editor not ready', 'error');
      }
      return false;
    }

    try {
      const success = await pixieRef.current.save();

      if (success) {
        const currentState = pixieRef.current.getState();

        if (currentState) {
          const updateData = {
            jsonContent: JSON.stringify(currentState),
            ...additionalData,
          };

          if (includeExportedImage && currentState.exportedImage) {
            updateData.previewImage = currentState.exportedImage;
            updateData.imageThumbnail = currentState.exportedImage;
          }

          updateSelectedEvent(updateData);

          if (showToast) {
            showCustomToast('Design saved successfully', 'success');
          }

          return true;
        }
      } else {
        if (showToast) {
          showCustomToast('Failed to save design', 'error');
        }
        return false;
      }
    } catch (error) {
      console.error('Error saving design:', error);
      if (showToast) {
        showCustomToast('Failed to save design', 'error');
      }
      return false;
    }

    return false;
  };

  /**
   * Get current state without saving
   * @param {Object} pixieRef - Reference to Pixie editor component
   * @returns {Object|null} Current state or null
   */
  const getCurrentState = (pixieRef) => {
    if (!pixieRef?.current) {
      return null;
    }

    try {
      return pixieRef.current.getState();
    } catch (error) {
      console.error('Error getting current state:', error);
      return null;
    }
  };

  return {
    saveAndNavigate,
    quickSave,
    getCurrentState,
  };
};

export default usePixieNavigation;
