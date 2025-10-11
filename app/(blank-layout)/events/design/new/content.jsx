'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventActions, useEvents, useTemplateLoading } from '@/store/hooks';
import { useSession } from 'next-auth/react';
import AdvancedProcessingLoader from '@/components/common/advanced-processing-loader';
import { showCustomToast } from '@/components/common/custom-toast';
import { TemplateHeader, PublishOptionsPopup } from '../../components';
import InvitationConfirmationPopup from '../../components/InvitationConfirmationPopup';
import Step1 from '../../components/Step1';
import Step2 from '../../components/Step2';
import Step3 from '../../components/Step3';
import {
  saveDesignState,
  restoreDesignState,
  clearDesignState,
  hasDesignState,
  savePixieEditorState,
} from '@/lib/design-state-persistence';

function NewEventFromTemplateContent() {
  const router = useRouter();
  const { data: session } = useSession();
  const { selectedEvent: eventData } = useEvents();
  const {
    addEventToStore,
    setSelectedEvent,
    updateSelectedEvent,
    resetEventCreation,
  } = useEventActions();
  const isTemplateLoading = useTemplateLoading();

  const [activeStep, setActiveStep] = useState(0);
  const [showPublishOptionsPopup, setShowPublishOptionsPopup] = useState(false);
  const [showInvitationPopup, setShowInvitationPopup] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const pixieEditorRef = useRef(null);

  // Load template data from localStorage or redirect to template selection
  useEffect(() => {
    const loadTemplate = async () => {
      // First, check if we're returning from OAuth and have saved design state
      if (session?.user?.id && hasDesignState()) {
        const savedState = restoreDesignState();
        
        if (savedState) {
          console.log('Restoring design state after OAuth redirect');
          
          // Merge the saved Pixie state into eventData's jsonContent
          const restoredEventData = {
            ...savedState.eventData,
            // Use the saved Pixie state if available, otherwise use original jsonContent
            jsonContent: savedState.pixieState || savedState.eventData.jsonContent,
          };
          
          // Restore event data to Redux
          setSelectedEvent(restoredEventData);
          
          // Restore active step
          if (savedState.activeStep !== undefined) {
            setActiveStep(savedState.activeStep);
          }
          
          // Set selected template for UI
          if (savedState.templateData) {
            setSelectedTemplate(savedState.templateData);
          }
          
          // Clear the saved state after restoring
          clearDesignState();
          
          showCustomToast('Your design has been restored!', 'success');
          return;
        }
      }

      // Normal flow: load template if no event data exists
      if (eventData) return;

      try {
        // Check if user is authenticated
        if (!session?.user?.id) {
          // Store current path for redirect after sign in
          const currentPath = '/events/design/new';
          const returnUrl = encodeURIComponent(currentPath);

          // Redirect to sign in with return URL
          router.push(`/signin?callbackUrl=${returnUrl}`);
          return;
        }

        // Get template from localStorage (set by home page template selection)
        const storedTemplate = localStorage.getItem('selectedTemplate');

        if (!storedTemplate) {
          // No template selected, redirect to template selection
          showCustomToast('Please select a template first', 'error');
          router.push('/templates');
          return;
        }

        const templateData = JSON.parse(storedTemplate);
        setSelectedTemplate(templateData);

        // Initialize event data with template
        setSelectedEvent({
          title: templateData.name,
          templateId: templateData.id,
          description: '',
          startDateTime: null,
          locationAddress: '',
          locationUnit: '',
          showMap: true,
          status: 'PUBLISHED', // Default to PUBLISHED
          guests: [],
          jsonContent: templateData.jsonContent,
          imagePath: templateData.imagePath,
          s3ImageUrl: templateData.s3ImageUrl,
          newImageBase64: null,
        });

        // Clear the stored template
        localStorage.removeItem('selectedTemplate');
      } catch (error) {
        console.error('Template loading error:', error.message || error);
        showCustomToast('Failed to load template. Please try again.', 'error');
        router.push('/templates');
      }
    };

    loadTemplate();
  }, [eventData, setSelectedEvent, session, router, setActiveStep]);

  const handleNext = async () => {
    // Only check Pixie editor readiness if we're on step 0 (design step)
    if (activeStep === 0) {
      if (!pixieEditorRef.current?.save) {
        showCustomToast('Editor not ready. Please try again.', 'error');
        return;
      }

      // Check authentication before proceeding to next step
      if (!session?.user?.id) {
        try {
          // Save the current Pixie editor state
          const pixieState = await savePixieEditorState(pixieEditorRef);
          
          // Save the complete design state to localStorage
          saveDesignState({
            eventData: eventData,
            pixieState: pixieState,
            templateId: eventData?.templateId,
            templateData: selectedTemplate,
            activeStep: activeStep,
          });
          
          console.log('Design state saved before OAuth redirect');
          
          // Store current path for redirect after sign in
          const currentPath = '/events/design/new';
          const returnUrl = encodeURIComponent(currentPath);

          // Redirect to sign in with return URL
          router.push(`/signin?callbackUrl=${returnUrl}`);
          return;
        } catch (error) {
          console.error('Failed to save design state:', error);
          showCustomToast('Failed to save design. Please try again.', 'error');
          return;
        }
      }

      try {
        const pixieState = JSON.parse(await pixieEditorRef.current.save());

        if (pixieState?.canvas?.objects?.length) {
          updateSelectedEvent({
            ...eventData,
            jsonContent: JSON.stringify(pixieState),
            imageThumbnail: pixieState.exportedImage || null,
          });
        }
      } catch (err) {
        showCustomToast(
          'There was a problem saving your design. Please try again.',
          'error',
        );
        return;
      }
    }

    setActiveStep(activeStep + 1);
  };

  const handleBack = () => setActiveStep(activeStep - 1);

  const handlePublishEvent = () => {
    // Validate required fields
    if (!eventData.title || !eventData.startDateTime) {
      showCustomToast(
        'Please fill in all required fields (title and start date)',
        'error',
      );
      return;
    }

    // Check if user is authenticated
    if (!session?.user?.id) {
      // Store current path for redirect after sign in
      const currentPath = '/events/design/new';
      const returnUrl = encodeURIComponent(currentPath);

      // Redirect to sign in with return URL
      router.push(`/signin?callbackUrl=${returnUrl}`);
      return;
    }

    // Validate that at least one guest is selected
    if (!eventData.guests || eventData.guests.length === 0) {
      showCustomToast('Please add at least one guest', 'error');
      return;
    }

    // Show publish options popup first
    setShowPublishOptionsPopup(true);
  };

  const handleSaveAsDraft = async () => {
    try {
      setIsCreating(true);
      setShowPublishOptionsPopup(false);

      const eventDataToSave = {
        ...eventData,
        status: 'DRAFT',
        createdByUserId: session.user.id,
      };

      await addEventToStore(eventDataToSave);
      showCustomToast('Event saved as draft!', 'success');

      // Reset event creation state
      resetEventCreation();

      // Redirect to events page
      router.push('/events');
    } catch (error) {
      console.error('Failed to save event:', error.message || error);
      showCustomToast(`Failed to save event: ${error.message}`, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePublishConfirm = () => {
    // Update event status to PUBLISHED
    updateSelectedEvent({ status: 'PUBLISHED' });
    setShowPublishOptionsPopup(false);
    
    // Show invitation popup if there are guests
    if (eventData.guests && eventData.guests.length > 0) {
      setShowInvitationPopup(true);
    } else {
      // Publish event without invitations
      handleConfirmPublish('PUBLISHED');
    }
  };

  const handleConfirmPublish = async (status = 'PUBLISHED') => {
    try {
      setIsCreating(true);

      const eventDataToSave = {
        ...eventData,
        status: status,
        createdByUserId: session.user.id,
      };

      await addEventToStore(eventDataToSave);
      setShowInvitationPopup(false);
      const statusMessage = status === 'DRAFT' ? 'Event saved as draft!' : 'Event created successfully!';
      showCustomToast(statusMessage, 'success');

      // Reset event creation state
      resetEventCreation();

      // Redirect to events page
      router.push('/events');
    } catch (error) {
      showCustomToast(`Failed to create event: ${error.message}`, 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelPublish = () => {
    setShowInvitationPopup(false);
  };

  // Show loading while checking authentication or loading template
  if (!session || !selectedTemplate || isTemplateLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TemplateHeader
        activeStep={activeStep}
        onBack={handleBack}
        onNext={handleNext}
        onPublishEvent={handlePublishEvent}
        isCreating={isCreating}
        hasGuests={eventData?.guests?.length > 0}
        eventStatus={eventData?.status}
      />

      <div
        className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8"
        style={{ marginTop: '60px' }}
      >
        {activeStep === 0 && (
          <Step1
            ref={pixieEditorRef}
            templateData={selectedTemplate}
            eventData={eventData}
            onUpdateEvent={updateSelectedEvent}
          />
        )}
        {activeStep === 1 && (
          <Step2 eventData={eventData} onUpdateEvent={updateSelectedEvent} />
        )}
        {activeStep === 2 && (
          <Step3 eventData={eventData} onUpdateEvent={updateSelectedEvent} />
        )}
      </div>

      <PublishOptionsPopup
        isOpen={showPublishOptionsPopup}
        onClose={() => setShowPublishOptionsPopup(false)}
        onSaveAsDraft={handleSaveAsDraft}
        onPublish={handlePublishConfirm}
        hasGuests={eventData?.guests && eventData.guests.length > 0}
      />

      <InvitationConfirmationPopup
        isOpen={showInvitationPopup}
        onClose={handleCancelPublish}
        onConfirm={() => handleConfirmPublish('PUBLISHED')}
        isCreating={isCreating}
        eventData={eventData}
      />

      <AdvancedProcessingLoader
        isVisible={isCreating && !showInvitationPopup && !showPublishOptionsPopup}
        title="Creating Event"
        description="Please wait while we process your event..."
        tasks={[
          { icon: '✨', text: 'Processing event data...' },
          { icon: '🎨', text: 'Optimizing assets...' },
          { icon: '💾', text: 'Saving to database...' },
        ]}
      />
    </div>
  );
}

export default NewEventFromTemplateContent;
