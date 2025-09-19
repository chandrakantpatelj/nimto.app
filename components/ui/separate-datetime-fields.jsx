'use client';

import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const SeparateDateTimeFields = ({
  startValue,
  endValue,
  onStartChange,
  onEndChange,
  disabled = false,
  className,
}) => {
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  const [startSelectedDate, setStartSelectedDate] = useState(
    startValue ? new Date(startValue) : null,
  );
  const [startTimeValue, setStartTimeValue] = useState(
    startValue ? format(new Date(startValue), 'HH:mm') : '',
  );

  const [endSelectedDate, setEndSelectedDate] = useState(
    endValue ? new Date(endValue) : null,
  );
  const [endTimeValue, setEndTimeValue] = useState(
    endValue ? format(new Date(endValue), 'HH:mm') : '',
  );

  // Sync internal state with props when they change
  useEffect(() => {
    if (startValue) {
      setStartSelectedDate(new Date(startValue));
      setStartTimeValue(format(new Date(startValue), 'HH:mm'));
    } else {
      setStartSelectedDate(null);
      setStartTimeValue('');
    }
  }, [startValue]);

  useEffect(() => {
    if (endValue) {
      setEndSelectedDate(new Date(endValue));
      setEndTimeValue(format(new Date(endValue), 'HH:mm'));
    } else {
      setEndSelectedDate(null);
      setEndTimeValue('');
    }
  }, [endValue]);

  // Generate time slots in 15-minute intervals
  const timeSlots = Array.from({ length: 96 }, (_, i) => {
    const hours = Math.floor(i / 4);
    const minutes = (i % 4) * 15;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  });

  // Format time for display (12-hour format)
  const formatTimeDisplay = (time24) => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Convert 12-hour to 24-hour format
  const convertTo24Hour = (time12) => {
    if (!time12) return '';
    const [time, period] = time12.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours, 10);

    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, '0')}:${minutes}`;
  };

  // Handle start date selection
  const handleStartDateSelect = (date) => {
    if (date) {
      setStartSelectedDate(date);
      // Set default time if no time is selected
      if (!startTimeValue) {
        setStartTimeValue('12:00');
      }
      // Create datetime with current time or default time
      const [hours, minutes] = startTimeValue
        ? startTimeValue.split(':')
        : ['12', '00'];
      const newDateTime = new Date(date);
      newDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      onStartChange(newDateTime);
      setStartOpen(false); // Close popup after date selection
    }
  };

  // Handle start time selection
  const handleStartTimeSelect = (time) => {
    setStartTimeValue(time);
    // Use today's date if no date is selected yet
    const dateToUse = startSelectedDate || new Date();
    const [hours, minutes] = time.split(':');
    const newDateTime = new Date(dateToUse);
    newDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    onStartChange(newDateTime);
    setStartOpen(false); // Close popup after time selection
  };

  // Handle end date selection
  const handleEndDateSelect = (date) => {
    if (date) {
      setEndSelectedDate(date);
      // Set default time if no time is selected
      if (!endTimeValue) {
        setEndTimeValue('12:00');
      }
      // Create datetime with current time or default time
      const [hours, minutes] = endTimeValue
        ? endTimeValue.split(':')
        : ['12', '00'];
      const newDateTime = new Date(date);
      newDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
      onEndChange(newDateTime);
      setEndOpen(false); // Close popup after date selection
    }
  };

  // Handle end time selection
  const handleEndTimeSelect = (time) => {
    setEndTimeValue(time);
    // Use today's date if no date is selected yet
    const dateToUse = endSelectedDate || new Date();
    const [hours, minutes] = time.split(':');
    const newDateTime = new Date(dateToUse);
    newDateTime.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    onEndChange(newDateTime);
    setEndOpen(false); // Close popup after time selection
  };

  // Handle custom time input
  const handleCustomTime = (inputTime, isStart = true) => {
    const time24 = convertTo24Hour(inputTime);
    if (time24 && /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time24)) {
      if (isStart) {
        handleStartTimeSelect(time24);
      } else {
        handleEndTimeSelect(time24);
      }
    }
  };

  // Handle clearing start date/time
  const handleClearStart = () => {
    setStartSelectedDate(null);
    setStartTimeValue(null);
    onStartChange(null);
  };

  // Handle clearing end date/time
  const handleClearEnd = () => {
    setEndSelectedDate(null);
    setEndTimeValue(null);
    onEndChange(null);
  };

  // Get today's date for disabling past dates
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Date Time Picker Content Component
  const DateTimePickerContent = ({
    selectedDate,
    onDateSelect,
    timeValue,
    onTimeSelect,
    onCustomTime,
    title,
  }) => (
    <div className="flex bg-white rounded-lg shadow-xl border border-gray-200 max-w-[95vw] sm:max-w-none">
      {/* Calendar Section */}
      <div className="border-r border-gray-200">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onDateSelect}
          disabled={[{ before: today }]}
          initialFocus
          className="rounded-l-lg w-64 sm:w-auto"
        />
      </div>

      {/* Time Selection Section */}
      <div className="w-64 sm:w-72 p-4 sm:p-4">
        <div className="space-y-4 sm:space-y-4">
          {/* Header */}
          <div>
            <h3 className="text-base sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">
              {title}
            </h3>

            {/* Time Slots - Scrollable (Limited to calendar height) */}
            <div className="h-48 sm:h-48 overflow-y-auto space-y-1 pr-2 sm:pr-2">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  className={cn(
                    'w-full text-left px-2 sm:px-2 py-1.5 sm:py-1.5 rounded-lg text-xs sm:text-xs font-medium transition-all duration-200',
                    'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1',
                    timeValue === time
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'text-gray-700 hover:text-gray-900',
                  )}
                  onClick={() => onTimeSelect(time)}
                >
                  {formatTimeDisplay(time)}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Time Input */}
          <div className="pt-2 sm:pt-3 border-t border-gray-200">
            <Label className="text-xs sm:text-xs font-medium text-gray-600 mb-1 sm:mb-2 block">
              Custom time
            </Label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="e.g., 2:30 PM"
                className="h-8 sm:h-8 text-xs sm:text-xs border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onCustomTime(e.target.value);
                  }
                }}
              />
              <Button
                size="sm"
                className="h-8 sm:h-8 px-2 sm:px-3 text-xs sm:text-xs bg-purple-600 hover:bg-purple-700 text-white border-0"
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  onCustomTime(input.value);
                }}
              >
                Set
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Start Date Field */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-900">
          Start Date <span className="text-red-500">*</span>
        </Label>
        <div className="flex items-center space-x-3">
          {/* Date Time Field */}
          <Popover open={startOpen} onOpenChange={setStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'flex-1 h-12 justify-start text-left font-normal',
                  'border-gray-300 hover:border-purple-500 hover:bg-purple-50',
                  'focus:border-purple-500 focus:ring-2 focus:ring-purple-500 focus:ring-offset-1',
                  'transition-all duration-200',
                  !startValue && 'text-gray-500',
                  startValue && 'text-gray-900 border-purple-200 bg-purple-50',
                  className,
                )}
                disabled={disabled}
              >
                {startValue ? (
                  <>
                    <span className="font-medium">
                      {format(new Date(startValue), 'MMMM d, yyyy')}
                    </span>
                    <span className="text-gray-600 ml-2">
                      ,{' '}
                      {formatTimeDisplay(format(new Date(startValue), 'HH:mm'))}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">
                    Pick start date and time
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 z-50"
              align="center"
              side="bottom"
              sideOffset={5}
              alignOffset={0}
            >
              <DateTimePickerContent
                selectedDate={startSelectedDate}
                onDateSelect={handleStartDateSelect}
                timeValue={startTimeValue}
                onTimeSelect={handleStartTimeSelect}
                onCustomTime={(time) => handleCustomTime(time, true)}
                title="Start Time"
              />
            </PopoverContent>
          </Popover>

          {/* Clear Button */}
          {startValue && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearStart}
              className="h-12 px-3 text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
              title="Clear start date and time"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* End Date Field */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-900">
          End Date <span className="text-gray-500 font-normal">(Optional)</span>
        </Label>
        <div className="flex items-center space-x-3">
          {/* Date Time Field */}
          <Popover open={endOpen} onOpenChange={setEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'flex-1 h-12 justify-start text-left font-normal',
                  'border-gray-300 hover:border-green-500 hover:bg-green-50',
                  'focus:border-green-500 focus:ring-2 focus:ring-green-500 focus:ring-offset-1',
                  'transition-all duration-200',
                  !endValue && 'text-gray-500',
                  endValue && 'text-gray-900 border-green-200 bg-green-50',
                  className,
                )}
                disabled={disabled}
              >
                {endValue ? (
                  <>
                    <span className="font-medium">
                      {format(new Date(endValue), 'MMMM d, yyyy')}
                    </span>
                    <span className="text-gray-600 ml-2">
                      , {formatTimeDisplay(format(new Date(endValue), 'HH:mm'))}
                    </span>
                  </>
                ) : (
                  <span className="text-gray-500">
                    Pick end date and time (optional)
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 z-50"
              align="center"
              side="bottom"
              sideOffset={5}
              alignOffset={0}
            >
              <DateTimePickerContent
                selectedDate={endSelectedDate}
                onDateSelect={handleEndDateSelect}
                timeValue={endTimeValue}
                onTimeSelect={handleEndTimeSelect}
                onCustomTime={(time) => handleCustomTime(time, false)}
                title="End Time"
              />
            </PopoverContent>
          </Popover>

          {/* Clear Button */}
          {endValue && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearEnd}
              className="h-12 px-3 text-gray-400 hover:text-red-600 hover:border-red-300 hover:bg-red-50 transition-all duration-200"
              title="Clear end date and time"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export { SeparateDateTimeFields };
