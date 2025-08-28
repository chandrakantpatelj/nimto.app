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

  const handleBackClick = () => {
    if (isTemplateEditor) {
      router.back();
    } else {
      setShowExitPopup(true);
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackClick}
              className="flex items-center gap-2"
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Back
            </Button>

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

            {/* Event Flow Steps */}
            {!isTemplateEditor && (
              <>
                {activeStep === 0 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-md font-semibold">
                      Step 1: Design Invitation
                    </span>
                    <span className="text-xs font-medium text-secondary-foreground">
                      Customize the look and fill in event details.
                    </span>
                  </div>
                )}
                {activeStep === 1 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-md font-semibold">
                      Step 2: Preview
                    </span>
                    <span className="text-xs font-medium text-secondary-foreground">
                      See how your invitation will look to guests.
                    </span>
                  </div>
                )}
                {activeStep === 2 && (
                  <div className="flex flex-col gap-1">
                    <span className="text-md font-semibold">
                      Step 3: Manage Guests
                    </span>
                    <span className="text-xs font-medium text-secondary-foreground">
                      Add guests and configure invitation settings.
                    </span>
                  </div>
                )}
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
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowExitPopup(true)}
                >
                  Cancel
                </Button>
                <span className="bg-gray-200 w-[1px] h-full mx-1"></span>
                <div className="flex gap-1">
                  {activeStep > 0 && (
                    <Button
                      variant="outline"
                      mode="primary"
                      onClick={() => handleBack()}
                    >
                      Previous
                    </Button>
                  )}

                  {activeStep === 2 ? (
                    <div className="relative">
                      <Button
                        variant="primary"
                        onClick={onPublishEvent}
                        disabled={isCreating || !hasGuests}
                        className={
                          !hasGuests ? 'opacity-50 cursor-not-allowed' : ''
                        }
                      >
                        {isCreating ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Creating...
                          </>
                        ) : (
                          'Publish Event'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button variant="primary" onClick={() => handleNext()}>
                      Next
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </Container>
      </header>
      <ExitEditorPopup show={showExitPopup} setShow={setShowExitPopup} />
    </>
  );
}
