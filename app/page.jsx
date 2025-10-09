'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  CheckCircle,
  ClipboardList,
  FileText,
  Gift,
  Mail,
  Palette,
  Search,
  Smartphone,
  Upload,
  Users,
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { apiFetch } from '@/lib/api';
import { useRoleBasedAccess } from '@/hooks/use-role-based-access';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CommonFooter } from '@/components/common/footer';
import { DynamicCategories } from '@/app/components/dynamic-categories';
import { HomeTemplatesPreview } from '@/app/components/home-templates-preview';
import { Header } from '@/app/components/layouts/demo1/components/header';

export default function HomePage() {
  const { data: session, status } = useSession();
  const { roles } = useRoleBasedAccess();
  const isAuthenticated = status === 'authenticated' && session;
  const isLoading = status === 'loading';
  const [invitedEvents, setInvitedEvents] = useState([]);
  const [eventsLoading, setEventsLoading] = useState(false);

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [categoryResults, setCategoryResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);

  // Search templates function
  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      // Clear search results when query is empty
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await apiFetch(
        `/api/template?search=${encodeURIComponent(query)}&limit=12`,
      );
      if (response.ok) {
        const result = await response.json();
        setSearchResults(result.data || []);
      }
    } catch (error) {
      console.error('Error searching templates:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle category selection
  const handleCategorySelect = async (category) => {
    setSelectedCategory(category);
    setIsCategoryLoading(true);
    try {
      const response = await apiFetch(
        `/api/template?category=${encodeURIComponent(category)}&limit=12`,
      );
      if (response.ok) {
        const result = await response.json();
        setCategoryResults(result.data || []);
      }
    } catch (error) {
      console.error('Error filtering by category:', error);
    } finally {
      setIsCategoryLoading(false);
    }
  };

  // Handle popular search term click
  const handlePopularSearch = (term) => {
    setSearchQuery(term);
    // Auto-search will be triggered by useEffect
  };

  // Clear search results and reset to search interface
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCategory('');
    setCategoryResults([]);
  };

  // Auto-search when search query changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(searchQuery);
    }, 300); // Debounce search by 300ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Fetch invited events for attendees
  useEffect(() => {
    const fetchInvitedEvents = async () => {
      if (isAuthenticated && roles.isAttendee && session?.user?.email) {
        try {
          setEventsLoading(true);
          const response = await apiFetch(
            `/api/attendee/events?email=${session.user.email}`,
          );
          if (response.ok) {
            const data = await response.json();
            setInvitedEvents(data?.data || []);
          }
        } catch (error) {
          console.error('Error fetching invited events:', error);
        } finally {
          setEventsLoading(false);
        }
      }
    };

    fetchInvitedEvents();
  }, [isAuthenticated, roles.isAttendee, session?.user?.email]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 w-full flex flex-col">
      <Header />

      {/* Search Templates Section - Always visible at top */}
      {(!isAuthenticated || !roles.isAttendee) && (
        <section
          id="search-section"
                  className="w-full sm:py-16 md:py-16 lg:pb-0 lg:pt-5  bg-gray-50 dark:bg-gray-800"
        >
          <div className="max-w-4xl mx-auto px-6 text-center pt-20">
            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-4 sm:mb-6 md:mb-8">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates by occasion, style, or keyword..."
                  className="w-full px-4 sm:px-6 py-3 sm:py-4 pl-12 sm:pl-14 pr-4 text-base sm:text-lg border border-gray-300 dark:border-white-600 rounded-lg sm:rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2">
                  <Search className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400 dark:text-white" />
                </div>
                {/* {isSearching && (
                  <div className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-600"></div>
                  </div>
                )} */}
              </div>
            </div>

            {/* Search Results - Display within the same section */}
            {(searchQuery || searchResults.length > 0 || isSearching) && (
              <div className="my-8 sm:mt-12">
                {/* Clear Search Button */}
                <div className="text-center mb-6 sm:mb-8">
                  <Button
                    onClick={clearSearch}
                    variant="outline"
                    className="mr-4"
                  >
                    Clear Search
                  </Button>
                  {/* <Button
                    variant="ghost"
                    asChild
                  >
                    <a href="#search-section">Back to Search</a>
                  </Button> */}
                </div>

                {isSearching ? (
                  <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <span className="ml-4 text-gray-600 dark:text-gray-300">
                      Searching templates...
                    </span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
                    {searchResults.map((template) => (
                      <div
                        key={template.id}
                        className="group relative rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
                      >
                        {/* Template Background Image */}
                        <div className="relative aspect-[3/4] overflow-hidden">
                          {template.templateThumbnailUrl ||
                          template.s3ImageUrl ? (
                            <img
                              src={
                                template.templateThumbnailUrl ||
                                template.s3ImageUrl
                              }
                              alt={template.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"></div>
                          )}

                          {/* Dark Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                          {/* Status Badge */}
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-white/90 dark:bg-gray-800/90 text-gray-700 dark:text-gray-300 text-xs font-medium px-2 py-1 shadow-sm">
                              Design
                            </Badge>
                          </div>

                          {/* Content Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 text-white">
                            <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-2">
                              {template.name}
                            </h3>
                          </div>

                          {/* Template Meta Info */}
                          {/* <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm opacity-90">
                            <div className="flex items-center">
                              <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" />
                              <span className="truncate">{template.category || 'Event Template'}</span>
                            </div>

                            <div className="flex items-center">
                              <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                              </svg>
                              <span className="truncate">Ready to use</span>
                            </div>

                            <div className="flex items-center">
                              <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1 sm:mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              <span className="truncate">by {template.isSystemTemplate ? 'Nimto' : 'Community'}</span>
                            </div>
                          </div> */}

                          {/* Hover Action Buttons */}
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                            <div className="flex flex-col gap-1 sm:gap-2">
                              <Button
                                onClick={() =>
                                  handleTemplateSelect(template, 'home')
                                }
                                asChild
                                size="sm"
                                className="bg-white text-gray-900 hover:bg-gray-100 font-medium text-xs sm:text-sm"
                              >
                                <Link href={`/events/design/${template.id}`}>
                                  Use Design
                                </Link>
                              </Button>
                              {template.isPremium && (
                                <div className="text-center">
                                  <Badge className="bg-yellow-500 text-white text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">
                                    ${template.price || 20}
                                  </Badge>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Search className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      No designs found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Try adjusting your search terms or browse our categories
                    </p>
                    <div className="flex justify-center gap-4">
                      <Button variant="primary" asChild>
                        <a href="/templates">Browse All Designs</a>
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Featured Templates Section - Hidden when category or search is active */}
      {(!isAuthenticated || !roles.isAttendee) &&
        !searchQuery &&
        !selectedCategory && (
          <section className="w-full py-10 bg-white dark:bg-gray-900">
            <div className="mx-auto px-6">
              <HomeTemplatesPreview />
            </div>
          </section>
        )}

      {/* Invitation Categories Section */}
      {(!isAuthenticated || !roles.isAttendee) && (
        <section className="w-full py-10 bg-gray-50 dark:bg-gray-800">
          <div className="mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Browse Invitation Categories
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Find the perfect design for your special occasion
              </p>
            </div>

            <DynamicCategories
              onCategorySelect={handleCategorySelect}
              selectedCategory={selectedCategory}
            />

            <div className="text-center mt-12">
              <Button variant="outline" size="lg" asChild>
                <Link href="/templates">View All Categories</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Category Filter Results Section */}
      {(!isAuthenticated || !roles.isAttendee) &&
        selectedCategory &&
        !searchQuery && (
          <section className="w-full py-10 sm:py-16 md:py-20 bg-white dark:bg-gray-900">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-12 sm:mb-16">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
                  {selectedCategory} Designs
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300">
                  Templates in the "{selectedCategory}" category
                </p>
              </div>

              {/* Clear Category Filter */}
              <div className="text-center mb-8 sm:mb-12">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setCategoryResults([]);
                  }}
                  className="inline-flex items-center px-3 sm:px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm sm:text-base"
                >
                  ← Back to All Categories
                </button>
              </div>

              {isCategoryLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-4 text-gray-600 dark:text-gray-300">
                    Loading {selectedCategory} designs...
                  </span>
                </div>
              ) : categoryResults.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6 xl:gap-8">
                  {categoryResults.map((template) => (
                    <div
                      key={template.id}
                      className="group relative rounded-lg sm:rounded-xl lg:rounded-2xl overflow-hidden shadow-sm sm:shadow-lg lg:shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      {/* Template Background Image */}
                      <div className="relative aspect-[3/4] overflow-hidden">
                        {template.templateThumbnailUrl ||
                        template.s3ImageUrl ? (
                          <img
                            src={
                              template.templateThumbnailUrl ||
                              template.s3ImageUrl
                            }
                            alt={template.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20"></div>
                        )}

                        {/* Dark Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        {/* Content Overlay */}
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 lg:p-6 text-white">
                          <h3 className="font-bold text-sm sm:text-lg lg:text-xl mb-1 sm:mb-2 lg:mb-3 line-clamp-2">
                            {template.name}
                          </h3>
                        </div>

                        {/* Hover Action Buttons */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="flex flex-col gap-1 sm:gap-2 lg:gap-3">
                            <Button
                              asChild
                              size="sm"
                              className="bg-white text-gray-900 hover:bg-gray-100 font-medium text-xs sm:text-sm lg:text-base lg:px-6 lg:py-3"
                            >
                              <Link href={`/events/design/${template.id}`}>
                                Use Design
                              </Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    No designs found in "{selectedCategory}"
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Try selecting a different category or browse all designs
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={() => {
                        setSelectedCategory('');
                        setCategoryResults([]);
                      }}
                      variant="outline"
                    >
                      Back to Categories
                    </Button>
                    <Button variant="primary" asChild>
                      <Link href="/templates">Browse All Designs</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

      {/* Why Choose Our Platform? Section */}
      <section className="w-full py-10 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Why Choose Our Platform?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Easy to Use */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Easy to Use
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Intuitive design tools make creating invitations simple and fun.
              </p>
            </div>

            {/* Mobile Friendly */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Smartphone className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Mobile Friendly
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Create and manage events from any device, anywhere.
              </p>
            </div>

            {/* Track RSVPs */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Track RSVPs
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Real-time RSVP tracking and guest management tools.
              </p>
            </div>

            {/* Beautiful Templates */}
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Palette className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Beautiful Templates
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Hundreds of professionally designed templates for every
                occasion.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Invited Events Section for Attendees */}
      {isAuthenticated && invitedEvents.length > 0 && (
        <section className="w-full py-10 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Your Invited Events
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Events you've been invited to attend
              </p>
            </div>

            {eventsLoading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : invitedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {invitedEvents.slice(0, 3).map((event) => {
                  const userGuest = event.guests?.[0];
                  return (
                    <div
                      key={event.id}
                      className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        {userGuest && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              userGuest.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : userGuest.status === 'PENDING'
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
                            }`}
                          >
                            {userGuest.status}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {event.title}
                      </h3>
                      {event.startDateTime && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {new Date(event.startDateTime).toLocaleDateString(
                            'en-US',
                            {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            },
                          )}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-1">
                          📍 {event.location}
                        </p>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="w-full"
                      >
                        <Link href={`/invitation/${event.id}/${userGuest?.id}`}>
                          View Event
                        </Link>
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No Events Yet
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  You haven't been invited to any events yet. Check back later!
                </p>
              </div>
            )}
          </div>
        </section>
      )}

      <CommonFooter />
    </div>
  );
}
