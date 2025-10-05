'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/date-utils';
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
    const [originalFeatures, setOriginalFeatures] = useState({ ...features });
    const [isUpdating, setIsUpdating] = useState(false);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [guestSettingsOpen, setGuestSettingsOpen] = useState(false);

    // Automatically enable Family Headcount if Plus Ones is true
    useEffect(() => {
        if (features.allowPlusOnes && !features.allowFamilyHeadcount) {
            setFeatures(prev => ({
                ...prev,
                allowFamilyHeadcount: true,
            }));
            setHasUnsavedChanges(true);
        }
    }, [features.allowPlusOnes]);

    const handleGuestAdded = () => setRefreshKey((prev) => prev + 1);
    const handleGuestsUpdate = (updatedGuests) => setGuests(updatedGuests);
    const handleSelectedGuestsChange = (selectedGuestIds) => setSelectedGuests(selectedGuestIds);

    const handleFeatureToggle = (feature, enabled) => {
        // Hide Family Headcount from UI, so only allowPlusOnes, privateGuestList, allowMaybeRSVP, limitEventCapacity are toggled
        if (feature === 'allowFamilyHeadcount') return;
        const updatedFeatures = { ...features, [feature]: enabled };
        // If Plus Ones is enabled, force Family Headcount to true
        if (feature === 'allowPlusOnes' && enabled) {
            updatedFeatures.allowFamilyHeadcount = true;
        }
        setFeatures(updatedFeatures);
        setHasUnsavedChanges(JSON.stringify(updatedFeatures) !== JSON.stringify(originalFeatures));
    };

    const handleCapacityUpdate = (feature, value) => {
        let numValue = parseInt(value) || 0;
        numValue = feature === 'maxEventCapacity' ? Math.max(1, numValue) : Math.max(0, numValue);
        const updatedFeatures = { ...features, [feature]: numValue };
        setFeatures(updatedFeatures);
        setHasUnsavedChanges(JSON.stringify(updatedFeatures) !== JSON.stringify(originalFeatures));
    };

    const handleSaveAllChanges = async () => {
        try {
            setIsUpdating(true);
            const response = await apiFetch(`/api/events/${event.id}/features`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ features }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to update event features: ${response.status} ${errorText}`);
            }
            await response.json();
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
        } finally {
            setIsUpdating(false);
        }
    };

    function extractHourMinute(dateString) {
        const match = dateString.match(/T(\d{2}):(\d{2})/);
        if (match) {
            let hour = match[1];
            let minute = match[2];
            const hourNum = parseInt(hour, 10);
            const ampm = hourNum >= 12 ? 'PM' : 'AM';
            const hour12 = ((hourNum + 11) % 12 + 1);
            return `${hour12}:${minute} ${ampm}`;
        }
        return 'Invalid Time';
    }

    function formatHourMinute(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }

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
                                <span>{formatHourMinute(event.startDateTime)}</span>
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
                                {event.guests?.filter((g) => g.status === 'CONFIRMED').length || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Confirmed</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {event.guests?.filter((g) => g.status === 'CONFIRMED' || g.status === 'MAYBE').reduce((sum, g) => sum + (g.children || 0), 0) || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Kids</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                                {event.guests?.filter((g) => g.status === 'CONFIRMED' || g.status === 'MAYBE').reduce((sum, g) => sum + (g.adults || 0), 0) || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Adults</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                {event.guests?.filter((g) => g.status === 'PENDING' || !g.status).length || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Pending</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                                {event.guests?.filter((g) => g.status === 'DECLINED').length || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Declined</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                                {event.guests?.filter((g) => g.status === 'MAYBE').length || 0}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Maybe</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Collapsible Guest Settings Card - 3 columns, rounded option cards */}
            <Card className="p-0 bg-gradient-to-r from-blue-50 to-yellow-50 dark:from-blue-950/50 dark:to-yellow-950/50 border-blue-200 dark:border-blue-800">
                <button
                    type="button"
                    className="w-full flex items-center justify-between px-6 py-4 cursor-pointer focus:outline-none bg-transparent"
                    onClick={() => setGuestSettingsOpen((open) => !open)}
                    aria-expanded={guestSettingsOpen}
                    aria-controls="guest-settings-content"
                >
                    <div className="flex items-center gap-2">
                        {guestSettingsOpen ? (
                            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                        )}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Guest Settings</h3>
                        {hasUnsavedChanges && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900/50 text-orange-800 dark:text-orange-200 ml-2">
                                Unsaved Changes
                            </span>
                        )}
                    </div>
                    <Settings className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>
                {guestSettingsOpen && (
                    <div id="guest-settings-content" className="px-6 pb-6 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Column 1: Private Guest List, Maybe RSVP Option (Family Headcount hidden) */}
                            <div className="space-y-4">
                                <Card className="rounded-xl p-4 bg-muted/50 border border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
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
                                </Card>
                                <Card className="rounded-xl p-4 bg-muted/50 border border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
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
                                </Card>
                                {/* Family Headcount is hidden from UI but always set in model if Plus Ones is true */}
                            </div>
                            {/* Column 2: Plus Ones */}
                            <div className="space-y-4">
                                <Card className="rounded-xl p-4 bg-muted/50 border border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
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
                                        <div className="mt-4">
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
                                </Card>
                            </div>
                            {/* Column 3: Guest Limit */}
                            <div className="space-y-4">
                                <Card className="rounded-xl p-4 bg-muted/50 border border-border">
                                    <div className="flex items-center justify-between">
                                        <div>
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
                                        <div className="mt-4">
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
                                </Card>
                            </div>
                        </div>
                        {hasUnsavedChanges && (
                            <div className="mt-6">
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
                )}
            </Card>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
                <div className="xl:col-span-1 space-y-6">
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
            </div>
        </div>
    );
}