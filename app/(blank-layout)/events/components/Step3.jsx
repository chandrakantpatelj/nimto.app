'use client';

import React, { useRef, useState } from 'react';
import { useEventActions, useEvents } from '@/store/hooks';
import { Edit2, Search, Settings, Upload, UserPlus, X } from 'lucide-react';
import * as XLSX from 'xlsx';
// Phone validation is handled by PhoneInput component
import { useToast } from '@/providers/toast-provider'; // Use the same toast provider as in design/page.jsx
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhoneInput from '@/components/ui/phone-input';
import GuestSettingsDrawer from './GuestSettingsDrawer';

const GUESTS_PER_PAGE = 10;

function Step3() {
  const { selectedEvent: eventData } = useEvents();
  const { updateSelectedEvent } = useEventActions();
  const { toastSuccess } = useToast(); // Use toastSuccess for notifications

  // Guest management functions
  const addGuest = (guest) => {
    const guestWithTempId = {
      ...guest,
      tempId: `temp-${Date.now()}-${Math.random()}`,
      isNew: true,
    };
    updateSelectedEvent({
      guests: [...(eventData?.guests || []), guestWithTempId],
    });
  };

  const removeGuest = (guestId) => {
    updateSelectedEvent({
      guests: (eventData?.guests || []).filter(
        (guest) => (guest.id || guest.tempId) !== guestId,
      ),
    });
  };

  const clearGuests = () => {
    updateSelectedEvent({ guests: [] });
  };

  const [newGuest, setNewGuest] = useState({
    name: '',
    email: '',
    phone: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [phoneValidationError, setPhoneValidationError] = useState('');

  // Edit guest state
  const [editGuestId, setEditGuestId] = useState(null);
  const [editGuestData, setEditGuestData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Import Excel state
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [duplicateGuests, setDuplicateGuests] = useState([]);
  const fileInputRef = useRef(null);

  const handleAddGuest = () => {
    setValidationError('');
    setPhoneValidationError('');

    if (!newGuest.name.trim()) {
      setValidationError('Guest name is required');
      return;
    }
    if (!newGuest.email.trim() && !newGuest.phone.trim()) {
      setValidationError('Either email or phone number is required');
      return;
    }

    // Phone validation is now handled in real-time by PhoneInput component
    // The phoneValidationError state will be set by the PhoneInput's onValidationChange callback

    addGuest({
      name: newGuest.name,
      email: newGuest.email.trim() || null,
      phone: newGuest.phone.trim() || null,
      status: 'PENDING',
    });
    setNewGuest({ name: '', email: '', phone: '' });
    setPhoneValidationError('');
    setCurrentPage(1); // Reset to first page after adding
  };

  const handleRemoveGuest = (id) => {
    removeGuest(id);
    if (editGuestId === id) {
      setEditGuestId(null);
      setEditGuestData({ name: '', email: '', phone: '' });
      setValidationError('');
    }
    setTimeout(() => {
      const totalGuests = filteredGuests.length - 1;
      const totalPages = Math.max(1, Math.ceil(totalGuests / GUESTS_PER_PAGE));
      if (currentPage > totalPages) setCurrentPage(totalPages);
    }, 0);
  };

  const handleClearAll = () => {
    clearGuests();
    setEditGuestId(null);
    setEditGuestData({ name: '', email: '', phone: '' });
    setValidationError('');
    setCurrentPage(1);
  };

  const handleInputChange = (field, value) => {
    setNewGuest({ ...newGuest, [field]: value });
    if (validationError) {
      setValidationError('');
    }
    if (field === 'phone' && phoneValidationError) {
      setPhoneValidationError('');
    }
  };

  // Edit guest handlers
  const handleEditGuest = (guest) => {
    setEditGuestId(guest.id || guest.tempId);
    setEditGuestData({
      name: guest.name || '',
      email: guest.email || '',
      phone: guest.phone || '',
    });
    setValidationError('');
  };

  const handleEditInputChange = (field, value) => {
    setEditGuestData({ ...editGuestData, [field]: value });
    if (validationError) {
      setValidationError('');
    }
  };

  const handleSaveEditGuest = () => {
    if (!editGuestData.name.trim()) {
      setValidationError('Guest name is required');
      return;
    }
    if (!editGuestData.email.trim() && !editGuestData.phone.trim()) {
      setValidationError('Either email or phone number is required');
      return;
    }
    updateSelectedEvent({
      guests: (eventData?.guests || []).map((guest) =>
        (guest.id || guest.tempId) === editGuestId
          ? { ...guest, ...editGuestData }
          : guest,
      ),
    });
    setEditGuestId(null);
    setEditGuestData({ name: '', email: '', phone: '' });
    setValidationError('');
  };

  const handleCancelEditGuest = () => {
    setEditGuestId(null);
    setEditGuestData({ name: '', email: '', phone: '' });
    setValidationError('');
  };

  // Filtered guests
  const filteredGuests = (eventData?.guests || []).filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (guest.email &&
        guest.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (guest.phone &&
        guest.phone.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Pagination logic
  const totalGuests = filteredGuests.length;
  const totalPages = Math.max(1, Math.ceil(totalGuests / GUESTS_PER_PAGE));
  const paginatedGuests = filteredGuests.slice(
    (currentPage - 1) * GUESTS_PER_PAGE,
    currentPage * GUESTS_PER_PAGE,
  );

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Import from Excel logic
  const handleImportExcelClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleExcelFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(worksheet);

      // Normalize and deduplicate
      const existingGuests = eventData?.guests || [];
      const newGuests = [];
      const duplicates = [];

      rows.forEach((row) => {
        // Accept columns: name, email, phone (case-insensitive)
        const name = (row.name || row.Name || '').trim();
        const email = (row.email || row.Email || '').trim();
        const phone = (row.phone || row.Phone || '').trim();

        if (!name && !email && !phone) return; // skip empty row

        // Check for duplicate by name, email, or phone
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
            email: email || null,
            phone: phone || null,
            status: 'PENDING',
            tempId: `temp-${Date.now()}-${Math.random()}`,
            isNew: true,
          });
        }
      });

      if (newGuests.length > 0) {
        updateSelectedEvent({
          guests: [...existingGuests, ...newGuests],
        });
        toastSuccess(
          `${newGuests.length} guest${newGuests.length > 1 ? 's' : ''} imported successfully.`,
        );
      }
      if (duplicates.length > 0) {
        setDuplicateGuests(duplicates);
        setShowDuplicateModal(true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="flex flex-1 overflow-hidden bg-background">
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Left Column - Guest Management */}
            <div className="lg:col-span-1">
              {/* Main Card */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6">
                <div className="space-y-6 sm:space-y-8">
                  {/* Add a Guest Section */}
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground dark:text-white mb-4">
                      Add a Guest
                    </h2>
                    <div className="flex flex-col xl:flex-row gap-4 items-center">
                      {/* Input Fields - Responsive layout */}
                      <div className="flex flex-col sm:flex-row gap-4 flex-1 w-full xl:w-auto">
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor="guest-name"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Guest Name
                          </label>
                          <Input
                            id="guest-name"
                            type="text"
                            placeholder="e.g., Jane Doe"
                            value={newGuest.name}
                            onChange={(e) =>
                              handleInputChange('name', e.target.value)
                            }
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <label
                            htmlFor="guest-email"
                            className="block text-sm font-medium text-foreground mb-2"
                          >
                            Email
                          </label>
                          <Input
                            id="guest-email"
                            type="email"
                            placeholder="jane.doe@example.com"
                            value={newGuest.email}
                            onChange={(e) =>
                              handleInputChange('email', e.target.value)
                            }
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <PhoneInput
                            value={newGuest.phone}
                            onChange={(value) =>
                              handleInputChange('phone', value)
                            }
                            onValidationChange={(validation) => {
                              if (validation.error) {
                                setPhoneValidationError(validation.error);
                              } else {
                                setPhoneValidationError('');
                              }
                            }}
                            placeholder="Enter phone number"
                            showValidation={false}
                            disabled={false}
                          />
                        </div>
                      </div>

                      {/* Phone Validation Error Message */}

                      {/* Action Buttons - Responsive layout */}
                      <div className="flex flex-col sm:flex-row gap-2 xl:flex-shrink-0 w-full sm:w-auto">
                        <Button
                          variant="primary"
                          onClick={handleAddGuest}
                          disabled={validationError || phoneValidationError}
                          className="w-full sm:w-auto xl:w-40 flex-shrink-0 flex items-center justify-center gap-2"
                        >
                          <UserPlus className="w-4 h-4" />
                          Add Guest
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleImportExcelClick}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto xl:w-40 flex-shrink-0"
                        >
                          <Upload className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            Import from Excel
                          </span>
                          <span className="sm:hidden">Import Excel</span>
                        </Button>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".xlsx,.xls"
                        style={{ display: 'none' }}
                        onChange={handleExcelFileChange}
                      />
                    </div>
                    {phoneValidationError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                          <p className="text-sm text-red-700 font-medium">
                            {phoneValidationError}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Validation Error Message */}
                    {validationError && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-lg">
                        <div className="flex items-start gap-2">
                          <div className="w-4 h-4 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                            <svg
                              className="w-2.5 h-2.5 text-red-600 dark:text-red-400"
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
                          <p className="text-sm text-red-800 dark:text-red-200">
                            {validationError}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Invited Guests Section */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg sm:text-xl font-bold text-foreground dark:text-white">
                        Invited Guests ({(eventData?.guests || []).length})
                      </h2>
                    </div>

                    {/* Event Status Selector */}
                    <div className="mb-6 p-4 bg-card border border-border rounded-lg">
                      <label className="block text-sm font-medium text-foreground mb-3">
                        Event Status
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="eventStatus"
                            value="DRAFT"
                            checked={eventData?.status === 'DRAFT'}
                            onChange={(e) =>
                              updateSelectedEvent({ status: e.target.value })
                            }
                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-foreground">
                            <span className="font-semibold">Save as Draft</span>
                            <span className="block text-xs text-muted-foreground">
                              Save event without publishing
                            </span>
                          </span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="eventStatus"
                            value="PUBLISHED"
                            checked={
                              eventData?.status === 'PUBLISHED' ||
                              !eventData?.status
                            }
                            onChange={(e) =>
                              updateSelectedEvent({ status: e.target.value })
                            }
                            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                          />
                          <span className="ml-2 text-sm text-foreground">
                            <span className="font-semibold">Publish Event</span>
                            <span className="block text-xs text-muted-foreground">
                              Make event live and send invitations
                            </span>
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Guest Requirement Notice */}
                    {(eventData?.guests || []).length === 0 && (
                      <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center mt-0.5">
                            <svg
                              className="w-3 h-3 text-amber-600 dark:text-amber-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-amber-900 dark:text-amber-100 mb-1">
                              Guest Required
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300">
                              You must add at least one guest to create an
                              event. Events without guests cannot be published.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Search and Actions Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search guests..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      <div className="flex flex-row items-center gap-2 sm:gap-3">
                        <Button
                          variant="primary"
                          size="md"
                          onClick={() => setIsDrawerOpen(true)}
                          className="flex items-center justify-center gap-2 px-4 py-2 font-semibold shadow-sm flex-1 sm:flex-none"
                        >
                          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                          <span className="hidden sm:inline">
                            Guest Settings
                          </span>
                          <span className="sm:hidden">Settings</span>
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleClearAll}
                          className="text-sm px-4 py-2 flex-1 sm:flex-none"
                        >
                          Clear All
                        </Button>
                      </div>
                    </div>

                    {/* Guests Table - Desktop */}
                    <div className="hidden lg:block overflow-hidden border border-border rounded-lg">
                      <table className="w-full">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              NAME
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              EMAIL
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              PHONE
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              STATUS
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                              ACTIONS
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-card divide-y divide-border">
                          {paginatedGuests.map((guest) => (
                            <tr
                              key={guest.id || guest.tempId}
                              className="hover:bg-muted/50"
                            >
                              {editGuestId === (guest.id || guest.tempId) ? (
                                <>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                    <Input
                                      value={editGuestData.name}
                                      onChange={(e) =>
                                        handleEditInputChange(
                                          'name',
                                          e.target.value,
                                        )
                                      }
                                      className="w-full"
                                    />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    <Input
                                      value={editGuestData.email}
                                      onChange={(e) =>
                                        handleEditInputChange(
                                          'email',
                                          e.target.value,
                                        )
                                      }
                                      className="w-full"
                                    />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    <Input
                                      value={editGuestData.phone}
                                      onChange={(e) =>
                                        handleEditInputChange(
                                          'phone',
                                          e.target.value,
                                        )
                                      }
                                      className="w-full"
                                    />
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200">
                                      {guest.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground flex gap-2">
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      onClick={handleSaveEditGuest}
                                    >
                                      Save
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleCancelEditGuest}
                                    >
                                      Cancel
                                    </Button>
                                  </td>
                                </>
                              ) : (
                                <>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                                    {guest.name}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    {guest.email || '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                    {guest.phone || '-'}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200">
                                      {guest.status}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground flex gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditGuest(guest)}
                                    >
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      appearance="ghost"
                                      onClick={() =>
                                        handleRemoveGuest(
                                          guest.id || guest.tempId,
                                        )
                                      }
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {/* Pagination Controls - Desktop */}
                      {totalPages > 1 && (
                        <div className="flex justify-end items-center gap-2 px-6 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Guests Cards - Mobile */}
                    <div className="lg:hidden space-y-3">
                      {paginatedGuests.map((guest) => (
                        <div
                          key={guest.id || guest.tempId}
                          className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                        >
                          {editGuestId === (guest.id || guest.tempId) ? (
                            <div>
                              <Input
                                value={editGuestData.name}
                                onChange={(e) =>
                                  handleEditInputChange('name', e.target.value)
                                }
                                className="mb-2"
                                placeholder="Name"
                              />
                              <Input
                                value={editGuestData.email}
                                onChange={(e) =>
                                  handleEditInputChange('email', e.target.value)
                                }
                                className="mb-2"
                                placeholder="Email"
                              />
                              <Input
                                value={editGuestData.phone}
                                onChange={(e) =>
                                  handleEditInputChange('phone', e.target.value)
                                }
                                className="mb-2"
                                placeholder="Phone"
                              />
                              <div className="flex gap-2">
                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={handleSaveEditGuest}
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleCancelEditGuest}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-sm font-medium text-foreground mb-1">
                                  {guest.name}
                                </h3>
                                <div className="space-y-1">
                                  {guest.email && (
                                    <p className="text-xs text-muted-foreground">
                                      📧 {guest.email}
                                    </p>
                                  )}
                                  {guest.phone && (
                                    <p className="text-xs text-muted-foreground">
                                      📞 {guest.phone}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-200">
                                  {guest.status}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditGuest(guest)}
                                  className="p-1"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="destructive"
                                  appearance="ghost"
                                  size="sm"
                                  onClick={() =>
                                    handleRemoveGuest(guest.id || guest.tempId)
                                  }
                                  className="p-1"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      {/* Pagination Controls - Mobile */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 py-4">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage(currentPage - 1)}
                          >
                            Previous
                          </Button>
                          <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage(currentPage + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Empty State */}
                    {filteredGuests.length === 0 && (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground mb-2">
                          <UserPlus className="w-12 h-12 mx-auto" />
                        </div>
                        <p className="text-muted-foreground">
                          {searchTerm
                            ? 'No guests found matching your search.'
                            : 'No guests invited yet.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Guest Settings Drawer */}
      <GuestSettingsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />

      {/* Duplicate Modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-card rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold mb-4 text-red-700">
              Duplicate Guests Not Added
            </h3>
            <p className="mb-3 text-sm text-muted-foreground">
              The following guests were already in your list (by name, email, or
              phone) and were not added:
            </p>
            <ul className="mb-4 max-h-40 overflow-y-auto text-sm">
              {duplicateGuests.map((g, idx) => (
                <li key={idx} className="mb-2">
                  <span className="font-semibold">{g.name || '(No Name)'}</span>
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
    </div>
  );
}

export default Step3;
