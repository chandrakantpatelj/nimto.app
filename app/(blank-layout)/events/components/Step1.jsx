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

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] h-full bg-gray-50">
      {/* Left Side - Full Size Pixie Editor */}
      

        {/* Pixie Editor Container */}
        <div className=" p-4">
          <div className="h-[830px] w-[96.5vw] rounded-lg overflow-hidden border border-gray-200 bg-white">
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
