'use client';

import { useState } from 'react';
import { Calendar, Clock, MapPin, Settings } from 'lucide-react';
import { formatDate, formatTime } from '@/lib/date-utils';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { apiFetch } from '@/lib/api';
import { GuestListTable } from './components';
import ManageGuestForm from './components/manage-guest-form';

export function ManageGuestContent({ event }) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [guests, setGuests] = useState([]);
    const [selectedGuests, setSelectedGuests] = useState([]);
    const [features, setFeatures] = useState({
        privateGuestList: event.privateGuestList || false,
        allowPlusOnes: event.allowPlusOnes || false,
        allowMaybeRSVP: event.allowMaybeRSVP !== undefined ? event.allowMaybeRSVP : true,
        allowFamilyHeadcount: event.allowFamilyHeadcount || false,
        limitEventCapacity: event.limitEventCapacity || false,
        maxEventCapacity: event.maxEventCapacity || 0,
        maxPlusOnes: event.maxPlusOnes || 0,
    });
    const [originalFeatures, setOriginalFeatures] = useState({
        privateGuestList: event.privateGuestList || false,
        allowPlusOnes: event.allowPlusOnes || false,
        allowMaybeRSVP: event.allowMaybeRSVP !== undefined ? event.allowMaybeRSVP : true,
        allowFamilyHeadcount: event.allowFamilyHeadcount || false,
        limitEventCapacity: event.limitEventCapacity || false,
        maxEventCapacity: event.maxEventCapacity || 0,
        maxPlusOnes: event.maxPlusOnes || 0,
    });
    const [isUpdating, setIsUpdating] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const handleGuestAdded = () => {
        setRefreshKey((prev) => prev + 1);
    };

    const handleGuestsUpdate = (updatedGuests) => {
        setGuests(updatedGuests);
    };

    const handleSelectedGuestsChange = (selectedGuestIds) => {
        setSelectedGuests(selectedGuestIds);
    };

    const handleFeatureToggle = (feature, enabled) => {
        const updatedFeatures = { ...features, [feature]: enabled };
        setFeatures(updatedFeatures);

        // Check if there are unsaved changes
        const hasChanges = JSON.stringify(updatedFeatures) !== JSON.stringify(originalFeatures);
        setHasUnsavedChanges(hasChanges);
    };

    const handleCapacityUpdate = (feature, value) => {
        // Ensure value is a valid number with appropriate minimums
        let numValue = parseInt(value) || 0;

        if (feature === 'maxEventCapacity') {
            numValue = Math.max(1, numValue); // Event capacity must be at least 1
        } else {
            numValue = Math.max(0, numValue); // Plus ones can be 0
        }

        const updatedFeatures = { ...features, [feature]: numValue };
        setFeatures(updatedFeatures);

        // Check if there are unsaved changes
        const hasChanges = JSON.stringify(updatedFeatures) !== JSON.stringify(originalFeatures);
        setHasUnsavedChanges(hasChanges);
    };

    const handleSaveAllChanges = async () => {
        try {
            setIsUpdating(true);

            console.log('Saving all feature changes:', features);

            // Update features using the dedicated features API
            const response = await apiFetch(`/api/events/${event.id}/features`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    features: features,
                }),
            });

            console.log('API response status:', response.status);
            console.log('API response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API error response:', errorText);
                throw new Error(`Failed to update event features: ${response.status} ${errorText}`);
            }

            const responseData = await response.json();
            console.log('API response data:', responseData);

            // Update original features to match current features
            setOriginalFeatures({ ...features });
            setHasUnsavedChanges(false);

            toast({
                title: 'Settings saved',
                description: 'All guest settings have been updated successfully.',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to save guest settings. Please try again.',
                variant: 'destructive',
            });
            console.error('Error saving features:', error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Event Overview Card */}
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-200 dark:border-blue-800">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {event.title}
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <Calendar className="w-4 h-4" />
                                <span>
                                    {formatDate(event.startDateTime, {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                    })}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(event.startDateTime)}</span>
                            </div>
                            {(event.locationAddress || event.locationUnit) && (
                                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                                    <MapPin className="w-4 h-4" />
                                    <span>
                                        {event.locationAddress}
                                        {event.locationUnit ? `, ${event.locationUnit}` : ''}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                                {event.guests?.length || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Total Guests</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {event.guests?.filter((g) => g.status === 'CONFIRMED').length ||
                                    0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Confirmed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {event.guests?.filter((g) => g.status === 'CONFIRMED' || g.status === 'MAYBE').reduce((sum, g) => sum + (g.children || 0), 0) ||
                                    0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Kids</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {event.guests?.filter((g) => g.status === 'CONFIRMED' || g.status === 'MAYBE').reduce((sum, g) => sum + (g.adults || 0), 0) ||
                                    0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Adults</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {event.guests?.filter(
                                    (g) => g.status === 'PENDING' || !g.status,
                                ).length || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {event.guests?.filter((g) => g.status === 'DECLINED').length ||
                                    0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Declined</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {event.guests?.filter((g) => g.status === 'MAYBE').length ||
                                    0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Maybe</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Guest Management Section - Takes 2 columns */}
                <div className="xl:col-span-2 space-y-6">
                    <ManageGuestForm
                        event={event}
                        onGuestAdded={handleGuestAdded}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        guests={guests}
                        selectedGuests={selectedGuests}
                        onSelectedGuestsChange={handleSelectedGuestsChange}
                    />
                    <GuestListTable
                        key={refreshKey}
                        event={event}
                        searchQuery={searchQuery}
                        onGuestsUpdate={handleGuestsUpdate}
                        selectedGuests={selectedGuests}
                        onSelectedGuestsChange={handleSelectedGuestsChange}
                    />
                </div>

                {/* Event Features Section - Takes 1 column */}
                <div className="space-y-4">
                    <Card className="p-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Guest Settings</h3>
                                    {hasUnsavedChanges && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200">
                                            Unsaved Changes
                                        </span>
                                    )}
                                </div>
                                <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Private Guest List</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Only you can see the full guest list
                                        </p>
                                    </div>
                                    <Switch
                                        checked={features.privateGuestList}
                                        onCheckedChange={(enabled) =>
                                            handleFeatureToggle('privateGuestList', enabled)
                                        }
                                        disabled={isUpdating}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white">Plus Ones (+1)</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Allow guests to bring additional people
                                            </p>
                                        </div>
                                        <Switch
                                            checked={features.allowPlusOnes}
                                            onCheckedChange={(enabled) =>
                                                handleFeatureToggle('allowPlusOnes', enabled)
                                            }
                                            disabled={isUpdating}
                                        />
                                    </div>
                                    {features.allowPlusOnes && (
                                        <div className="ml-4">
                                            <label htmlFor="maxPlusOnes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Max Plus Ones per Guest
                                            </label>
                                            <input
                                                id="maxPlusOnes"
                                                type="number"
                                                min="0"
                                                value={features.maxPlusOnes}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value) || 0;
                                                    handleCapacityUpdate('maxPlusOnes', value);
                                                }}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                                                placeholder="0"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Maybe RSVP Option</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Allow 'Maybe' as an RSVP choice
                                        </p>
                                    </div>
                                    <Switch
                                        checked={features.allowMaybeRSVP}
                                        onCheckedChange={(enabled) =>
                                            handleFeatureToggle('allowMaybeRSVP', enabled)
                                        }
                                        disabled={isUpdating}
                                    />
                                </div>


                                <div className="flex items-center justify-between">
                                    <div className="space-y-1">
                                        <h4 className="font-medium text-gray-900 dark:text-white">Family Headcount</h4>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Track adults and children separately
                                        </p>
                                    </div>
                                    <Switch
                                        checked={features.allowFamilyHeadcount}
                                        onCheckedChange={(enabled) =>
                                            handleFeatureToggle('allowFamilyHeadcount', enabled)
                                        }
                                        disabled={isUpdating}
                                    />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h4 className="font-medium text-gray-900 dark:text-white">Guest Limit</h4>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                Set maximum number of attendees
                                            </p>
                                        </div>
                                        <Switch
                                            checked={features.limitEventCapacity}
                                            onCheckedChange={(enabled) =>
                                                handleFeatureToggle('limitEventCapacity', enabled)
                                            }
                                            disabled={isUpdating}
                                        />
                                    </div>
                                    {features.limitEventCapacity && (
                                        <div className="ml-4">
                                            <label htmlFor="maxEventCapacity" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Max Event Capacity
                                            </label>
                                            <input
                                                id="maxEventCapacity"
                                                type="number"
                                                min="1"
                                                value={features.maxEventCapacity}
                                                onChange={(e) => {
                                                    const value = parseInt(e.target.value);
                                                    handleCapacityUpdate('maxEventCapacity', value);
                                                }}
                                                className="mt-1 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400"
                                                placeholder="100"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Update Invitation Button - Below Guest Settings */}
                    {hasUnsavedChanges && (
                        <div className="mt-4">
                            <Button
                                onClick={handleSaveAllChanges}
                                disabled={isUpdating}
                                className="w-full bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700 text-white px-6 py-3 rounded-lg shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUpdating ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                        </svg>
                                        Update Invitation
                                    </>
                                )}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
