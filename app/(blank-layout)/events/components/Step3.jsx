'use client';

import React, { useState } from 'react';
import { Search, Settings, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEventCreation } from '../context/EventCreationContext';
import GuestSettingsDrawer from './GuestSettingsDrawer';

function Step3() {
  const { eventData, addGuest, removeGuest, clearGuests } = useEventCreation();
  const [newGuest, setNewGuest] = useState({
    name: '',
    contact: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAddGuest = () => {
    if (newGuest.name.trim() && newGuest.contact.trim()) {
      addGuest({
        name: newGuest.name,
        contact: newGuest.contact,
        status: 'Pending',
      });
      setNewGuest({ name: '', contact: '' });
    }
  };

  const handleRemoveGuest = (id) => {
    removeGuest(id);
  };

  const handleClearAll = () => {
    clearGuests();
  };

  const filteredGuests = eventData.guests.filter(
    (guest) =>
      guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      guest.contact.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      <main className="flex-1 overflow-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Main Card */}
          <div className="bg-background rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="space-y-8">
              {/* Add a Guest Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Add a Guest
                </h2>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Guest Name
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Jane Doe"
                      value={newGuest.name}
                      onChange={(e) =>
                        setNewGuest({ ...newGuest, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email or Phone
                    </label>
                    <Input
                      type="text"
                      placeholder="jane.doe@example.com"
                      value={newGuest.contact}
                      onChange={(e) =>
                        setNewGuest({ ...newGuest, contact: e.target.value })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button variant="primary" onClick={handleAddGuest}>
                      <UserPlus className="w-4 h-4" />
                      Add Guest
                    </Button>
                  </div>
                </div>
              </div>

              {/* Invited Guests Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Invited Guests ({eventData.guests.length})
                  </h2>
                </div>

                {/* Guest Requirement Notice */}
                {eventData.guests.length === 0 && (
                  <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-amber-100 rounded-full flex items-center justify-center mt-0.5">
                        <svg
                          className="w-3 h-3 text-amber-600"
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
                        <p className="text-sm font-medium text-amber-900 mb-1">
                          Guest Required
                        </p>
                        <p className="text-xs text-amber-700">
                          You must add at least one guest to create an event.
                          Events without guests cannot be published.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Search and Actions Bar */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search guests..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDrawerOpen(true)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  <Button variant="destructive" onClick={handleClearAll}>
                    Clear All
                  </Button>
                </div>

                {/* Guests Table */}
                <div className="overflow-hidden border border-gray-200 rounded-lg">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          NAME
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CONTACT
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          STATUS
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-background divide-y divide-gray-200">
                      {filteredGuests.map((guest) => (
                        <tr key={guest.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {guest.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {guest.contact}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {guest.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <Button
                              variant="destructive"
                              appearance="ghost"
                              onClick={() => handleRemoveGuest(guest.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Empty State */}
                {filteredGuests.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">
                      <UserPlus className="w-12 h-12 mx-auto" />
                    </div>
                    <p className="text-gray-500">
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
