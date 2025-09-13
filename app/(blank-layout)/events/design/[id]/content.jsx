'use client';

import { useEffect, useRef, useState } from 'react';
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
import { AuthModal } from '@/components/common/auth-modal';
import { TemplateHeader } from '../../components';
import InvitationConfirmationPopup from '../../components/InvitationConfirmationPopup';
import Step1 from '../../components/Step1';
import Step2 from '../../components/Step2';
import Step3 from '../../components/Step3';

function EditEventContent() {
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
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const pixieEditorRef = useRef(null);

  // Load template data
  useEffect(() => {
    const loadTemplate = async () => {
      if (isRedirecting || eventData || !templateId) return;

      try {
        const template = fetchTemplateById
          ? await fetchTemplateById(templateId).unwrap()
          : await dispatch(fetchTemplateByIdThunk(templateId)).unwrap();

        const templateData = template.data || template;

        setSelectedEvent({
          title: templateData.name,
          templateId: templateData.id,
          description: '',
          date: '',
          time: '',
          location: '',
          status: 'DRAFT',
          guests: [],
          jsonContent: templateData.jsonContent,
          backgroundStyle: null,
          htmlContent: null,
          background: null,
          pageBackground: templateData.pageBackground,
          imagePath: templateData.imagePath,
          s3ImageUrl: templateData.s3ImageUrl,
          newImageBase64: null,
        });
      } catch (error) {
        showCustomToast('Failed to load template. Please try again.', 'error');
      }
    };

    loadTemplate();
  }, [
    eventData?.id, // Only depend on eventData.id instead of the entire object
    templateId,
    fetchTemplateById,
    setSelectedEvent,
    dispatch,
    isRedirecting,
  ]);

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
    if (!eventData.title || !eventData.date) {
      showCustomToast(
        'Please fill in all required fields (title and date)',
        'error',
      );
      return;
    }

    // Check if user is authenticated
    if (!session?.user?.id) {
      // Store current path for redirect after sign in
      const currentPath = `/events/design/${templateId}`;
      const returnUrl = encodeURIComponent(currentPath);
      
      // Redirect to sign in with return URL
      router.push(`/signin?callbackUrl=${returnUrl}`);
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
      const hasChangedImage = eventData.newImageBase64;

      const requestData = {
        ...eventData,
        sendInvitations,
        guests: (eventData.guests || []).map((guest) => ({
          name: guest.name,
          contact: guest.email || guest.phone || guest.contact,
        })),
        templateImagePath: hasChangedImage ? null : eventData.imagePath,
        newImageData: hasChangedImage ? eventData.newImageBase64 : null,
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

        addEventToStore(result.data.event);
        resetEventCreation();
        setIsRedirecting(true);
        router.push('/events');
      } else {
        throw new Error(result.error || 'Failed to create event');
      }
    } catch (error) {
      showCustomToast('Failed to create event. Please try again.', 'error');
    } finally {
      setIsCreating(false);
      setShowInvitationPopup(false);
    }
  };

  const handleInvitationConfirm = () => createEvent(true);
  const handleInvitationCancel = () => createEvent(false);

  // Loading state
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

      {activeStep === 0 && (
        <Step1 mode="create" pixieEditorRef={pixieEditorRef} />
      )}
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

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        mode="signin"
      />
    </>
  );
}

export default EditEventContent;
