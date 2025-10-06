import React, { useState } from 'react';
import { Bell, Send, Trash2, UserPlus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PhoneInput from '@/components/ui/phone-input';
import { ConfirmationDialog } from './confirmation-dialog';

function ManageGuestForm({
  event,
  onGuestAdded,
  searchQuery,
  onSearchChange,
  guests,
  selectedGuests,
  onSelectedGuestsChange,
}) {
  // Debug log to verify new component is loading
  console.log('🚀 NEW ManageGuestForm component loaded with country dropdown!');

  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    guestCount: 0,
  });
  const { toastSuccess, toastError, toastWarning } = useToast();

  // Calculate counts
  const unsentCount = guests.filter((guest) => !guest.invitedAt).length;
  const reminderCount = guests.filter(
    (guest) => guest.invitedAt && (guest.status === 'PENDING' || !guest.status),
  ).length;

  const handleAddGuest = async () => {
    if (!guestName.trim()) {
      toastWarning('Please enter guest name');
      return;
    }

    if (!guestEmail.trim() && !guestPhone.trim()) {
      toastWarning('Please provide either email or phone number');
      return;
    }

    try {
      setIsAdding(true);

      // Phone is already in E.164 format from PhoneInput component

      const response = await apiFetch('/api/events/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          name: guestName.trim(),
          email: guestEmail.trim() || null,
          phone: guestPhone.trim() || null, // Already in E.164 format
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add guest');
      }

      // Clear form
      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');

      // Show success message
      toastSuccess(`Guest "${guestName.trim()}" has been added successfully!`);

      // Notify parent component to refresh guest list
      if (onGuestAdded) {
        onGuestAdded();
      }
    } catch (error) {
      console.error('Error adding guest:', error);
      toastError('Failed to add guest. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const handleSendToSelected = async () => {
    if (selectedGuests.length === 0) {
      toastWarning('Please select guests to send invitations to');
      return;
    }

    try {
      setIsSending(true);
      const response = await apiFetch(
        `/api/events/${event.id}/send-invitations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            guestIds: selectedGuests,
            type: 'invitation',
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to send invitations');
      }

      const data = await response.json();
      if (data.success) {
        toastSuccess(data.message);
        // Refresh guest list
        if (onGuestAdded) {
          onGuestAdded();
        }
      } else {
        toastError(data.error || 'Failed to send invitations');
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      toastError('Failed to send invitations. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendToAllUnsent = async () => {
    try {
      setIsSending(true);
      const response = await apiFetch(
        `/api/events/${event.id}/send-invitations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'invitation', // Send to all unsent
          }),
        },
      );

      if (!response.ok) {
        throw new Error('Failed to send invitations');
      }

      const data = await response.json();
      if (data.success) {
        toastSuccess(data.message);
        // Refresh guest list
        if (onGuestAdded) {
          onGuestAdded();
        }
      } else {
        toastError(data.error || 'Failed to send invitations');
      }
    } catch (error) {
      console.error('Error sending invitations:', error);
      toastError('Failed to send invitations. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleSendReminder = async () => {
    try {
      setIsSending(true);
      const response = await apiFetch(
        `/api/events/${event.id}/send-invitations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'reminder', // Send reminders to pending guests
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', errorData);
        throw new Error(
          errorData.error ||
            `HTTP ${response.status}: Failed to send reminders`,
        );
      }

      const data = await response.json();
      console.log('Reminder API Response:', data);

      if (data.success) {
        toastSuccess(data.message);
        // Refresh guest list
        if (onGuestAdded) {
          onGuestAdded();
        }
      } else {
        toastError(data.error || 'Failed to send reminders');
      }
    } catch (error) {
      console.error('Error sending reminders:', error);
      toastError(`Failed to send reminders: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedGuests.length === 0) {
      toastWarning('Please select guests to delete');
      return;
    }

    setDeleteConfirmation({
      isOpen: true,
      guestCount: selectedGuests.length,
    });
  };

  const confirmDeleteSelected = async () => {
    try {
      setIsSending(true);
      const response = await apiFetch(
        `/api/events/guests?guestIds=${selectedGuests.join(',')}`,
        { method: 'DELETE' },
      );

      if (!response.ok) {
        throw new Error('Failed to delete guests');
      }

      const data = await response.json();
      if (data.success) {
        toastSuccess(data.message);
        onSelectedGuestsChange([]);
        if (onGuestAdded) onGuestAdded();
      } else {
        toastError(data.error || 'Failed to delete guests');
      }
    } catch (error) {
      console.error('Error deleting guests:', error);
      toastError('Failed to delete guests. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const closeDeleteConfirmation = () => {
    setDeleteConfirmation({ isOpen: false, guestCount: 0 });
  };

  return (
    <>
      <div className="space-y-6">
        {/* Add Guest Section */}
        <Card className="p-4 sm:p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add New Guest
              </h3>
            </div>

            {/* Responsive Form Layout */}
            <div className="space-y-4">
              {/* Desktop: 3 columns, Mobile: 1 column */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Name Field */}
                <div className="lg:col-span-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Guest Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="text"
                    placeholder="e.g. Jane Doe"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="h-10 w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                  />
                </div>

                {/* Email Field */}
                <div className="lg:col-span-1">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                    Email Address{' '}
                    <span className="text-xs text-gray-500">(Optional)</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="e.g. jane@example.com"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="h-10 w-full bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                  />
                </div>

                {/* Phone Number Field */}
                <div className="lg:col-span-1">
                  <PhoneInput
                    value={guestPhone}
                    onChange={setGuestPhone}
                    placeholder="Enter phone number"
                    defaultCountry="IN"
                    showValidation={true}
                    className="h-10"
                  />
                </div>
              </div>

              {/* Add Button - Full width on mobile, centered on desktop */}
              <div className="flex justify-center lg:justify-start">
                <Button
                  variant="primary"
                  className="w-full sm:w-auto px-6 h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddGuest}
                  disabled={isAdding}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span className="text-sm sm:text-base">
                    {isAdding ? 'Adding Guest...' : '+ Add Guest'}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Guest Actions Section */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 border-blue-200 dark:border-blue-800">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
                <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Guest Management
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-4">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <Input
                    type="text"
                    placeholder="Search guests by name or email..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="h-12 pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
                  />
                </div>
              </div>
              <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                <Button
                  variant="primary"
                  className="h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-700 dark:hover:to-blue-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSendToSelected}
                  disabled={isSending || selectedGuests.length === 0}
                >
                  <Send className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base truncate">
                    <span className="hidden sm:inline">Send to Selected</span>
                    <span className="sm:hidden">Send Selected</span>
                    {selectedGuests.length > 0 && (
                      <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {selectedGuests.length}
                      </span>
                    )}
                  </span>
                </Button>
                <Button
                  variant="secondary"
                  className="h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-700 dark:hover:to-indigo-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSendToAllUnsent}
                  disabled={isSending || unsentCount === 0}
                >
                  <span className="text-sm sm:text-base truncate">
                    <span className="hidden sm:inline">Send to All Unsent</span>
                    <span className="sm:hidden">Send Unsent</span>
                    {unsentCount > 0 && (
                      <span className="ml-1 bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {unsentCount}
                      </span>
                    )}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 border-2 border-amber-500 dark:border-amber-400 text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleSendReminder}
                  disabled={isSending || reminderCount === 0}
                >
                  <Bell className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base truncate">
                    <span className="hidden sm:inline">Send Reminder</span>
                    <span className="sm:hidden">Reminder</span>
                    {reminderCount > 0 && (
                      <span className="ml-1 bg-amber-200 dark:bg-amber-800 px-2 py-0.5 rounded-full text-xs">
                        {reminderCount}
                      </span>
                    )}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="h-12 border-2 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleDeleteSelected}
                  disabled={isSending || selectedGuests.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="text-sm sm:text-base truncate">
                    <span className="hidden sm:inline">Delete Selected</span>
                    <span className="sm:hidden">Delete</span>
                    {selectedGuests.length > 0 && (
                      <span className="ml-1 bg-red-200 dark:bg-red-800 px-2 py-0.5 rounded-full text-xs">
                        {selectedGuests.length}
                      </span>
                    )}
                  </span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Delete Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={deleteConfirmation.isOpen}
          onClose={closeDeleteConfirmation}
          onConfirm={confirmDeleteSelected}
          title="Delete Selected Guests"
          message={`Are you sure you want to delete ${deleteConfirmation.guestCount} selected guest(s)? This action cannot be undone.`}
          confirmText="Delete All"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </>
  );
}

export default ManageGuestForm;
