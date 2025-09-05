'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useEventActions, useEvents } from '@/store/hooks';
import { showCustomToast } from '@/components/common/custom-toast';
import { TemplateHeader } from '../components';
import InvitationPopup from '../components/InvitationPopup';
import Step1 from '../components/Step1';
import Step2 from '../components/Step2';
import Step3 from '../components/Step3';

function EditEventContent() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId;
  const { selectedEvent: eventData } = useEvents();
  const {
    updateSelectedEvent: updateEventData,
    resetEventCreation: resetEventData,
    updateEventInStore,
    fetchEventById,
    setSelectedEvent,
  } = useEventActions();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInvitationPopup, setShowInvitationPopup] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load existing event data
  useEffect(() => {
    if (eventId && !eventData) {
      fetchEventData();
    } else if (eventData) {
      setLoading(false);
    }
  }, [eventId, eventData]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      const event = await fetchEventById(eventId).unwrap();

      setSelectedEvent(event);
    } catch (err) {
      console.error('Error fetching event:', err);
      const errorMessage = err.message || 'Error loading event data';
      setError(errorMessage);
      showCustomToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

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
          updateEventData({ jsonContent: currentState });
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
        title: eventData.title,
        description: eventData.description,
        date: eventData.date,
        time: eventData.time,
        location: eventData.location,
        templateId: eventData.templateId,
        jsonContent: eventData.jsonContent,
        backgroundStyle: eventData.backgroundStyle,
        htmlContent: eventData.htmlContent,
        background: eventData.background,
        pageBackground: eventData.pageBackground,
        imagePath: eventData.imagePath,
        newImageData: eventData.newImageBase64,
        status: eventData.status,
        invitationType, // 'all', 'new', or null
        guests: eventData.guests || [], // Include guests data
      };

      console.log('Frontend Debug - Request Body:', {
        invitationType,
        guests: requestBody.guests.map((g) => ({
          id: g.id,
          name: g.name,
          email: g.email,
          isNew: g.isNew,
        })),
      });

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
        resetEventData();

        showCustomToast(message, 'success');
        router.push('/events');
      } else {
        showCustomToast(data.error || 'Failed to update event', 'error');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      showCustomToast('An error occurred while updating the event', 'error');
    } finally {
      setIsUpdating(false);
      setShowInvitationPopup(false);
    }
  };

  const handleSendToAll = () => {
    performEventUpdate('all');
  };

  const handleSendToNew = () => {
    performEventUpdate('new');
  };

  const handleUpdateOnly = () => {
    performEventUpdate();
  };

  const handleClosePopup = () => {
    if (!isUpdating) {
      setShowInvitationPopup(false);
    }
  };

  if (loading) {
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

  // Safety check - ensure eventData is loaded
  if (!eventData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event data...</p>
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

      {activeStep === 0 && <Step1 mode="edit" />}
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
    </>
  );
}

export default EditEventContent;
