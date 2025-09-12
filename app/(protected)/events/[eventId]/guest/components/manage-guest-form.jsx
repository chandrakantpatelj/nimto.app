import React, { useState } from 'react';
import { Bell, Send, Trash2, UserPlus } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ConfirmationDialog } from './confirmation-dialog';

function ManageGuestForm({
  event,
  onGuestAdded,
  searchQuery,
  onSearchChange,
  guests,
}) {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedGuests, setSelectedGuests] = useState([]);
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
    if (!guestName.trim() || !guestEmail.trim()) {
      toastWarning('Please fill in both name and email');
      return;
    }

    try {
      setIsAdding(true);
      const response = await apiFetch('/api/events/guests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eventId: event.id,
          name: guestName.trim(),
          email: guestEmail.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add guest');
      }

      // Clear form
      setGuestName('');
      setGuestEmail('');

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
        throw new Error('Failed to send reminders');
      }

      const data = await response.json();
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
      toastError('Failed to send reminders. Please try again.');
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
        setSelectedGuests([]);
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
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Guest
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              <div className="md:col-span-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Guest Name
                </Label>
                <Input
                  type="text"
                  placeholder="e.g Jane Doe"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="md:col-span-4">
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="e.g jane@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="h-11"
                />
              </div>
              <div className="md:col-span-4">
                <Button
                  variant="primary"
                  className="w-full h-11 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  onClick={handleAddGuest}
                  disabled={isAdding}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  {isAdding ? 'Adding...' : 'Add Guest'}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Guest Actions Section */}
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Send className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Guest Management
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-4">
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
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
                    className="h-11 pl-10"
                  />
                </div>
              </div>
              <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Button
                  variant="primary"
                  className="h-11 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  onClick={handleSendToSelected}
                  disabled={isSending}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send to Selected ({selectedGuests.length})
                </Button>
                <Button
                  variant="secondary"
                  className="h-11 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                  onClick={handleSendToAllUnsent}
                  disabled={isSending || unsentCount === 0}
                >
                  Send to All Unsent ({unsentCount})
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-orange-300 text-orange-700 hover:bg-orange-50"
                  onClick={handleSendReminder}
                  disabled={isSending || reminderCount === 0}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Send Reminder ({reminderCount})
                </Button>
                <Button
                  variant="outline"
                  className="h-11 border-red-300 text-red-700 hover:bg-red-50"
                  onClick={handleDeleteSelected}
                  disabled={isSending || selectedGuests.length === 0}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Selected ({selectedGuests.length})
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
