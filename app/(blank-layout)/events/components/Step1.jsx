import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { useEventActions, useEvents } from '@/store/hooks';
import PixieEditor from '@/components/image-editor/PixieEditor';

function Step1({ mode = 'create', pixieEditorRef: externalPixieRef }) {
  const params = useParams();
  const templateId = params.id;
  const eventId = params.eventId; // For edit mode

  // Use external ref if provided (edit mode), otherwise create local ref (create mode)
  const localPixieEditorRef = useRef(null);
  const pixieEditorRef = externalPixieRef || localPixieEditorRef;
  const { selectedEvent: eventData } = useEvents();

  const [templateLoading, setTemplateLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState('');

  // Initialize with existing event data if in edit mode
  useEffect(() => {
    if (eventData && eventData.s3ImageUrl) {
      setImageUrl(eventData.s3ImageUrl);
    }
    setTemplateLoading(false);
  }, [eventData]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Side - Full Size Pixie Editor */}
      <div className="flex-1 flex flex-col">
        {/* Header */}

        {/* Pixie Editor Container */}
        <div className="flex-1 p-4">
          {templateLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
                <p className="text-gray-600">
                  {mode === 'edit' ? 'Loading event...' : 'Loading template...'}
                </p>
              </div>
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}

export default Step1;
