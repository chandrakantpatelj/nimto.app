'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
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
import { Button } from '@/components/ui/button';
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
    if (!query.trim()) return;

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
    handleSearch(term);
  };

  // Clear search results and reset to search interface
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCategory('');
    setCategoryResults([]);
  };

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

      {/* Hero Banner */}
      <section className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-20">
        <div className="max-w-7xl mx-auto px-6  lg:py-20 md:py-16 py-10 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6">
            Make Every Event Memorable
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8">
            Create beautiful invitations, track RSVPs, and bring people together
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              variant="destructive"
              asChild
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="bg-white text-purple-600 border-white hover:bg-gray-100"
            >
              <Link href="/templates">Browse Templates</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Templates Section - Hidden when category or search is active */}
      {(!isAuthenticated || !roles.isAttendee) && 
        !searchQuery && !selectedCategory && (
        <section className="w-full py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <HomeTemplatesPreview />
          </div>
        </section>
      )}

      {/* Invitation Categories Section */}
      {(!isAuthenticated || !roles.isAttendee) && (
        <section className="w-full py-20 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Browse Invitation Categories
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Find the perfect template for your special occasion
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

      {/* Search Templates Section */}
      {(!isAuthenticated || !roles.isAttendee) &&
        !selectedCategory &&
        !searchQuery && (
          <section id="search-section" className="w-full py-20 bg-white dark:bg-gray-900">
            <div className="max-w-4xl mx-auto px-6 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                Find Your Perfect Template
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
                Search through hundreds of professionally designed templates
              </p>

              {/* Search Bar */}
              <div className="relative max-w-2xl mx-auto mb-8">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Search templates by occasion, style, or keyword..."
                    className="w-full px-6 py-4 pl-14 pr-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                  <Button
                    onClick={() => handleSearch()}
                    disabled={isSearching}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
                  >
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>
              </div>

              {/* Popular Searches */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Popular Searches
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    'Birthday Party',
                    'Wedding Invitation',
                    'Baby Shower',
                    'Holiday Party',
                    'Corporate Event',
                    'Graduation',
                    'Anniversary',
                    'Housewarming',
                  ].map((term) => (
                    <button
                      key={term}
                      onClick={() => handlePopularSearch(term)}
                      className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Save Favorites
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Save templates you love for later
                  </p>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-green-600 dark:text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Filter & Sort
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Find exactly what you're looking for
                  </p>
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-xl">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-purple-600 dark:text-purple-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Quick Preview
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    See templates in action instantly
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

      {/* Category Filter Results Section */}
      {(!isAuthenticated || !roles.isAttendee) && 
        selectedCategory && !searchQuery && (
        <section className="w-full py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                {selectedCategory} Templates
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Templates in the "{selectedCategory}" category
              </p>
            </div>

            {/* Clear Category Filter */}
            <div className="text-center mb-12">
              <button
                onClick={() => {
                  setSelectedCategory('');
                  setCategoryResults([]);
                }}
                className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                ← Back to All Categories
              </button>
            </div>

            {isCategoryLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-4 text-gray-600 dark:text-gray-300">
                  Loading {selectedCategory} templates...
                </span>
              </div>
            ) : categoryResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categoryResults.map((template) => (
                  <div
                    key={template.id}
                    className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
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
                      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                        <h3 className="font-bold text-lg mb-2 line-clamp-2">
                          {template.name}
                        </h3>

                        {/* Template Meta Info */}
                        <div className="space-y-1 text-sm opacity-90">
                          <div className="flex items-center">
                            <Calendar className="h-3 w-3 mr-1.5" />
                            <span>
                              {template.category || 'Event Template'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Hover Action Buttons */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="flex flex-col gap-2">
                          <Button
                            asChild
                            className="bg-white text-gray-900 hover:bg-gray-100 font-medium"
                          >
                            <Link href={`/events/design/${template.id}`}>
                              Use Template
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
                  No templates found in "{selectedCategory}"
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Try selecting a different category or browse all templates
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
                  <Button
                    variant="primary"
                    asChild
                  >
                    <Link href="/templates">Browse All Templates</Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Search Results Section */}
      {(!isAuthenticated || !roles.isAttendee) &&
        (searchResults.length > 0 || isSearching) && (
          <section className="w-full py-20 bg-gray-50 dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  {isSearching ? 'Searching...' : 'Search Results'}
                </h2>
                {searchQuery && (
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Results for "{searchQuery}"
                  </p>
                )}
                {selectedCategory && (
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Templates in "{selectedCategory}" category
                  </p>
                )}
              </div>

              {/* Persistent Search Bar in Results */}
              <div className="max-w-4xl mx-auto mb-12">
                <div className="relative max-w-2xl mx-auto mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                      placeholder="Search templates by occasion, style, or keyword..."
                      className="w-full px-6 py-4 pl-14 pr-4 text-lg border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Search className="w-6 h-6 text-gray-400" />
                    </div>
                    <Button
                      onClick={() => handleSearch()}
                      disabled={isSearching}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
                    >
                      {isSearching ? 'Searching...' : 'Search'}
                    </Button>
                  </div>
                </div>

                {/* Clear Search Button */}
                <div className="text-center">
                  <Button
                    onClick={clearSearch}
                    variant="outline"
                    className="mr-4"
                  >
                    Clear Search
                  </Button>
                  <Button
                    variant="ghost"
                    asChild
                  >
                    <a href="#search-section">Back to Search</a>
                  </Button>
                </div>
              </div>

              {isSearching ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  <span className="ml-4 text-gray-600 dark:text-gray-300">
                    Searching templates...
                  </span>
                </div>
              ) : searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {searchResults.map((template) => (
                    <div
                      key={template.id}
                      className="group relative rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
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
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="font-bold text-lg mb-2 line-clamp-2">
                            {template.name}
                          </h3>

                          {/* Template Meta Info */}
                          <div className="space-y-1 text-sm opacity-90">
                            <div className="flex items-center">
                              <Calendar className="h-3 w-3 mr-1.5" />
                              <span>
                                {template.category || 'Event Template'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Hover Action Buttons */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                          <div className="flex flex-col gap-2">
                            <Button
                              asChild
                              className="bg-white text-gray-900 hover:bg-gray-100 font-medium"
                            >
                              <Link href={`/events/design/${template.id}`}>
                                Use Template
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
                    No templates found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-6">
                    Try adjusting your search terms or browse our categories
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button
                      onClick={clearSearch}
                      variant="outline"
                    >
                      Clear Search
                    </Button>
                    <Button
                      variant="primary"
                      asChild
                    >
                      <a href="/templates">Browse All Templates</a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

      {/* What would you like to create? Section */}
      <section className="w-full py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              What would you like to create?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Make an Invitation Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Make an Invitation
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Create stunning digital invitations for any occasion. Choose
                from hundreds of templates.
              </p>
              <Button variant="primary" asChild className="w-full">
                <Link href="/events">Start Creating</Link>
              </Button>
            </div>

            {/* Upload Your Own Design Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Upload className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Upload Your Own Design
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Add your personal touch with custom designs and photos for
                unique invitations.
              </p>
              <Button variant="primary" asChild className="w-full">
                <Link href="/events">Upload Design</Link>
              </Button>
            </div>

            {/* Send Gift Cards Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Gift className="w-12 h-12 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Send Gift Cards
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Shop digital gift cards from top retailers and send them
                instantly to guests.
              </p>
              <Button variant="primary" asChild className="w-full">
                <Link href="/store-client">Browse Cards</Link>
              </Button>
            </div>

            {/* Create SignUp Sheet Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-12 h-12 text-orange-600 dark:text-orange-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Create SignUp Sheet
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Organize volunteers and coordinate what guests should bring to
                your event.
              </p>
              <Button variant="primary" asChild className="w-full">
                <Link href="/events">Create Sheet</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Our Platform? Section */}
      <section className="w-full py-20 bg-white dark:bg-gray-900">
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
      {isAuthenticated && roles.isAttendee && (
        <section className="w-full py-20 bg-white dark:bg-gray-900">
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
                        <Link
                          href={`/events/${event.id}/invitation/${userGuest?.id}`}
                        >
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

      {/* Footer */}
      <footer className="w-full bg-gray-800 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Create */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Create</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/events"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Invitations
                  </Link>
                </li>
                <li>
                  <Link
                    href="/templates"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    eCards
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Announcements
                  </Link>
                </li>
                <li>
                  <Link
                    href="/events"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    SignUp Sheets
                  </Link>
                </li>
              </ul>
            </div>

            {/* Occasions */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Occasions
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/templates"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Birthday Parties
                  </Link>
                </li>
                <li>
                  <Link
                    href="/templates"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Weddings
                  </Link>
                </li>
                <li>
                  <Link
                    href="/templates"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Baby Showers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/templates"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Holidays
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/help"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/about"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href="/careers"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href="/press"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Press
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400">©2025 Nimto. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
