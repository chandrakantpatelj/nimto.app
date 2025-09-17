'use client';

import React, { useState } from 'react';
import { useEventActions, useEvents } from '@/store/hooks';
import { format } from 'date-fns';
import { CalendarDays, Info, MapPin, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { TimeField } from '@/components/ui/datefield';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

function Step2({ thumbnailData }) {
  const { selectedEvent: eventData } = useEvents();
  const { updateSelectedEvent: updateEventData } = useEventActions();
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  // Function to scroll left side to show event details card
  const scrollToEventDetails = () => {
    const eventDetailsCard = document.querySelector('.event-details-card');
    if (eventDetailsCard) {
      eventDetailsCard.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  };

  // Get today's date to disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day

  return (
    <div className="flex h-[calc(100vh-var(--header-height))] bg-gray-50">
      {/* Left Side - Preview */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Preview Content */}
        <div className="flex-1 p-4 md:p-6 overflow-y-auto overflow-x-hidden">
          <div className="max-w-5xl mx-auto">
            {/* Template Preview */}
            <div className="mb-8">
              {/* <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Template Preview
                </h3>
              </div> */}
              <div className="relative">
                {thumbnailData?.objectUrl || eventData.s3ImageUrl ? (
                  <div className="flex justify-center items-center bg-gray-50">
                    <div className="max-w-lg w-full">
                      <img
                        src={thumbnailData?.objectUrl || eventData.s3ImageUrl}
                        alt="Event Design Preview"
                        className="w-full h-auto object-contain shadow-lg rounded-lg max-h-[80vh]"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div
                        className="hidden bg-gray-100 rounded-lg p-8 text-center"
                        style={{ display: 'none' }}
                      >
                        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                          <svg
                            className="w-8 h-8 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                        <span className="text-gray-500 text-sm font-medium">
                          Event Design Preview
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-[400px] bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-10 h-10 text-blue-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-700 mb-2">
                        No Preview Available
                      </h4>
                      <p className="text-sm text-gray-500">
                        Your event design will appear here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event Preview Card */}
            <div className="event-details-card bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Event Banner */}
              <div className="relative h-56 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-xl">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {eventData.title || 'Your Event Title'}
                    </h2>
                    <p className="text-gray-600 leading-relaxed">
                      {eventData.description ||
                        'Event description will appear here'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6 md:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                  {/* Date & Time */}
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-blue-100 rounded-xl shadow-sm">
                      <CalendarDays className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
                        When
                      </p>
                      <p className="text-base text-gray-900 font-medium">
                        {eventData.date
                          ? format(
                              new Date(eventData.date),
                              'EEEE, MMMM do, yyyy',
                            )
                          : 'Pick a date & time'}
                      </p>
                      {eventData.time && (
                        <p className="text-sm text-gray-600 mt-1 font-medium">
                          {eventData.time}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-green-100 rounded-xl shadow-sm">
                      <MapPin className="w-5 h-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
                        Location
                      </p>
                      <p className="text-base text-gray-900 font-medium">
                        {eventData.location || 'Add a location'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Host Details */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 rounded-xl shadow-sm">
                      <User className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-1">
                        Host Details
                      </p>
                      <p className="text-base text-purple-600 font-semibold">
                        ajay Devakar
                      </p>
                    </div>
                  </div>
                </div>

                {/* Who's Coming */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <Info className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-sm font-semibold text-gray-700">
                        Who's coming
                      </span>
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      See all guests
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-96 xl:w-[420px] bg-white border-t lg:border-t-0 lg:border-l border-gray-200 flex flex-col overflow-hidden">
        {/* Form Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Edit Invitation Details
          </h3>
          <p className="text-sm text-gray-600">
            Fill in your event information
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-6">
          <div className="space-y-6">
            {/* Event Title */}
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-semibold text-gray-800 mb-3 block"
              >
                Event Title *
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter your event title"
                value={eventData.title || ''}
                onChange={(e) => {
                  updateEventData({ title: e.target.value });
                  // Scroll to show event details card after a short delay
                  setTimeout(() => scrollToEventDetails(), 100);
                }}
                className="w-full h-12 px-4 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
              />
            </div>

            {/* Date & Time */}
            <div>
              <Label className="text-sm font-semibold text-gray-800 mb-3 block">
                Date & Time *
              </Label>
              <div className="space-y-4">
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full h-12 justify-start text-left font-normal border-gray-300 hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500 rounded-lg',
                        !eventData.date && 'text-gray-500',
                      )}
                    >
                      <CalendarDays className="mr-3 h-5 w-5" />
                      {eventData.date ? (
                        format(new Date(eventData.date), 'PPP')
                      ) : (
                        <span>Select a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 shadow-xl border-0 rounded-xl"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={
                        eventData.date ? new Date(eventData.date) : undefined
                      }
                      onSelect={(date) => {
                        updateEventData({
                          date: date ? date.toISOString() : null,
                        });
                        setDatePickerOpen(false);
                        // Scroll to show event details card after date selection
                        setTimeout(() => scrollToEventDetails(), 200);
                      }}
                      disabled={[{ before: today }]}
                      initialFocus
                      className="rounded-xl"
                    />
                  </PopoverContent>
                </Popover>

                <TimeField
                  value={eventData.time || ''}
                  onChange={(time) => {
                    updateEventData({ time });
                    // Scroll to show event details card after time selection
                    setTimeout(() => scrollToEventDetails(), 100);
                  }}
                  placeholder="Select time"
                  className="w-full h-12"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label
                htmlFor="location"
                className="text-sm font-semibold text-gray-800 mb-3 block"
              >
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="location"
                  type="text"
                  placeholder="Add event location"
                  value={eventData.location || ''}
                  onChange={(e) => {
                    updateEventData({ location: e.target.value });
                    // Scroll to show event details card after location change
                    setTimeout(() => scrollToEventDetails(), 100);
                  }}
                  className="w-full h-12 pl-12 pr-4 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                />
              </div>
            </div>

            {/* Host Note */}
            <div>
              <Label
                htmlFor="description"
                className="text-sm font-semibold text-gray-800 mb-3 block"
              >
                Host Note
              </Label>
              <Textarea
                id="description"
                placeholder="Add additional details like parking info, contact number, venue requirements, dress code, entertainment schedule, etc."
                value={eventData.description || ''}
                onChange={(e) => {
                  updateEventData({ description: e.target.value });
                  // Scroll to show event details card after description change
                  setTimeout(() => scrollToEventDetails(), 100);
                }}
                className="w-full min-h-[120px] resize-none text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg p-4"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step2;
