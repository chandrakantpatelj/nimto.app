'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useScrollPosition } from '@/hooks/use-scroll-position';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Container } from '@/components/common/container';
import ExitEditorPopup from './ExitEditorPopup';

export function TemplateHeader({
  // Event flow props
  activeStep,
  handleNext,
  handleBack,
  onPublishEvent,
  isCreating = false,
  hasGuests = false, // Add this prop to check if guests exist
  title = 'Create Event', // Add title prop for edit mode
  publishButtonText = 'Publish Event', // Add button text prop for edit mode
  isEditMode = false, // Add this prop to distinguish edit mode
  eventStatus, // Add eventStatus prop to determine button text

  // Template editor props
  onSave,
  loading = false,
  templateName = '',
  onTemplateNameChange,
}) {
  const router = useRouter();
  const scrollPosition = useScrollPosition();
  const headerSticky = scrollPosition > 0;
  const [showExitPopup, setShowExitPopup] = useState(false);

  // Check if this is template editor mode
  const isTemplateEditor = onSave !== undefined;

  // Determine button text based on status
  const getPublishButtonText = () => {
    if (isEditMode) {
      return eventStatus === 'DRAFT' ? 'Save as Draft' : 'Update Event';
    }
    return eventStatus === 'DRAFT' ? 'Save as Draft' : 'Publish Event';
  };

  const getLoadingText = () => {
    if (isEditMode) {
      return eventStatus === 'DRAFT' ? 'Saving Draft...' : 'Updating...';
    }
    return eventStatus === 'DRAFT' ? 'Saving Draft...' : 'Creating...';
  };

  const handleCancel = () => {
    if (isEditMode) {
      router.push('/events');
    } else {
      // Get navigation source to determine redirect destination
      const navigationSource = localStorage.getItem('navigationSource');

      // Clear the navigation source after using it
      localStorage.removeItem('navigationSource');

      // Smart redirect based on how user arrived
      switch (navigationSource) {
        case 'create-event':
          // User came from "Create Event" button -> redirect to events page
          router.push('/events');
          break;
        case 'home':
        case 'templates':
        case 'select-template':
        default:
          // User came from template selection -> redirect to previous route
          // Use browser history to go back, or fallback to home
          if (window.history.length > 1) {
            router.back();
          } else {
            router.push('/');
          }
          break;
      }
    }
  };

  return (
    <>
      {/* Mobile Header - Always Visible */}
      <div className="block md:hidden fixed top-0 left-0 right-0 z-[100] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 py-2 px-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-6 h-6 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">
                {activeStep + 1}
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                {activeStep === 0 && 'Design Your Event'}
                {activeStep === 1 && 'Event Details'}
                {activeStep === 2 && 'Manage Guests'}
              </h1>
            </div>
          </div>
          <div className="flex gap-1 flex-shrink-0">
            <button
              onClick={() => setShowExitPopup(true)}
              className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 whitespace-nowrap"
            >
              Cancel
            </button>
            {activeStep > 0 && (
              <button
                onClick={handleBack}
                className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 whitespace-nowrap"
              >
                Back
              </button>
            )}
            {activeStep === 2 ? (
              <button
                onClick={onPublishEvent}
                disabled={isCreating || !hasGuests}
                className="px-3 py-1 text-xs font-medium text-white bg-purple-600 border border-transparent rounded hover:bg-purple-700 disabled:opacity-50 whitespace-nowrap"
              >
                {isCreating ? getLoadingText() : getPublishButtonText()}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-3 py-1 text-xs font-medium text-white bg-purple-600 border border-transparent rounded hover:bg-purple-700 whitespace-nowrap"
              >
                Next Step
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <header
        className={cn(
          'header hidden md:flex fixed top-0 z-[100] start-0 items-stretch shrink-0 border-b border-slate-200 bg-background end-0 pe-[var(--removed-body-scroll-bar-size,0px)] py-2 sm:py-3',
          headerSticky && 'border-b border-border',
        )}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: 'var(--background)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Container className="flex justify-between items-stretch gap-2 sm:gap-4 lg:gap-4 w-full">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
            {/* Back Button */}

            {/* Template Name Input (for template editor) */}
            {isTemplateEditor && (
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Input
                  type="text"
                  value={templateName}
                  onChange={onTemplateNameChange}
                  placeholder="Template name"
                  className="w-full min-w-0 sm:w-64"
                />
              </div>
            )}

            {/* Event Flow Steps with Step Indicator */}
            {!isTemplateEditor && (
              <>
                <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-pink-500 to-purple-600 dark:from-pink-400 dark:to-purple-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md border border-white/20 flex-shrink-0">
                    <span className="text-white text-sm sm:text-base font-bold drop-shadow-sm">
                      {activeStep + 1}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h1 className="text-sm sm:text-base lg:text-lg font-bold text-foreground dark:text-white truncate">
                      {activeStep === 0 && 'Design Your Event'}
                      {activeStep === 1 && 'Event Details'}
                      {activeStep === 2 && 'Manage Guests'}
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-300 truncate">
                      {activeStep === 0 &&
                        'Customize your event invitation design'}
                      {activeStep === 1 && 'Preview your event invitation'}
                      {activeStep === 2 &&
                        'Add guests and configure invitation settings'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="flex gap-1 items-center py-2 ml-auto flex-shrink-0">
            {/* Template Editor Actions */}
            {isTemplateEditor ? (
              <Button
                variant="primary"
                onClick={onSave}
                disabled={loading}
                className="flex items-center gap-2 text-xs sm:text-sm px-3 py-2 sm:px-4"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white"></div>
                    <span className="hidden sm:inline">Saving...</span>
                    <span className="sm:hidden">...</span>
                  </>
                ) : (
                  <>
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                      />
                    </svg>
                    <span className="hidden sm:inline">Save Template</span>
                    <span className="sm:hidden">Save</span>
                  </>
                )}
              </Button>
            ) : (
              /* Event Flow Actions */
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={() => setShowExitPopup(true)}
                  className="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 whitespace-nowrap"
                >
                  Cancel
                </button>

                {/* Show Previous button only on step 2 and 3 */}
                {activeStep > 0 && (
                  <button
                    onClick={() => {
                      handleBack();
                    }}
                    className="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 whitespace-nowrap"
                  >
                    Previous
                  </button>
                )}

                {activeStep === 2 ? (
                  <div className="relative">
                    <button
                      onClick={onPublishEvent}
                      disabled={isCreating || !hasGuests}
                      className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-1 sm:mr-2"></div>
                          {getLoadingText()}
                        </>
                      ) : (
                        <>{getPublishButtonText()}</>
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    onClick={() => handleNext()}
                  >
                    Next Step
                  </button>
                )}
              </div>
            )}
          </div>
        </Container>
      </header>
      <ExitEditorPopup show={showExitPopup} setShow={setShowExitPopup} />
    </>
  );
}
