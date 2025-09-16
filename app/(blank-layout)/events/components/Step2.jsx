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

function Step2() {
  const { selectedEvent: eventData } = useEvents();
  const { updateSelectedEvent: updateEventData } = useEventActions();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  
  // Get today's date to disable past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day

  return (
    <div className="flex min-h-[calc(100vh-var(--header-height))] h-full bg-gray-50">
      {/* Left Side - Preview */}
      <div className="flex-1 flex flex-col">
        {/* Preview Content */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="max-w-4xl mx-auto">
            {/* Template Preview */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Template Preview
              </h3>
              <div className="relative">
                {eventData.imagePath ? (
                  <div className="relative rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={eventData.imagePath}
                      alt="Template Preview"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div
                      className="absolute inset-0 bg-gray-100 flex items-center justify-center"
                      style={{ display: 'none' }}
                    >
                      <span className="text-gray-500 text-sm">
                        Template Image
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg border border-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 text-sm">
                      No template image
                    </span>
                  </div>
                )}
                <div className="mt-2 text-sm text-gray-500">
                  {eventData.title || 'Template Name'}
                </div>
              </div>
            </div>

            {/* Event Preview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Event Banner */}
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-purple-50">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900">
                      {eventData.title || 'Your Event Title'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {eventData.description ||
                        'Event description will appear here'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date & Time */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <CalendarDays className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">WHEN</p>
                      <p className="text-sm text-gray-600">
                        {eventData.date
                          ? format(new Date(eventData.date), 'PPP')
                          : 'Pick a date & time'}
                      </p>
                      {eventData.time && (
                        <p className="text-sm text-gray-500 mt-1">
                          {eventData.time}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        LOCATION
                      </p>
                      <p className="text-sm text-gray-600">
                        {eventData.location || 'Add a location'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Host Details */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <User className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        HOST DETAILS
                      </p>
                      <p className="text-sm text-purple-600 font-medium">
                        ajay Devakar
                      </p>
                    </div>
                  </div>
                </div>

                {/* Who's Coming */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Info className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        Who's coming
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      See all guests
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
        {/* Form Header */}
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Edit Invitation Details
          </h3>
          <p className="text-sm text-gray-500">
            Fill in your event information
          </p>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Event Title */}
            <div>
              <Label
                htmlFor="title"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                EVENT TITLE*
              </Label>
              <Input
                id="title"
                type="text"
                placeholder="Your event title"
                value={eventData.title || ''}
                onChange={(e) => updateEventData({ title: e.target.value })}
                className="w-full"
              />
            </div>

            {/* Date & Time */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                DATE & TIME*
              </Label>
              <div className="space-y-3">
                <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !eventData.date && 'text-muted-foreground',
                      )}
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      {eventData.date ? (
                        format(new Date(eventData.date), 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
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
                      }}
                      disabled={[{ before: today }]}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <TimeField
                  value={eventData.time || ''}
                  onChange={(time) => updateEventData({ time })}
                  placeholder="Pick a time"
                  className="w-full"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <Label
                htmlFor="location"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                LOCATION
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="location"
                  type="text"
                  placeholder="Add a location"
                  value={eventData.location || ''}
                  onChange={(e) =>
                    updateEventData({ location: e.target.value })
                  }
                  className="pl-10"
                />
              </div>
            </div>

            {/* Host Note */}
            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700 mb-2 block"
              >
                HOST NOTE
              </Label>
              <Textarea
                id="description"
                placeholder="Consider adding parking info, contact number, venue requirements, dress code, entertainment schedule, etc."
                value={eventData.description || ''}
                onChange={(e) =>
                  updateEventData({ description: e.target.value })
                }
                className="w-full min-h-[100px] resize-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Step2;
