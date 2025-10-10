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
import { useToast } from '@/providers/toast-provider';
import { AuthModal } from '@/components/common/auth-modal';
import { TemplateHeader, PublishOptionsPopup } from '../../components';
import InvitationConfirmationPopup from '../../components/InvitationConfirmationPopup';
import Step1 from '../../components/Step1';
import Step2 from '../../components/Step2';
import Step3 from '../../components/Step3';

function EditEventContent() {
  const router = useRouter();
  const { toastSuccess, toastError, toastWarning } = useToast();
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
  const [showPublishOptionsPopup, setShowPublishOptionsPopup] = useState(false);
  const [showInvitationPopup, setShowInvitationPopup] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [thumbnailData, setThumbnailData] = useState(null);
  const pixieEditorRef = useRef(null);

  // Load template data
  useEffect(() => {
    const loadTemplate = async () => {
      if (isRedirecting || !templateId) return;

      // Only skip loading if we already have data for this specific template
      if (eventData && eventData.templateId === templateId) return;

      try {
        const template = fetchTemplateById
          ? await fetchTemplateById(templateId).unwrap()
          : await dispatch(fetchTemplateByIdThunk(templateId)).unwrap();

        const templateData = template.data || template;

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
      } catch (error) {
        console.error('Error loading template:', error);
        toastError('Failed to load template. Please try again.');
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
        toastError('Editor not ready. Please try again.');
        return;
      }

      try {
        // Get thumbnail data and store in local state
        const thumbnailData = await pixieEditorRef.current.getThumbnailData();
        setThumbnailData(thumbnailData);

        const pixieState = JSON.parse(await pixieEditorRef.current.save());

        if (pixieState?.canvas?.objects?.length) {
          updateSelectedEvent({
            ...eventData,
            jsonContent: JSON.stringify(pixieState),
            imageThumbnail: pixieState.exportedImage || null,
          });
        }
      } catch (err) {
        console.error('Error saving design:', err);
        toastError('There was a problem saving your design. Please try again.');
        return;
      }
    }

    setActiveStep(activeStep + 1);
  };

  const handleBack = () => setActiveStep(activeStep - 1);

  const handlePublishEvent = () => {
    // Validate required fields
    if (!eventData.title || !eventData.startDateTime) {
      toastError('Please fill in all required fields (title and start date)');
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
      toastError('Please add at least one guest to create an event');
      return;
    }

    // Show publish options popup first
    setShowPublishOptionsPopup(true);
  };

  const handleSaveAsDraft = () => {
    // Update event status to DRAFT
    updateSelectedEvent({ status: 'DRAFT' });
    setShowPublishOptionsPopup(false);
    // Create event as draft without sending invitations
    createEvent(false, 'DRAFT');
  };

  const handlePublishConfirm = () => {
    // Update event status to PUBLISHED
    updateSelectedEvent({ status: 'PUBLISHED' });
    setShowPublishOptionsPopup(false);
    
    // Show invitation popup if there are guests
    if (eventData.guests && eventData.guests.length > 0) {
      setShowInvitationPopup(true);
    } else {
      // Create event without invitations
      createEvent(false, 'PUBLISHED');
    }
  };

  const createEvent = async (sendInvitations = false, status = 'PUBLISHED') => {
    setIsCreating(true);

    try {
      const hasChangedImage = eventData.newImageBase64;

      const requestData = {
        ...eventData,
        status: status, // Use the provided status
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
        // Upload thumbnail if available from local state
        if (thumbnailData) {
          try {
            const thumbnailResponse = await fetch(
              `/api/event/${result.data.event.id}/upload-thumbnail`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  imageBlob: thumbnailData.base64Data,
                  imageFormat: 'png',
                }),
              },
            );

            if (thumbnailResponse.ok) {
              const thumbnailResult = await thumbnailResponse.json();
              if (!thumbnailResult.success) {
                toastWarning('Event created but thumbnail upload failed');
              }
            } else {
              toastWarning('Event created but thumbnail upload failed');
            }
          } catch (thumbnailError) {
            console.error('Thumbnail upload failed:', thumbnailError);
            toastWarning('Event created but thumbnail upload failed');
          }
        }

        // Determine success message based on status and invitation settings
        let statusMessage;
        if (status === 'DRAFT') {
          statusMessage = 'Event saved as draft!';
        } else if (sendInvitations) {
          statusMessage = 'Event created and invitations sent successfully!';
        } else {
          statusMessage = 'Event created successfully!';
        }
        toastSuccess(statusMessage);

        addEventToStore(result.data.event);
        resetEventCreation();
        setIsRedirecting(true);
        router.push('/events');
      } else {
        throw new Error(result.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toastError('Failed to create event. Please try again.');
    } finally {
      setIsCreating(false);
      setShowInvitationPopup(false);
      setShowPublishOptionsPopup(false);
    }
  };

  const handleInvitationConfirm = () => createEvent(true, 'PUBLISHED');
  const handleInvitationCancel = () => createEvent(false, 'PUBLISHED');

  // Loading state
  if (!eventData || isTemplateLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">
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
        eventStatus={eventData.status}
      />

      {activeStep === 0 && (
        <Step1 mode="create" pixieEditorRef={pixieEditorRef} />
      )}
      {activeStep === 1 && (
        <Step2 mode="create" thumbnailData={thumbnailData} session={session} />
      )}
      {activeStep === 2 && <Step3 mode="create" />}

      <PublishOptionsPopup
        isOpen={showPublishOptionsPopup}
        onClose={() => setShowPublishOptionsPopup(false)}
        onSaveAsDraft={handleSaveAsDraft}
        onPublish={handlePublishConfirm}
        hasGuests={eventData.guests && eventData.guests.length > 0}
      />

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
