'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { GuestListTable } from './components';
import ManageGuestForm from './components/manage-guest-form';

export function ManageGuestContent({ event }) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [guests, setGuests] = useState([]);

  const handleGuestAdded = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleGuestsUpdate = (updatedGuests) => {
    setGuests(updatedGuests);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Event Overview Card */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-gray-900">
                {event.title}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>{formatTime(event.date)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {event.guests?.length || 0}
              </div>
              <div className="text-sm text-gray-600">Total Guests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {event.guests?.filter((g) => g.status === 'CONFIRMED').length ||
                  0}
              </div>
              <div className="text-sm text-gray-600">Confirmed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {event.guests?.filter(
                  (g) => g.status === 'PENDING' || !g.status,
                ).length || 0}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {event.guests?.filter((g) => g.status === 'DECLINED').length ||
                  0}
              </div>
              <div className="text-sm text-gray-600">Declined</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Guest Management Section */}
      <div className="space-y-6">
        <ManageGuestForm
          event={event}
          onGuestAdded={handleGuestAdded}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          guests={guests}
        />
        <GuestListTable
          key={refreshKey}
          event={event}
          searchQuery={searchQuery}
          onGuestsUpdate={handleGuestsUpdate}
        />
      </div>
    </div>
  );
}
