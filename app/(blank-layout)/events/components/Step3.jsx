'use client';

import React, { useState } from 'react';
import { Search, Settings, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import GuestSettingsDrawer from './GuestSettingsDrawer';

function Step3() {
  const [guests, setGuests] = useState([
    {
      id: 1,
      name: 'dhruvi',
      contact: 'dhruvi@jspinfotech.com',
      status: 'Pending',
    },
  ]);

  const [newGuest, setNewGuest] = useState({
    name: '',
    contact: '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleAddGuest = () => {
    if (newGuest.name.trim() && newGuest.contact.trim()) {
      const guest = {
        id: Date.now(),
        name: newGuest.name,
        contact: newGuest.contact,
        status: 'Pending',
      };
      setGuests([...guests, guest]);
      setNewGuest({ name: '', contact: '' });
    }
  };

  const handleRemoveGuest = (id) => {
    setGuests(guests.filter((guest) => guest.id !== id));
  };

  const handleClearAll = () => {
    setGuests([]);
  };

  const filteredGuests = guests.filter(
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
                    Invited Guests ({guests.length})
                  </h2>
                </div>

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
