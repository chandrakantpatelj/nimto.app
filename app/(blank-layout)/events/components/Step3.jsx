'use client';

import React, { useState } from 'react';
import { useEventActions, useEvents } from '@/store/hooks';
import {
  Baby,
  Calendar,
  Lock,
  Search,
  Settings,
  Shield,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import PhoneInput from '@/components/ui/phone-input';
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
  const [validationError, setValidationError] = useState('');

  const handleAddGuest = () => {
    // Clear previous validation error
    setValidationError('');

    // Validate name
    if (!newGuest.name.trim()) {
      setValidationError('Guest name is required');
      return;
    }

    // Validate that either email or phone is provided
    if (!newGuest.email.trim() && !newGuest.phone.trim()) {
      setValidationError('Either email or phone number is required');
      return;
    }

    // Add guest if validation passes
    addGuest({
      name: newGuest.name,
      email: newGuest.email.trim() || null,
      phone: newGuest.phone.trim() || null,
      status: 'PENDING',
    });
    setNewGuest({ name: '', email: '', phone: '' });
  };

  const handleRemoveGuest = (id) => {
    removeGuest(id);
  };

  const handleClearAll = () => {
    clearGuests();
  };

  const handleInputChange = (field, value) => {
    setNewGuest({ ...newGuest, [field]: value });
    // Clear validation error when user starts typing
    if (validationError) {
      setValidationError('');
    }
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
        <div className="max-w-[1500px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Guest Management */}
            <div className="lg:col-span-2">
              {/* Main Card */}
              <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6">
                <div className="space-y-6 sm:space-y-8">
                  {/* Add a Guest Section */}
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-foreground dark:text-white mb-4">
                      Add a Guest
                    </h2>
                    {/* Responsive Form Layout */}
                    <div className="space-y-4">
                      {/* Mobile: Stacked, Desktop: Inline with button */}
                      <div className="flex flex-col lg:flex-row gap-4">
                        {/* Form Fields Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                          {/* Guest Name Field */}
                          <div className="sm:col-span-2 lg:col-span-1 flex flex-col">
                            <label
                              htmlFor="guest-name"
                              className="block text-sm font-medium text-foreground mb-2"
                            >
                              Guest Name <span className="text-red-500">*</span>
                            </label>
                            <div className="flex-1 flex flex-col justify-between">
                              <Input
                                id="guest-name"
                                type="text"
                                placeholder="e.g., Jane Doe"
                                value={newGuest.name}
                                onChange={(e) =>
                                  handleInputChange('name', e.target.value)
                                }
                                className="w-full h-10"
                              />
                              {/* Spacer to match phone field height */}
                              <div className="h-5"></div>
                            </div>
                          </div>

                          {/* Email Field */}
                          <div className="sm:col-span-1 lg:col-span-1 flex flex-col">
                            <label
                              htmlFor="guest-email"
                              className="block text-sm font-medium text-foreground mb-2"
                            >
                              Email{' '}
                              <span className="text-xs text-gray-500">
                                (Optional)
                              </span>
                            </label>
                            <div className="flex-1 flex flex-col justify-between">
                              <Input
                                id="guest-email"
                                type="email"
                                placeholder="jane.doe@example.com"
                                value={newGuest.email}
                                onChange={(e) =>
                                  handleInputChange('email', e.target.value)
                                }
                                className="w-full h-10"
                              />
                              {/* Spacer to match phone field height */}
                              <div className="h-5"></div>
                            </div>
                          </div>

                          {/* Phone Number Field */}
                          <div className="sm:col-span-1 lg:col-span-1 flex flex-col">
                            <PhoneInput
                              value={newGuest.phone}
                              onChange={(phone) =>
                                setNewGuest({ ...newGuest, phone })
                              }
                              placeholder="Enter phone number"
                              defaultCountry="IN"
                              showLabel={true}
                              showValidation={true}
                              label="Phone Number"
                            />
                          </div>
                        </div>

                        {/* Add Button - Aligned with input fields */}
                        <div className="flex justify-center lg:justify-end w-full lg:w-auto items-start pt-6">
                          <Button
                            variant="primary"
                            onClick={handleAddGuest}
                            className="min-w-[140px] px-6 h-10 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                          >
                            <UserPlus className="w-4 h-4 mr-2" />+ Add Guest
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Validation Messages */}
                    <div className="mt-3">
                      {validationError ? (
                        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800/50 rounded-lg">
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
                      ) : null}
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

            {/* Right Column - Event Features */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-xl shadow-sm border border-border p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-bold text-foreground dark:text-white mb-6">
                  Guest Settings
                </h2>

                <div className="space-y-4">
                  {/* Private Guest List */}
                  <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg mt-0.5">
                      <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-foreground">
                            Private Guest List
                          </h3>
                          <p className="text-xs mt-1 text-muted-foreground">
                            Only you can see the full guest list.
                          </p>
                        </div>
                        <div
                          className={`w-10 h-5 rounded-full transition-colors ${
                            eventData?.privateGuestList
                              ? 'bg-primary'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                              eventData?.privateGuestList
                                ? 'translate-x-5'
                                : 'translate-x-0.5'
                            } mt-0.5`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Allow Plus Ones */}
                  <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="p-2 bg-green-50 dark:bg-green-950/50 rounded-lg mt-0.5">
                      <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-foreground">
                            Allow 'Plus Ones'
                          </h3>
                          <p className="text-xs mt-1 text-muted-foreground">
                            Let guests specify how many people they're bringing.
                          </p>
                        </div>
                        <div
                          className={`w-10 h-5 rounded-full transition-colors ${
                            eventData?.allowPlusOnes
                              ? 'bg-primary'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                              eventData?.allowPlusOnes
                                ? 'translate-x-5'
                                : 'translate-x-0.5'
                            } mt-0.5`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Allow Maybe RSVP */}
                  <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg mt-0.5">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-foreground">
                            Allow 'Maybe' RSVP
                          </h3>
                          <p className="text-xs mt-1 text-muted-foreground">
                            Let guests RSVP 'Maybe' if they aren't ready to
                            commit.
                          </p>
                        </div>
                        <div
                          className={`w-10 h-5 rounded-full transition-colors ${
                            eventData?.allowMaybeRSVP
                              ? 'bg-primary'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                              eventData?.allowMaybeRSVP
                                ? 'translate-x-5'
                                : 'translate-x-0.5'
                            } mt-0.5`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Family Headcount */}
                  <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg mt-0.5">
                      <Baby className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-foreground">
                            Family Headcount
                          </h3>
                          <p className="text-xs mt-1 text-muted-foreground">
                            Prompt for adults and kids attending.
                          </p>
                        </div>
                        <div
                          className={`w-10 h-5 rounded-full transition-colors ${
                            eventData?.allowFamilyHeadcount
                              ? 'bg-primary'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                              eventData?.allowFamilyHeadcount
                                ? 'translate-x-5'
                                : 'translate-x-0.5'
                            } mt-0.5`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Limit Event Capacity */}
                  <div className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="p-2 bg-orange-50 dark:bg-orange-950/50 rounded-lg mt-0.5">
                      <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-foreground">
                            Limit Event Capacity
                          </h3>
                          <p className="text-xs mt-1 text-muted-foreground">
                            Set a max number of guests who can RSVP 'Yes'.
                          </p>
                        </div>
                        <div
                          className={`w-10 h-5 rounded-full transition-colors ${
                            eventData?.limitEventCapacity
                              ? 'bg-primary'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform ${
                              eventData?.limitEventCapacity
                                ? 'translate-x-5'
                                : 'translate-x-0.5'
                            } mt-0.5`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => setIsDrawerOpen(true)}
                    className="w-full"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Settings
                  </Button>
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
    </div>
  );
}

export default Step3;
