import React, { useRef } from 'react';
import { useParams } from 'next/navigation';
import { useEvents } from '@/store/hooks';
import PixieEditor from '@/components/image-editor/PixieEditor';

function Step1({ mode = 'create', pixieEditorRef: externalPixieRef }) {
  const params = useParams();
  const templateId = params.id;
  const eventId = params.eventId; // For edit mode

  // Use external ref if provided (edit mode), otherwise create local ref (create mode)
  const localPixieEditorRef = useRef(null);
  const pixieEditorRef = externalPixieRef || localPixieEditorRef;
  const { selectedEvent: eventData } = useEvents();

  // Get image URL directly from event data
  const imageUrl = eventData?.s3ImageUrl || eventData?.imagePath || '';
  
  // Debug logging
  console.log('Step1 - Event Data:', {
    templateId,
    eventId,
    s3ImageUrl: eventData?.s3ImageUrl,
    imagePath: eventData?.imagePath,
    finalImageUrl: imageUrl,
    hasJsonContent: !!eventData?.jsonContent,
    jsonContentType: typeof eventData?.jsonContent,
    jsonContentPreview: eventData?.jsonContent ? 
      (typeof eventData.jsonContent === 'string' ? 
        eventData.jsonContent.substring(0, 200) : 
        JSON.stringify(eventData.jsonContent).substring(0, 200)) : null
  });

  // Parse and log content structure if available
  if (eventData?.jsonContent) {
    try {
      const content = typeof eventData.jsonContent === 'string' 
        ? JSON.parse(eventData.jsonContent) 
        : eventData.jsonContent;
      
      console.log('Step1 - Template content structure:', {
        hasCanvas: !!content.canvas,
        objectCount: content.canvas?.objects?.length || 0,
        objectTypes: content.canvas?.objects?.map(obj => `${obj.type}(${obj.text || obj.name || 'unnamed'})`) || []
      });
    } catch (e) {
      console.warn('Step1 - Failed to parse jsonContent:', e);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] h-full bg-background">
      {/* Left Side - Full Size Pixie Editor */}

      {/* Pixie Editor Container */}
      <div className=" p-4">
        <div className="h-[830px] w-[96.5vw] rounded-lg overflow-hidden border border-border bg-card">
          <PixieEditor
            key={`pixie-${eventId || templateId}`}
            ref={pixieEditorRef}
            initialContent={eventData?.jsonContent}
            initialImageUrl={imageUrl}
            width="100%"
            height="830px"
          />
        </div>
      </div>
    </div>
  );
}

export default Step1;
