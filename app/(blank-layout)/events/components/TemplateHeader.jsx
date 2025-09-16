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
      <header
        className={cn(
          'header fixed top-0 z-10 start-0 flex items-stretch shrink-0 border-b  border-slate-200 bg-background end-0 pe-[var(--removed-body-scroll-bar-size,0px)] py-2',
          headerSticky && 'border-b border-border',
        )}
      >
        <Container className="flex justify-between items-stretch lg:gap-4">
          <div className="flex items-center gap-4">
            {/* Back Button */}

            {/* Template Name Input (for template editor) */}
            {isTemplateEditor && (
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  value={templateName}
                  onChange={onTemplateNameChange}
                  placeholder="Template name"
                  className="w-64"
                />
              </div>
            )}

            {/* Event Flow Steps with Step Indicator */}
            {!isTemplateEditor && (
              <>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {activeStep + 1}
                    </span>
                  </div>
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900">
                      {activeStep === 0 && 'Design Your Event'}
                      {activeStep === 1 && 'Event Details'}
                      {activeStep === 2 && 'Manage Guests'}
                    </h1>
                    <p className="text-sm text-gray-500">
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

          <div className="flex gap-1 items-center py-2 ml-auto">
            {/* Template Editor Actions */}
            {isTemplateEditor ? (
              <Button
                variant="primary"
                onClick={onSave}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4"
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
                    Save Template
                  </>
                )}
              </Button>
            ) : (
              /* Event Flow Actions */
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowExitPopup(true)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                >
                  Cancel
                </button>

                {/* Show Previous button only on step 2 and 3 */}
                {activeStep > 0 && (
                  <button
                    onClick={() => {
                      handleBack();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    Previous
                  </button>
                )}

                {activeStep === 2 ? (
                  <div className="relative">
                    <button
                      onClick={onPublishEvent}
                      disabled={isCreating || !hasGuests}
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isCreating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating...
                        </>
                      ) : (
                        publishButtonText
                      )}
                    </button>
                  </div>
                ) : (
                  <button
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleNext()}
                  >
                    Next
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
