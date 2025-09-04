'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  useAppDispatch,
  useEventActions,
  useEvents,
  useTemplateActions,
  useTemplateLoading,
} from '@/store/hooks';
import { fetchTemplateById as fetchTemplateByIdThunk } from '@/store/slices/templatesSlice';
import { useSession } from 'next-auth/react';
import { showCustomToast } from '@/components/common/custom-toast';
import { TemplateHeader } from '../../components';
import InvitationConfirmationPopup from '../../components/InvitationConfirmationPopup';
import Step1 from '../../components/Step1';
import Step2 from '../../components/Step2';
import Step3 from '../../components/Step3';

function EditEventContentInner() {
  const router = useRouter();
  const params = useParams();
  const templateId = params.id;
  const { data: session } = useSession();
  const { selectedEvent: eventData } = useEvents();
  const {
    addEventToStore,
    setSelectedEvent,
    updateSelectedEvent,
    resetEventCreation,
  } = useEventActions();
  const { fetchTemplateById } = useTemplateActions();
  const isTemplateLoading = useTemplateLoading();
  const dispatch = useAppDispatch();

  const [activeStep, setActiveStep] = useState(0);
  const [showInvitationPopup, setShowInvitationPopup] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  // Check if event data is initialized
  useEffect(() => {
    const loadTemplate = async () => {
      // Don't load template if we're redirecting
      if (isRedirecting) return;

      if (!eventData && templateId) {
        // If no event data but we have a templateId, fetch the template

        try {
          let template;

          // Try using the hook function first, fallback to direct dispatch
          if (fetchTemplateById) {
            template = await fetchTemplateById(templateId).unwrap();
          } else {
            template = await dispatch(
              fetchTemplateByIdThunk(templateId),
            ).unwrap();
          }

          // Extract the actual template data from the API response
          const templateData = template.data || template;

          // Store the template data as selectedEvent with only necessary fields
          setSelectedEvent({
            // Core event fields
            title: templateData.name, // Template 'name' becomes Event 'title'
            templateId: templateData.id, // Store template ID for reference
            description: '',
            date: '',
            time: '',
            location: '',
            status: 'DRAFT',
            guests: [],
            // Design fields from template
            jsonContent: templateData.jsonContent,
            backgroundStyle: null,
            htmlContent: null,
            background: null,
            pageBackground: templateData.pageBackground,
            imagePath: templateData.imagePath,
            s3ImageUrl: templateData.s3ImageUrl,
            // Image handling fields
            newImageBase64: null,
          });
        } catch (error) {
          console.error('Failed to fetch template:', error);
          showCustomToast(
            'Failed to load template. Please try again.',
            'error',
          );
          // router.push('/events/select-template');
        }
      } else if (!eventData && !templateId) {
        // If no event data and no templateId, redirect back to template selection

        showCustomToast('Please select a template first', 'error');
        // router.push('/events/select-template');
      }
    };

    loadTemplate();
  }, [
    eventData,
    templateId,
    fetchTemplateById,
    setSelectedEvent,
    router,
    dispatch,
    isRedirecting,
  ]);

  const handleNext = async () => {
    // Try to save Pixie content before moving to next step
    try {
      // Use the robust force save function
      if (window.pixieForceSave) {
        const saved = await window.pixieForceSave();
        if (!saved) {
          console.warn('Failed to save Pixie content, proceeding anyway');
        }
      }
      // Fallback to direct state access
      else if (window.pixieRef?.current?.getState) {
        const currentState = window.pixieRef.current.getState();
        if (currentState) {
          updateSelectedEvent({ jsonContent: currentState });
        }
      }
    } catch (error) {
      console.error('Failed to save Pixie content:', error);
      // Optionally show user feedback
    }
    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const handlePublishEvent = () => {
    // Validate required fields
    if (!eventData.title || !eventData.date) {
      showCustomToast(
        'Please fill in all required fields (title and date)',
        'error',
      );
      return;
    }

    // Check if user is authenticated
    if (!session?.user?.id) {
      showCustomToast('Please sign in to create an event', 'error');
      return;
    }

    // Validate that at least one guest is selected
    if (!eventData.guests || eventData.guests.length === 0) {
      showCustomToast(
        'Please add at least one guest to create an event',
        'error',
      );
      return;
    }

    // Show invitation confirmation popup if there are guests
    if (eventData.guests && eventData.guests.length > 0) {
      setShowInvitationPopup(true);
    } else {
      // Create event without invitations
      createEvent(false);
    }
  };

  const createEvent = async (sendInvitations = false) => {
    setIsCreating(true);
    try {
      // Determine if user changed the image in Pixie
      const hasChangedImage = eventData.newImageBase64;

      // Prepare image data
      let newImageData = null;
      let templateImagePath = null;

      if (hasChangedImage) {
        // User changed the image in Pixie - send base64 data
        newImageData = eventData.newImageBase64;
      } else {
        // User didn't change the image - use template imagePath
        templateImagePath = eventData.imagePath;
      }

      const requestData = {
        ...eventData,
        createdByUserId: session.user.id,
        sendInvitations,
        guests: (eventData.guests || []).map((guest) => ({
          name: guest.name,
          contact: guest.email || guest.phone || guest.contact, // Use email/phone as contact
        })),
        templateImagePath, // Original template imagePath to copy
        newImageData, // Base64 data if user changed image in Pixie
        imageFormat: 'png',
      };

      const response = await fetch('/api/events/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        showCustomToast(
          sendInvitations
            ? 'Event created and invitations sent successfully!'
            : 'Event created successfully!',
          'success',
        );

        // Add the new event to Redux store
        addEventToStore(result.data.event);

        // Clear selectedEvent from store after successful creation
        resetEventCreation();

        // Set redirecting flag to prevent useEffect from running
        setIsRedirecting(true);

        // Redirect to events page
        router.push('/events');
      } else {
        throw new Error(result.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      showCustomToast('Failed to create event. Please try again.', 'error');
    } finally {
      setIsCreating(false);
      setShowInvitationPopup(false);
    }
  };

  const handleInvitationConfirm = () => {
    createEvent(true);
  };

  const handleInvitationCancel = () => {
    createEvent(false);
  };

  // Safety check - ensure eventData is initialized
  if (!eventData || isTemplateLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">
            {isTemplateLoading ? 'Loading template...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <TemplateHeader
        activeStep={activeStep}
        handleNext={handleNext}
        handleBack={handleBack}
        onPublishEvent={handlePublishEvent}
        isCreating={isCreating}
        hasGuests={eventData.guests?.length > 0}
        title="Create Event"
        publishButtonText="Create Event"
      />

      {activeStep === 0 && <Step1 mode="create" />}
      {activeStep === 1 && <Step2 mode="create" />}
      {activeStep === 2 && <Step3 mode="create" />}

      <InvitationConfirmationPopup
        isOpen={showInvitationPopup}
        onClose={() => setShowInvitationPopup(false)}
        onConfirm={handleInvitationConfirm}
        onCancel={handleInvitationCancel}
        guests={eventData.guests || []}
        loading={isCreating}
      />
    </>
  );
}

function EditEventContent() {
  return <EditEventContentInner />;
}

export default EditEventContent;
