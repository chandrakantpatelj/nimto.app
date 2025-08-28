'use client';

import React, { createContext, useContext, useState } from 'react';

const EventCreationContext = createContext();

export function EventCreationProvider({ children }) {
  const [eventData, setEventData] = useState({
    // Step 1: Event Details
    title: '',
    description: '',
    date: null,
    time: '',
    location: '',

    // Step 1: Design Data
    templateId: '',
    jsonContent: '',
    backgroundStyle: '{}', // Always store as JSON string
    htmlContent: '',
    background: '#FFFFFF',
    pageBackground: '#e2e8f0',
    imagePath: '',
    newImageBase64: null, // Store base64 data for new uploaded images

    // Step 3: Guests
    guests: [],
  });

  const [currentStep, setCurrentStep] = useState(0);

  const updateEventData = (updates) => {
    setEventData((prev) => ({ ...prev, ...updates }));
  };

  const addGuest = (guest) => {
    setEventData((prev) => ({
      ...prev,
      guests: [...prev.guests, { ...guest, id: Date.now() }],
    }));
  };

  const removeGuest = (guestId) => {
    setEventData((prev) => ({
      ...prev,
      guests: prev.guests.filter((guest) => guest.id !== guestId),
    }));
  };

  const clearGuests = () => {
    setEventData((prev) => ({ ...prev, guests: [] }));
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1);
  };

  const resetEventData = () => {
    setEventData({
      title: '',
      description: '',
      date: null,
      time: '',
      location: '',
      templateId: '',
      jsonContent: '',
      backgroundStyle: '{}', // Always store as JSON string
      htmlContent: '',
      background: '#FFFFFF',
      pageBackground: '#e2e8f0',
      imagePath: '',
      newImageBase64: null,
      guests: [],
    });
    setCurrentStep(0);
  };

  const value = {
    eventData,
    currentStep,
    updateEventData,
    addGuest,
    removeGuest,
    clearGuests,
    nextStep,
    prevStep,
    resetEventData,
  };

  return (
    <EventCreationContext.Provider value={value}>
      {children}
    </EventCreationContext.Provider>
  );
}

export function useEventCreation() {
  const context = useContext(EventCreationContext);
  if (!context) {
    throw new Error(
      'useEventCreation must be used within an EventCreationProvider',
    );
  }
  return context;
}
