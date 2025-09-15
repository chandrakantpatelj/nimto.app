'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEventActions, useEvents } from '@/store/hooks';
import { useToast } from '@/providers/toast-provider';
import { AuthModal } from '@/components/common/auth-modal';
import { TemplateHeader } from '../components';
import InvitationPopup from '../components/InvitationPopup';
import Step1 from '../components/Step1';
import Step2 from '../components/Step2';
import Step3 from '../components/Step3';

function EditEventContent() {
  const params = useParams();
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();
  const eventId = params.eventId;
  const { data: session } = useSession();
  const { selectedEvent: eventData } = useEvents();
  const {
    updateSelectedEvent,
    resetEventCreation,
    updateEventInStore,
    fetchEventById,
    setSelectedEvent,
  } = useEventActions();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvitationPopup, setShowInvitationPopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const pixieEditorRef = useRef(null);
  const hasLoadedRef = useRef(false);

  const fetchEventData = useCallback(async () => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;
    
    try {
      setLoading(true);
      setError(null);

      const event = await fetchEventById(eventId).unwrap();

      setSelectedEvent(event);
    } catch (err) {
      const errorMessage = err.message || 'Error loading event data';
      setError(errorMessage);
      toastError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [eventId, fetchEventById, setSelectedEvent]);

  // Load existing event data
  useEffect(() => {
    if (eventId && !eventData && !hasLoadedRef.current) {
      fetchEventData();
    } else if (eventData) {
      setLoading(false);
    }
  }, [eventId, eventData?.id, fetchEventData]);

  const handleNext = async () => {
    // Only check Pixie editor readiness if we're on step 0 (design step)
    if (activeStep === 0) {
      // Check if user is authenticated when moving from step 0 to step 1
      if (!session?.user?.id) {
        // Show auth modal instead of redirecting
        setShowAuthModal(true);
        return;
      }

      if (!pixieEditorRef.current?.save) {
        toastError('Editor not ready. Please try again.');
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
        toastError('There was a problem saving your design. Please try again.');
        return;
      }
    }

    setActiveStep(activeStep + 1);
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  // Check if there are new guests added
  const getNewGuestsCount = () => {
    if (!eventData.originalGuests || eventData.originalGuests.length === 0) {
      // If no original guests, all current guests are considered new
      return eventData.guests?.length || 0;
    }

    const originalGuestIds = new Set(eventData.originalGuests.map((g) => g.id));
    const newGuests = (eventData.guests || []).filter(
      (guest) => !originalGuestIds.has(guest.id),
    );
    return newGuests.length;
  };

  const handleUpdateEvent = async () => {
    const newGuestsCount = getNewGuestsCount();

    // Always show the popup if there are any guests
    if (eventData.guests && eventData.guests.length > 0) {
      setShowInvitationPopup(true);
      return;
    }

    // No guests, proceed with normal update
    await performEventUpdate();
  };

  const performEventUpdate = async (invitationType = null) => {
    try {
      setIsUpdating(true);

      const requestBody = {
        ...eventData,
        invitationType,
        guests: eventData.guests || [],
      };

      const response = await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success) {
        let message = 'Event updated successfully';
        if (invitationType === 'all') {
          message = `Event updated successfully and invitations sent to all ${eventData.guests?.length || 0} guests`;
        } else if (invitationType === 'new') {
          const newGuestsCount = getNewGuestsCount();
          message = `Event updated successfully and invitations sent to ${newGuestsCount} new guests`;
        }

        // Update Redux store with the updated event data
        updateEventInStore(data.data);

        // Clear selectedEvent from store after successful update
        resetEventCreation();

        toastSuccess(message);
        router.push('/events');
      } else {
        toastError(data.error || 'Failed to update event');
      }
    } catch (error) {
      toastError('An error occurred while updating the event');
    } finally {
      setIsUpdating(false);
      setShowInvitationPopup(false);
    }
  };

  const handleSendToAll = () => performEventUpdate('all');
  const handleSendToNew = () => performEventUpdate('new');
  const handleUpdateOnly = () => performEventUpdate();

  const handleClosePopup = () => !isUpdating && setShowInvitationPopup(false);

  // Loading and error states
  if (loading || !eventData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchEventData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
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
        onPublishEvent={handleUpdateEvent}
        isCreating={isUpdating}
        hasGuests={eventData.guests?.length > 0}
        title="Edit Event"
        publishButtonText="Update Event"
        isEditMode={true}
      />

      {activeStep === 0 && (
        <Step1 mode="edit" pixieEditorRef={pixieEditorRef} />
      )}
      {activeStep === 1 && <Step2 mode="edit" />}
      {activeStep === 2 && <Step3 mode="edit" />}

      <InvitationPopup
        isOpen={showInvitationPopup}
        onClose={handleClosePopup}
        onSendToAll={handleSendToAll}
        onSendToNew={handleSendToNew}
        onUpdateOnly={handleUpdateOnly}
        newGuestsCount={getNewGuestsCount()}
        totalGuestsCount={eventData.guests?.length || 0}
        isLoading={isUpdating}
      />

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="signin"
      />
    </>
  );
}

export default EditEventContent;
