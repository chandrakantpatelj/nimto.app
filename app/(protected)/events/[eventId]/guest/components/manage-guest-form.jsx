import React, { useRef, useState } from 'react';
import { Bell, Send, Trash2, Upload, UserPlus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PhoneInput from '@/components/ui/phone-input';
import AdvancedProcessingLoader from '@/components/common/advanced-processing-loader';
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
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: false,
    error: '',
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    guestCount: 0,
  });
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateGuests, setDuplicateGuests] = useState([]);
  const fileInputRef = useRef(null);
  const { toastSuccess, toastError, toastWarning } = useToast();

  // Calculate counts
  const unsentCount = guests.filter(
    (guest) => guest.status === 'PENDING',
  ).length;
  const reminderCount = guests.filter(
    (guest) => guest.invitedAt && (guest.status === 'INVITED' || !guest.status),
  ).length;

  const handleAddGuest = async () => {
    if (!guestName.trim() || (!guestEmail.trim() && !guestPhone.trim())) {
      toastWarning(
        'Please enter guest name and at least one contact: email or phone number',
      );
      return;
    }

    // Duplicate check: if any field matches, consider duplicate
    const isDuplicate = guests.some(
      (g) =>
        (guestName.trim() &&
          g.name &&
          g.name.trim().toLowerCase() === guestName.trim().toLowerCase()) ||
        (guestEmail.trim() &&
          g.email &&
          g.email.trim().toLowerCase() === guestEmail.trim().toLowerCase()) ||
        (guestPhone.trim() &&
          g.phone &&
          g.phone.trim().toLowerCase() === guestPhone.trim().toLowerCase()),
    );
    if (isDuplicate) {
      toastWarning('Guest already exists (by name, email, or phone).');
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
          email: guestEmail.trim() || undefined,
          phone: guestPhone.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add guest');
      }

      setGuestName('');
      setGuestEmail('');
      setGuestPhone('');

      toastSuccess(`Guest "${guestName.trim()}" has been added successfully!`);

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

  // Import from Excel logic
  const handleImportExcelClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleExcelFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      // Normalize and deduplicate
      const existingGuests = guests || [];
      const newGuests = [];
      const duplicates = [];

      rows.forEach((row) => {
        // Accept columns: name, email, phone (case-insensitive)
        const name = (row.name || row.Name || '').trim();
        const email = (row.email || row.Email || '').trim();
        const phone = (row.phone || row.Phone || '').trim();

        if (!name && !email && !phone) return; // skip empty row

        // Duplicate if any field matches
        const isDuplicate = existingGuests.some(
          (g) =>
            (name &&
              g.name &&
              g.name.trim().toLowerCase() === name.toLowerCase()) ||
            (email &&
              g.email &&
              g.email.trim().toLowerCase() === email.toLowerCase()) ||
            (phone &&
              g.phone &&
              g.phone.trim().toLowerCase() === phone.toLowerCase()),
        );

        if (isDuplicate) {
          duplicates.push({ name, email, phone });
        } else {
          newGuests.push({
            name,
            email: email || undefined,
            phone: phone || undefined,
          });
        }
      });

      let addedCount = 0;
      for (const guest of newGuests) {
        try {
          const response = await apiFetch('/api/events/guests', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              eventId: event.id,
              name: guest.name,
              email: guest.email,
              phone: guest.phone,
            }),
          });
          if (response.ok) {
            addedCount++;
          }
        } catch (err) {
          // Optionally handle error for individual guest
        }
      }

      if (addedCount > 0) {
        toastSuccess(
          `${addedCount} guest${addedCount > 1 ? 's' : ''} imported successfully.`,
        );
        if (onGuestAdded) onGuestAdded();
      }
      if (duplicates.length > 0) {
        setDuplicateGuests(duplicates);
        setShowDuplicateModal(true);
      }
      setIsImporting(false);
    };
    reader.readAsArrayBuffer(file);
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
            type: 'reminder',
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
      if (data.success) {
        toastSuccess(data.message);
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
        {/* Add Guest Section - Inline, 4 columns */}
        <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-200 dark:border-green-800">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/50 rounded-lg flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Add New Guest
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end">
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Guest Name
                </Label>
                <Input
                  type="text"
                  placeholder="e.g Jane Doe"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Email Address
                </Label>
                <Input
                  type="email"
                  placeholder="e.g jane@example.com"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="h-12 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-base"
                />
              </div>
              <div className="relative">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Phone Number
                </Label>
                <PhoneInput
                  value={guestPhone}
                  onChange={setGuestPhone}
                  onValidationChange={setPhoneValidation}
                  placeholder="e.g 9876543210"
                  defaultCountry="IN"
                  label=""
                  required={false}
                  className="w-full"
                />
                {/* Phone Validation Message - Positioned absolutely to not affect alignment */}
                {guestPhone.trim() &&
                  !phoneValidation.isValid &&
                  phoneValidation.error && (
                    <div className="absolute top-full left-0 right-0 mt-1 z-10">
                      <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 bg-white dark:bg-gray-800 border border-red-200 dark:border-red-800 rounded-md p-2 shadow-sm">
                        <div className="w-3 h-3 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg
                            className="w-2 h-2 text-red-600 dark:text-red-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span>{phoneValidation.error}</span>
                      </div>
                    </div>
                  )}
              </div>
              <div className="flex items-end gap-2">
                <Button
                  variant="primary"
                  className="w-full h-12 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-600 dark:to-green-700 dark:hover:from-green-700 dark:hover:to-green-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddGuest}
                  disabled={isAdding}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  <span className="text-sm sm:text-base">
                    {isAdding ? 'Adding...' : 'Add Guest'}
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 flex items-center justify-center gap-2"
                  onClick={handleImportExcelClick}
                  disabled={isImporting}
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm sm:text-base">
                    Import from Excel
                  </span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  style={{ display: 'none' }}
                  onChange={handleExcelFileChange}
                />
              </div>
            </div>
          </div>
        </Card>

        {/* AdvancedProcessingLoader Backdrop for Import */}
        {isImporting && (
          <AdvancedProcessingLoader
            isVisible={true}
            title="Importing Guests"
            description="Please wait while we process your guest list..."
            tasks={[
              { icon: '📥', text: 'Reading Excel file...' },
              { icon: '🔎', text: 'Checking for duplicates...' },
              { icon: '👤', text: 'Adding new guests...' },
            ]}
          />
        )}

        {/* Duplicate Modal */}
        {showDuplicateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-card rounded-lg shadow-lg max-w-md w-full p-6">
              <h3 className="text-lg font-bold mb-4 text-red-700">
                Duplicate Guests Not Added
              </h3>
              <p className="mb-3 text-sm text-muted-foreground">
                The following guests were already in your list (by name, email,
                or phone) and were not added:
              </p>
              <ul className="mb-4 max-h-40 overflow-y-auto text-sm">
                {duplicateGuests.map((g, idx) => (
                  <li key={idx} className="mb-2">
                    <span className="font-semibold">
                      {g.name || '(No Name)'}
                    </span>
                    {g.email && <span className="ml-2">📧 {g.email}</span>}
                    {g.phone && <span className="ml-2">📞 {g.phone}</span>}
                  </li>
                ))}
              </ul>
              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => setShowDuplicateModal(false)}
                >
                  OK
                </Button>
              </div>
            </div>
          </div>
        )}

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
