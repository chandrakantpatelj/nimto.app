import React from 'react';
import { EventCreationProvider } from '../context/EventCreationContext';
import EditEventContent from './content';

function EditEvent() {
  return (
    <EventCreationProvider>
      <EditEventContent />
    </EventCreationProvider>
  );
}

export default EditEvent;
