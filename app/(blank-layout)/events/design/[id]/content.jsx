'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { showCustomToast } from '@/components/common/custom-toast';
import { TemplateHeader } from '../../components';
import InvitationConfirmationPopup from '../../components/InvitationConfirmationPopup';
import Step1 from '../../components/Step1';
import Step2 from '../../components/Step2';
import Step3 from '../../components/Step3';
import {
  EventCreationProvider,
  useEventCreation,
} from '../../context/EventCreationContext';

function EditEventContentInner() {
  const router = useRouter();
  const { data: session } = useSession();
  const { currentStep, nextStep, prevStep, eventData } = useEventCreation();
  const [showInvitationPopup, setShowInvitationPopup] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleNext = async () => {
    const saveFunction = window.pixieSaveFunction;

    if (saveFunction) {
      try {
        await saveFunction();
      } catch (error) {
        console.error('Failed to save Pixie content:', error);
        // Optionally show user feedback
      }
    }
    nextStep();
  };

  const handleBack = () => {
    prevStep();
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
    if (eventData.guests.length === 0) {
      showCustomToast(
        'Please add at least one guest to create an event',
        'error',
      );
      return;
    }

    // Show invitation confirmation popup if there are guests
    if (eventData.guests.length > 0) {
      setShowInvitationPopup(true);
    } else {
      // Create event without invitations
      createEvent(false);
    }
  };

  const createEvent = async (sendInvitations = false) => {
    setIsCreating(true);
    console.log('eventData', eventData);
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
        guests: eventData.guests.map((guest) => ({
          name: guest.name,
          contact: guest.contact,
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

  return (
    <>
      <TemplateHeader
        activeStep={currentStep}
        handleNext={handleNext}
        handleBack={handleBack}
        onPublishEvent={handlePublishEvent}
        isCreating={isCreating}
        hasGuests={eventData.guests.length > 0}
        title="Create Event"
        publishButtonText="Create Event"
      />

      {currentStep === 0 && <Step1 />}
      {currentStep === 1 && <Step2 />}
      {currentStep === 2 && <Step3 />}

      <InvitationConfirmationPopup
        isOpen={showInvitationPopup}
        onClose={() => setShowInvitationPopup(false)}
        onConfirm={handleInvitationConfirm}
        onCancel={handleInvitationCancel}
        guests={eventData.guests}
        loading={isCreating}
      />
    </>
  );
}

function EditEventContent() {
  return (
    <EventCreationProvider>
      <EditEventContentInner />
    </EventCreationProvider>
  );
}

export default EditEventContent;
