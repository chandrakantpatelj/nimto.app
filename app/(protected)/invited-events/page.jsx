'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  AlertCircle,
  CalendarDays,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  User,
  XCircle,
  Heart,
  Share2,
  ArrowRight,
  Sparkles,
  Gift,
  PartyPopper,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function InvitedEventsPage() {
  const router = useRouter();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session } = useSession();
  const searchParams = useSearchParams();

  // Get parameters from URL
  const email = searchParams.get('email');
  const userId = searchParams.get('userId');

  useEffect(() => {
    fetchInvitedEvents();
  }, [session?.user?.email, email, userId]);

  const fetchInvitedEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters - only include email/userId for authenticated users
      // Don't include eventId to get ALL invited events for the list view
      const params = new URLSearchParams();

      // If user is authenticated, use their email
      if (session?.user?.email) {
        params.append('email', session.user.email);
      } else if (email) {
        params.append('email', email);
      } else if (userId) {
        params.append('userId', userId);
      }

      const queryString = params.toString();
      const url = queryString ? `/api/attendee/events?${queryString}` : '/api/attendee/events';

      const response = await apiFetch(url);

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const data = await response.json();
      setEvents(data?.data || []);
    } catch (err) {
      console.error('Error fetching invited events:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'PENDING':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'DECLINED':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    if (status === 'CONFIRMED') {
      return 'bg-green-500 hover:bg-green-600';
    }
    if (status === 'PENDING') {
      return 'bg-yellow-500 hover:bg-yellow-600';
    }
    return 'bg-red-500 hover:bg-red-600';
  };

  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return 'Invalid Date';
    }
  };

  const formatEventDate = (dateString) => {
    try {
      if (!dateString) return 'N/A';
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2 text-red-600">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button
            onClick={fetchInvitedEvents}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 p-8 text-white mb-8">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <PartyPopper className="h-6 w-6" />
              </div>
              <h1 className="text-3xl font-bold">Your Invited Events</h1>
            </div>
            <p className="text-blue-100 text-lg mb-2">
              Discover amazing events you've been invited to attend
            </p>
            {events.length > 0 && (
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                <span className="text-blue-200">
                  {events.length} exciting event{events.length !== 1 ? 's' : ''} waiting for you
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Events List */}
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full flex items-center justify-center">
                <CalendarDays className="h-16 w-16 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Gift className="h-4 w-4 text-yellow-800" />
              </div>
            </div>
            
            <div className="text-center max-w-md">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No Events Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                You haven't been invited to any events yet. When you receive invitations, 
                they'll appear here with all the details you need.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button variant="outline" className="flex items-center gap-2">
                  <Share2 className="h-4 w-4" />
                  Share Your Profile
                </Button>
                <Button variant="primary" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Explore Events
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {events.map((event) => {
              const userGuest = event.guests?.[0];
              
              return (
                <Card
                  key={event.id}
                  className="group relative overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white dark:bg-gray-800"
                >
                  {/* Event Image */}
                  {event.s3ImageUrl ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={event.s3ImageUrl}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                      
                      {/* Status Badge */}
                      {userGuest && (
                        <div className="absolute top-4 right-4">
                          <Badge 
                            className={`${getStatusBadgeClass(userGuest.status)} text-white border-0 shadow-lg`}
                          >
                            {getStatusIcon(userGuest.status)}
                            <span className="ml-1 font-medium">{userGuest.status}</span>
                          </Badge>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 flex items-center justify-center">
                      <div className="text-center">
                        <CalendarDays className="h-16 w-16 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                        <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                          {event.title}
                        </p>
                      </div>
                      
                      {/* Status Badge */}
                      {userGuest && (
                        <div className="absolute top-4 right-4">
                          <Badge 
                            className={`${getStatusBadgeClass(userGuest.status)} text-white border-0 shadow-lg`}
                          >
                            {getStatusIcon(userGuest.status)}
                            <span className="ml-1 font-medium">{userGuest.status}</span>
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}

                  <CardContent className="p-6">
                    {/* Event Title */}
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {event.title}
                    </h3>

                    {/* Event Details */}
                    <div className="space-y-3 mb-4">
                      {event.date && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <CalendarDays className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {formatEventDate(event.date)}
                          </span>
                        </div>
                      )}
                      
                      {event.time && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium">
                            {event.time}
                          </span>
                        </div>
                      )}
                      
                      {event.location && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <MapPin className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                          </div>
                          <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                            {event.location}
                          </span>
                        </div>
                      )}
                      
                      {event.User && (
                        <div className="flex items-center gap-3 text-sm">
                          <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <User className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                                {(event.User.name || event.User.email || 'H').charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-gray-700 dark:text-gray-300 font-medium">
                              {event.User.name || event.User.email}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Event Description */}
                    {event.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Invitation Info */}
                    {userGuest && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-4 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        Invited {formatDate(userGuest.invitedAt)}
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 group/btn"
                      onClick={() => {
                        const guestId = userGuest?.id;
                        if (guestId) {
                          router.push(`/events/${event.id}/invitation/${guestId}`);
                        } else {
                          console.error('Guest ID not found');
                        }
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      View Event Details
                      <ArrowRight className="h-4 w-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
