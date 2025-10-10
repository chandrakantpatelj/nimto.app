'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ArrowLeft, CalendarDays, Clock, MapPin, User } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import {
    getCategoryTheme,
    getFallbackGradientClasses,
    getHeaderGradientClasses,
} from '@/lib/category-themes';
import {
    formatDateInTimezone,
    formatTimeInTimezone,
    getTimezoneAbbreviation,
} from '@/lib/date-utils';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import RSVPForm from '@/components/rsvp/rsvp-form';
import { GoogleMap } from '@/components/location/google-map';
import { geocodeAddressIfNeeded } from '@/lib/utils';
import { DEFAULT_MAP_CENTER } from '@/lib/constants';

export default function PublicEventInvitationPage() {
    const [event, setEvent] = useState(null);
    const [guest, setGuest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mapCenter, setMapCenter] = useState(null);
    const [mapLoading, setMapLoading] = useState(false);

    const params = useParams();

    const eventId = params.eventId;
    const guestId = params.guestId;

    let isShowMap = false;

    useEffect(() => {
        if (eventId && guestId) {
            fetchEventAndGuest();
        }
    }, [eventId, guestId]);

    const fetchEventAndGuest = async () => {
        try {
            setLoading(true);
            setError(null);

            // First, get the guest record to get the email
            const guestResponse = await apiFetch(`/api/public/guests/${guestId}`);

            if (!guestResponse.ok) {
                const errorData = await guestResponse.json().catch(() => ({}));
                const errorInfo = {
                    message: errorData.message || 'Guest invitation not found or invalid',
                    errorType: errorData.errorType || 'UNKNOWN_ERROR',
                    originalError: errorData.error || 'Unknown error',
                };
                throw errorInfo;
            }

            const guestData = await guestResponse.json();
            const guestRecord = guestData.data;
            isShowMap = guestRecord?.event.showMap;
            if (!guestRecord || guestRecord.eventId !== eventId) {
                const error = new Error(
                    'The invitation link appears to be corrupted or invalid. Please check the link and try again.',
                );
                error.errorType = 'INVALID_LINK';
                error.originalError = 'Invalid invitation link';
                throw error;
            }

            setGuest(guestRecord);

            // The guest record includes event information, so we can use it directly
            const eventWithGuest = {
                ...guestRecord.event,
                guests: [guestRecord], // Include the guest data in the event
            };

            setEvent(eventWithGuest);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // Geocode map center if needed
    useEffect(() => {
        const fetchMapCenter = async () => {
            if (
                event &&
                event.showMap &&
                event.locationAddress &&
                !event.mapCenter
            ) {
                setMapLoading(true);
                try {
                    const eventWithMap = await geocodeAddressIfNeeded(event);
                    console.log('Geocoded event:', eventWithMap);
                    if (eventWithMap && eventWithMap.mapCenter) {
                        setMapCenter(eventWithMap.mapCenter);
                    } else {
                        setMapCenter(DEFAULT_MAP_CENTER); // fallback: SF
                    }
                } catch {
                    setMapCenter(DEFAULT_MAP_CENTER);
                } finally {
                    setMapLoading(false);
                }
            } else if (event && event.mapCenter) {
                setMapCenter(event.mapCenter);
            }
        };
        fetchMapCenter();
    }, [event]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        const getErrorIcon = (errorType) => {
            switch (errorType) {
                case 'EVENT_CANCELLED':
                    return '❌';
                case 'EVENT_COMPLETED':
                    return '✅';
                case 'EVENT_REMOVED':
                    return '🗑️';
                case 'EVENT_NOT_FOUND':
                    return '🔍';
                case 'INVALID_INVITATION':
                    return '🔗';
                case 'INVALID_LINK':
                    return '⚠️';
                default:
                    return '❓';
            }
        };

        const getErrorTitle = (errorType) => {
            switch (errorType) {
                case 'EVENT_CANCELLED':
                    return 'Event Cancelled';
                case 'EVENT_COMPLETED':
                    return 'Event Completed';
                case 'EVENT_REMOVED':
                    return 'Event Removed';
                case 'EVENT_NOT_FOUND':
                    return 'Event Not Found';
                case 'INVALID_INVITATION':
                    return 'Invalid Invitation';
                case 'INVALID_LINK':
                    return 'Invalid Link';
                default:
                    return 'Error';
            }
        };

        const getErrorSuggestions = (errorType) => {
            switch (errorType) {
                case 'EVENT_CANCELLED':
                    return [
                        'Contact the event organizer for more information',
                        'Check if the event has been rescheduled',
                        'Look for alternative events on our platform',
                    ];
                case 'EVENT_COMPLETED':
                    return [
                        'This event has already taken place',
                        'Check with the organizer for future events',
                        'Browse other upcoming events on our platform',
                        'Thank you for your interest in the event!',
                    ];
                case 'EVENT_REMOVED':
                    return [
                        'The host/organizer may have deleted this event',
                        'Contact the organizer directly for updates',
                        'The event may have been removed from the platform',
                        'Browse other available events',
                    ];
                case 'EVENT_NOT_FOUND':
                    return [
                        'The event may have been deleted by the host',
                        'Check with the person who sent you this invitation',
                        'Verify the invitation link is correct',
                        'The host account may have been removed',
                    ];
                case 'INVALID_INVITATION':
                    return [
                        'Double-check the invitation link',
                        'Contact the event organizer for a new invitation',
                        "Make sure you're using the correct link",
                    ];
                case 'INVALID_LINK':
                    return [
                        'Copy and paste the link again',
                        'Check for any missing characters',
                        'Ask the organizer to resend the invitation',
                    ];
                default:
                    return [
                        'Try refreshing the page',
                        'Check your internet connection',
                        'Contact support if the problem persists',
                    ];
            }
        };

        const errorType = error.errorType || 'UNKNOWN_ERROR';
        const errorMessage =
            error.message ||
            (typeof error === 'string' ? error : 'An unexpected error occurred');
        const suggestions = getErrorSuggestions(errorType);

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-slate-900/50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
                        <CardContent className="p-8 text-center">
                            {/* Error Icon */}
                            <div className="text-6xl mb-6">{getErrorIcon(errorType)}</div>

                            {/* Error Title */}
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                {getErrorTitle(errorType)}
                            </h1>

                            {/* Error Message */}
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                {errorMessage}
                            </p>

                            {/* Suggestions */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
                                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                                    What you can do:
                                </h3>
                                <ul className="text-left space-y-2">
                                    {suggestions.map((suggestion, index) => (
                                        <li
                                            key={`suggestion-${index}-${suggestion.slice(0, 20)}`}
                                            className="flex items-start gap-3 text-blue-800 dark:text-blue-200"
                                        >
                                            <span className="text-blue-500 dark:text-blue-400 mt-1">
                                                •
                                            </span>
                                            <span>{suggestion}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={fetchEventAndGuest}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    🔄 Try Again
                                </Button>
                                <Link href="/">
                                    <Button className="flex items-center gap-2">
                                        🏠 Go to Home
                                    </Button>
                                </Link>
                            </div>

                            {/* Contact Information */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Need help? Contact our support team or reach out to the event
                                    organizer.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    if (!event || !guest) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-slate-900/50 flex items-center justify-center p-4">
                <div className="max-w-2xl w-full">
                    <Card className="border-0 shadow-2xl bg-white dark:bg-gray-800">
                        <CardContent className="p-8 text-center">
                            {/* Error Icon */}
                            <div className="text-6xl mb-6">🔍</div>

                            {/* Error Title */}
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                                Invitation Not Found
                            </h1>

                            {/* Error Message */}
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                                The invitation you're looking for doesn't exist or is no longer
                                valid. This could happen if the event has been completed,
                                cancelled, removed by the host, or the invitation link is
                                incorrect.
                            </p>

                            {/* Suggestions */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-8">
                                <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-300 mb-4">
                                    What you can do:
                                </h3>
                                <ul className="text-left space-y-2">
                                    <li className="flex items-start gap-3 text-blue-800 dark:text-blue-200">
                                        <span className="text-blue-500 dark:text-blue-400 mt-1">
                                            •
                                        </span>
                                        <span>
                                            Check with the person who sent you this invitation
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-blue-800 dark:text-blue-200">
                                        <span className="text-blue-500 dark:text-blue-400 mt-1">
                                            •
                                        </span>
                                        <span>
                                            Verify the invitation link is complete and correct
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-blue-800 dark:text-blue-200">
                                        <span className="text-blue-500 dark:text-blue-400 mt-1">
                                            •
                                        </span>
                                        <span>
                                            Contact the event organizer for a new invitation
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-3 text-blue-800 dark:text-blue-200">
                                        <span className="text-blue-500 dark:text-blue-400 mt-1">
                                            •
                                        </span>
                                        <span>
                                            The host may have deleted the event or their account
                                        </span>
                                    </li>
                                </ul>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Button
                                    onClick={fetchEventAndGuest}
                                    variant="outline"
                                    className="flex items-center gap-2"
                                >
                                    🔄 Try Again
                                </Button>
                                <Link href="/">
                                    <Button className="flex items-center gap-2">
                                        🏠 Go to Home
                                    </Button>
                                </Link>
                            </div>

                            {/* Contact Information */}
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-600">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Need help? Contact our support team or reach out to the event
                                    organizer.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    }

    const userGuest = event.guests?.[0] || guest; // Use the guest from event or fallback to direct guest

    // Get category from template or default
    const category = event?.Template?.category || 'default';
    const categoryTheme = getCategoryTheme(category);

    const handleRSVPUpdate = (updatedGuest) => {
        // Update the event state with the new guest information
        setEvent((prevEvent) => ({
            ...prevEvent,
            guests: [updatedGuest],
        }));
        setGuest(updatedGuest);
    };

    // Create a session-like object for the RSVPForm (since it expects session data)
    const guestSession = {
        user: {
            name: guest.name,
            email: guest.email,
        },
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-slate-900/50">
            {/* Main Content - Portrait Layout */}
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {/* Portrait Layout Grid - Image Left, Details Right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {/* Left Column - Event Image */}
                    <div className="order-1 lg:order-1">
                        <div className="relative lg:sticky lg:top-6">
                            <div className="border-2  rounded-lg bg-white dark:bg-gray-800 shadow-lg">
                                {event?.eventThumbnailUrl || event?.s3ImageUrl ? (
                                    <div className="relative w-full bg-gray-50 dark:bg-gray-900 flex items-center justify-center rounded-lg overflow-hidden">
                                        <img
                                            src={event?.eventThumbnailUrl || event?.s3ImageUrl}
                                            alt={event?.title}
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </div>
                                ) : (
                                    /* Fallback when no image */
                                    <div
                                        className={`relative w-full aspect-[3/4] ${getFallbackGradientClasses(category)} flex items-center justify-center rounded-lg`}
                                    >
                                        <div className="text-center text-white p-6">
                                            <div className="mb-4 text-5xl sm:text-6xl drop-shadow-lg">
                                                {categoryTheme.icon}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Event Details & RSVP */}
                    <div className="order-2 lg:order-2 space-y-6">
                        {/* Event Details Card */}
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-slate-800/50 dark:border-gray-700">
                            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                                <CardTitle className="text-xl font-bold flex items-center gap-3">
                                    <CalendarDays className="h-6 w-6" />
                                    Event Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 dark:text-gray-100">
                                <div className="space-y-4">
                                    {/* Event Description */}
                                    {event.description && (
                                        <div className="pb-4 border-b border-gray-200 dark:border-gray-600">
                                            <h3 className="font-bold mb-3 text-lg text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                                                {event?.title}
                                            </h3>
                                            <div className="p-4 bg-gradient-to-br from-gray-50 to-blue-50/50 dark:from-gray-700/50 dark:to-blue-900/20 rounded-lg border border-gray-100 dark:border-gray-600">
                                                <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                                                    {event.description}
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Event Details - 2x2 Grid Layout */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Date Card */}
                                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-100 dark:border-blue-800 shadow-sm hover:shadow-md transition-all duration-300">
                                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg">
                                                <CalendarDays className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-blue-900 dark:text-blue-300 text-sm block mb-1">
                                                    Date
                                                </span>
                                                <p className="text-blue-700 dark:text-blue-200 font-medium">
                                                    {formatDateInTimezone(
                                                        event.startDateTime,
                                                        event.timezone || 'UTC',
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Time Card */}
                                        {event.startDateTime && (
                                            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-lg border border-purple-100 dark:border-purple-800 shadow-sm hover:shadow-md transition-all duration-300">
                                                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg">
                                                    <Clock className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-purple-900 dark:text-purple-300 text-sm block mb-1">
                                                        Time
                                                    </span>
                                                    <p className="text-purple-700 dark:text-purple-200 font-medium">
                                                        {formatTimeInTimezone(
                                                            event.startDateTime,
                                                            event.timezone || 'UTC',
                                                        )}{' '}
                                                        {getTimezoneAbbreviation(event.timezone || 'UTC')}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {(event.locationAddress || event.locationUnit) && (
                                                <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border border-red-100 dark:border-red-800 shadow-sm hover:shadow-md transition-all duration-300">
                                                    <div className="p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-lg shadow-lg">
                                                        <MapPin className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <span className="font-semibold text-red-900 dark:text-red-300 text-sm block mb-1">
                                                            Location
                                                        </span>
                                                        <p className="text-red-700 dark:text-red-200 font-medium">
                                                            {event.locationAddress}
                                                            {event.locationUnit
                                                                ? `, ${event.locationUnit}`
                                                                : ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                        {event.User && (
                                            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-100 dark:border-green-800 shadow-sm hover:shadow-md transition-all duration-300">
                                                <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg">
                                                    <User className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <span className="font-semibold text-green-900 dark:text-green-300 text-sm block mb-1">
                                                        Hosted by
                                                    </span>
                                                    <p className="text-green-700 dark:text-green-200 font-medium">
                                                        {event.User.name || event.User.email}
                                                    </p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Event Location Card */}
                        {(event.locationAddress || event.locationUnit) && event.showMap && (
                            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-800 dark:to-slate-800/50 dark:border-gray-700">
                                <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
                                    <CardTitle className="text-xl font-bold flex items-center gap-3">
                                        <CalendarDays className="h-6 w-6" />
                                        Event Location
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-6 dark:text-gray-100">
                                    <div className="w-full rounded-lg overflow-hidden border border-red-100 dark:border-red-800 h-48">
                                        {mapLoading ? (
                                            <div className="flex items-center justify-center h-full">
                                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                                                <span className="ml-3 text-slate-600 dark:text-slate-300">
                                                    Loading map...
                                                </span>
                                            </div>
                                        ) : mapCenter ? (
                                            <GoogleMap center={mapCenter} className="h-full w-full" />
                                        ) : (
                                            <div className="flex items-center justify-center h-full text-slate-500 dark:text-slate-400">
                                                Map not available
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* RSVP Form */}
                        <RSVPForm
                            event={event}
                            userGuest={userGuest}
                            onRSVPUpdate={handleRSVPUpdate}
                            session={guestSession}
                        />
                    </div>
                </div>

                {/* Mobile-friendly spacing */}
                <div className="h-8"></div>
            </div>
        </div>
    );
}