'use client';

import React, { useState } from 'react';
import { useEventActions, useEvents } from '@/store/hooks';
import { Search, Settings, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GuestSettingsDrawer from './GuestSettingsDrawer';

function Step3() {
  const { selectedEvent: eventData } = useEvents();
  const { updateSelectedEvent } = useEventActions();

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

  const handleAddGuest = () => {
    if (
      newGuest.name.trim() &&
      (newGuest.email.trim() || newGuest.phone.trim())
    ) {
      addGuest({
        name: newGuest.name,
        email: newGuest.email.trim() || null,
        phone: newGuest.phone.trim() || null,
        status: 'PENDING',
      });
      setNewGuest({ name: '', email: '', phone: '' });
    }
  };

  const handleRemoveGuest = (id) => {
    removeGuest(id);
  };

  const handleClearAll = () => {
    clearGuests();
  };

  const filteredGuests = (eventData?.guests || []).filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (guest.email &&
        guest.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (guest.phone &&
        guest.phone.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  return (
    <div className="flex flex-1 overflow-hidden bg-background">
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Card */}
          <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6">
            <div className="space-y-6 sm:space-y-8">
              {/* Add a Guest Section */}
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-foreground dark:text-white mb-4">
                  Add a Guest
                </h2>
                <div className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1">
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
                        setNewGuest({ ...newGuest, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
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
                        setNewGuest({ ...newGuest, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label
                      htmlFor="guest-phone"
                      className="block text-sm font-medium text-foreground mb-2"
                    >
                      Phone
                    </label>
                    <Input
                      id="guest-phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={newGuest.phone}
                      onChange={(e) =>
                        setNewGuest({ ...newGuest, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-end lg:items-end">
                    <Button
                      variant="primary"
                      onClick={handleAddGuest}
                      className="w-full lg:w-auto"
                    >
                      <UserPlus className="w-4 h-4" />
                      Add Guest
                    </Button>
                  </div>
                </div>
              </div>

              {/* Invited Guests Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg sm:text-xl font-bold text-foreground dark:text-white">
                    Invited Guests ({(eventData?.guests || []).length})
                  </h2>
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
                          You must add at least one guest to create an event.
                          Events without guests cannot be published.
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
                  <div className="flex items-center gap-2 sm:gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsDrawerOpen(true)}
                      className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={handleClearAll}
                      className="text-sm"
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
                      {filteredGuests.map((guest) => (
                        <tr
                          key={guest.id || guest.tempId}
                          className="hover:bg-muted/50"
                        >
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            <Button
                              variant="destructive"
                              appearance="ghost"
                              onClick={() =>
                                handleRemoveGuest(guest.id || guest.tempId)
                              }
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Guests Cards - Mobile */}
                <div className="lg:hidden space-y-3">
                  {filteredGuests.map((guest) => (
                    <div
                      key={guest.id || guest.tempId}
                      className="bg-card border border-border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    >
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
                    </div>
                  ))}
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
      </main>

      {/* Guest Settings Drawer */}
      <GuestSettingsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}

export default Step3;
