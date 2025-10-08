'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useEventActions, useEvents, useTemplateLoading } from '@/store/hooks';
import { useSession } from 'next-auth/react';
import AdvancedProcessingLoader from '@/components/common/advanced-processing-loader';
import { showCustomToast } from '@/components/common/custom-toast';
import { TemplateHeader } from '../../components';
import InvitationConfirmationPopup from '../../components/InvitationConfirmationPopup';
import Step1 from '../../components/Step1';
import Step2 from '../../components/Step2';
import Step3 from '../../components/Step3';

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
  const [showInvitationPopup, setShowInvitationPopup] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const pixieEditorRef = useRef(null);

  // Load template data from localStorage or redirect to template selection
  useEffect(() => {
    const loadTemplate = async () => {
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
        showCustomToast('Failed to load template. Please try again.', 'error');
        router.push('/templates');
      }
    };

    loadTemplate();
  }, [eventData, setSelectedEvent, session, router]);

  const handleNext = async () => {
    // Check authentication before proceeding to next step
    if (!session?.user?.id) {
      // Store current path for redirect after sign in
      const currentPath = '/events/design/new';
      const returnUrl = encodeURIComponent(currentPath);

      // Redirect to sign in with return URL
      router.push(`/signin?callbackUrl=${returnUrl}`);
      return;
    }

    // Only check Pixie editor readiness if we're on step 0 (design step)
    if (activeStep === 0) {
      if (!pixieEditorRef.current?.save) {
        showCustomToast('Editor not ready. Please try again.', 'error');
        return;
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

    setShowInvitationPopup(true);
  };

  const handleConfirmPublish = async () => {
    try {
      setIsCreating(true);

      const eventDataToSave = {
        ...eventData,
        status: eventData.status || 'PUBLISHED', // Use selected status or default to PUBLISHED
        createdByUserId: session.user.id,
      };

      await addEventToStore(eventDataToSave);
      setShowInvitationPopup(false);
      const statusMessage = eventData.status === 'DRAFT' ? 'Event saved as draft!' : 'Event created successfully!';
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

      <InvitationConfirmationPopup
        isOpen={showInvitationPopup}
        onClose={handleCancelPublish}
        onConfirm={handleConfirmPublish}
        isCreating={isCreating}
        eventData={eventData}
      />

      <AdvancedProcessingLoader
        isVisible={isCreating && !showInvitationPopup}
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
