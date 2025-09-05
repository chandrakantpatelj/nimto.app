import { useRef } from 'react';
import { ArrowRight, Save } from 'lucide-react';
import usePixieNavigation from '@/hooks/use-pixie-navigation';
import { Button } from '@/components/ui/button';

/**
 * PixieNextButton - A reusable next button component for Pixie editor
 * @param {Object} props
 * @param {Object} props.pixieRef - Reference to Pixie editor
 * @param {string} props.nextRoute - Route to navigate to
 * @param {string} props.buttonText - Button text (default: "Next")
 * @param {boolean} props.showSaveIcon - Whether to show save icon
 * @param {boolean} props.disabled - Whether button is disabled
 * @param {Object} props.additionalData - Additional data to save with state
 * @param {Function} props.onBeforeSave - Callback before saving
 * @param {Function} props.onAfterSave - Callback after saving
 * @param {string} props.variant - Button variant
 * @param {string} props.size - Button size
 */
const PixieNextButton = ({
  pixieRef,
  nextRoute,
  buttonText = 'Next',
  showSaveIcon = true,
  disabled = false,
  additionalData = {},
  onBeforeSave,
  onAfterSave,
  variant = 'primary',
  size = 'default',
  className = '',
}) => {
  const { saveAndNavigate } = usePixieNavigation({ nextRoute });

  const handleNext = async () => {
    try {
      // Call before save callback if provided
      if (onBeforeSave) {
        await onBeforeSave();
      }

      // Save and navigate
      const success = await saveAndNavigate(pixieRef, {
        includeExportedImage: true,
        additionalData,
      });

      // Call after save callback if provided
      if (onAfterSave) {
        await onAfterSave(success);
      }
    } catch (error) {
      console.error('Error in next button handler:', error);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleNext}
      disabled={disabled}
      className={`flex items-center gap-2 ${className}`}
    >
      {showSaveIcon && <Save className="w-4 h-4" />}
      {buttonText}
      <ArrowRight className="w-4 h-4" />
    </Button>
  );
};

export default PixieNextButton;
