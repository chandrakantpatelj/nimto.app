'use client';

import React, { useEffect, useState } from 'react';
import {
  useActiveFilters,
  useTemplateActions,
  useTemplateCategories,
} from '@/store/hooks';
import { Filter, Search, X } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EnhancedTemplates } from './components/EnhancedTemplates';

export function TemplateManagement() {
  return (
    <Card className="p-4">
      <EnhancedTemplates />
    </Card>
  );
}

export function EnhancedTemplateManagement() {
  // Redux state
  const activeFilters = useActiveFilters();
  const categories = useTemplateCategories();
  const { setActiveFilters, clearActiveFilters, fetchTemplateCategories } =
    useTemplateActions();

  // Local state for UI (will sync with Redux)
  const [searchQuery, setSearchQuery] = useState(
    activeFilters.searchQuery || '',
  );
  const [selectedCategory, setSelectedCategory] = useState(
    activeFilters.selectedCategory || null,
  );
  const [filters, setFilters] = useState({
    orientation: activeFilters.orientation || null,
    premium: activeFilters.premium || null,
    trending: activeFilters.trending || false,
    featured: activeFilters.featured || false,
    new: activeFilters.new || false,
  });

  // Load categories from Redux
  useEffect(() => {
    fetchTemplateCategories();
  }, [fetchTemplateCategories]);

  // Sync local state with Redux when activeFilters change (when returning from edit/view)
  useEffect(() => {
    setSearchQuery(activeFilters.searchQuery || '');
    setSelectedCategory(activeFilters.selectedCategory || null);
    setFilters({
      orientation: activeFilters.orientation || null,
      premium: activeFilters.premium || null,
      trending: activeFilters.trending || false,
      featured: activeFilters.featured || false,
      new: activeFilters.new || false,
    });
  }, [activeFilters]);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setActiveFilters({ searchQuery: value });
  };

  const handleCategorySelect = (categorySlug) => {
    setSelectedCategory(categorySlug);
    setActiveFilters({ selectedCategory: categorySlug });
  };

  const handleOrientationChange = (value) => {
    const newOrientation = value === 'all' ? null : value;
    const newFilters = {
      ...filters,
      orientation: newOrientation,
    };
    setFilters(newFilters);
    setActiveFilters({ orientation: newOrientation });
  };

  const handlePremiumChange = (value) => {
    const newPremium = value === 'all' ? null : value;
    const newFilters = {
      ...filters,
      premium: newPremium,
    };
    setFilters(newFilters);
    setActiveFilters({ premium: newPremium });
  };

  const handleBadgeToggle = (badgeType) => {
    const newFilters = {
      ...filters,
      [badgeType]: !filters[badgeType],
    };
    setFilters(newFilters);
    setActiveFilters({ [badgeType]: !filters[badgeType] });
  };

  const clearFilters = () => {
    const clearedFilters = {
      orientation: null,
      premium: null,
      trending: false,
      featured: false,
      new: false,
    };
    setFilters(clearedFilters);
    setSelectedCategory(null);
    setSearchQuery('');
    clearActiveFilters();
  };

  const hasActiveFilters =
    filters.orientation ||
    filters.premium ||
    filters.trending ||
    filters.featured ||
    filters.new ||
    selectedCategory ||
    searchQuery;

  return (
    <div className="space-y-8 mt-8">
      {/* Category Browse Section */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 mx-4 sm:mx-0">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 text-center font-serif">
          Browse Invitation Categories
        </h2>
        {categories.length > 0 ? (
          <div className="flex flex-wrap justify-center gap-8 sm:gap-10 md:gap-12">
            {/* All Templates */}
            <div
              className="flex flex-col items-center cursor-pointer group"
              onClick={() => handleCategorySelect(null)}
            >
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl flex items-center justify-center overflow-hidden ${
                  selectedCategory === null
                    ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200'
                }`}
              >
                <span
                  className={`font-bold text-2xl sm:text-3xl md:text-4xl ${
                    selectedCategory === null ? 'text-white' : 'text-gray-600'
                  }`}
                >
                  ALL
                </span>
              </div>
              <span
                className={`mt-4 text-sm sm:text-base font-semibold uppercase tracking-wide transition-colors duration-300 ${
                  selectedCategory === null
                    ? 'text-purple-600'
                    : 'text-gray-700'
                }`}
              >
                All Templates
              </span>
            </div>

            {/* Category Items */}
            {categories.map((category, index) => {
              const colors = [
                'from-orange-200 to-orange-300',
                'from-purple-200 to-purple-300',
                'from-amber-200 to-amber-300',
                'from-yellow-200 to-yellow-300',
                'from-blue-200 to-blue-300',
                'from-pink-200 to-pink-300',
                'from-green-200 to-green-300',
                'from-indigo-200 to-indigo-300',
              ];
              const bgColor = colors[index % colors.length];

              return (
                <div
                  key={category.id}
                  className="flex flex-col items-center cursor-pointer group"
                  onClick={() => handleCategorySelect(category.slug)}
                >
                  <div
                    className={`w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl flex items-center justify-center overflow-hidden ${
                      selectedCategory === category.slug
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500'
                        : `bg-gradient-to-br ${bgColor}`
                    }`}
                  >
                    {category.thumbnailUrl ? (
                      <img
                        src={category.thumbnailUrl}
                        alt={category.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <span
                        className={`font-bold text-2xl sm:text-3xl md:text-4xl ${
                          selectedCategory === category.slug
                            ? 'text-white'
                            : 'text-gray-600'
                        }`}
                      >
                        {category.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <span
                    className={`mt-4 text-sm sm:text-base font-semibold uppercase tracking-wide transition-colors duration-300 ${
                      selectedCategory === category.slug
                        ? 'text-purple-600'
                        : 'text-gray-700'
                    }`}
                  >
                    {category.name}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading categories...</p>
            </div>
          </div>
        )}
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 shadow-sm border border-gray-100 mx-4 sm:mx-0">
        {/* Search Bar */}
        <div className="max-w-3xl mx-auto mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 sm:h-6 sm:w-6" />
            <Input
              type="text"
              placeholder="Search by name, category, or theme..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-purple-500 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="border-t border-gray-100 pt-4 sm:pt-6">
          <div className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 sm:gap-3">
              <Filter className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              <span className="font-semibold text-gray-800 text-base sm:text-lg">
                Filters:
              </span>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto">
              {/* Orientation Filter */}
              <Select
                value={filters.orientation || 'all'}
                onValueChange={handleOrientationChange}
              >
                <SelectTrigger className="w-full sm:w-[140px] md:w-[160px] border-2 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Orientation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orientations</SelectItem>
                  <SelectItem value="portrait">Portrait</SelectItem>
                  <SelectItem value="landscape">Landscape</SelectItem>
                  <SelectItem value="square">Square</SelectItem>
                </SelectContent>
              </Select>

              {/* Premium Filter */}
              <Select
                value={filters.premium || 'all'}
                onValueChange={handlePremiumChange}
              >
                <SelectTrigger className="w-full sm:w-[120px] md:w-[140px] border-2 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Badge Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 md:gap-6 w-full sm:w-auto">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Checkbox
                  id="trending"
                  checked={filters.trending}
                  onCheckedChange={() => handleBadgeToggle('trending')}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <label
                  htmlFor="trending"
                  className="text-xs sm:text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  Trending
                </label>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <Checkbox
                  id="featured"
                  checked={filters.featured}
                  onCheckedChange={() => handleBadgeToggle('featured')}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <label
                  htmlFor="featured"
                  className="text-xs sm:text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  Featured
                </label>
              </div>

              <div className="flex items-center space-x-2 sm:space-x-3">
                <Checkbox
                  id="new"
                  checked={filters.new}
                  onCheckedChange={() => handleBadgeToggle('new')}
                  className="w-4 h-4 sm:w-5 sm:h-5"
                />
                <label
                  htmlFor="new"
                  className="text-xs sm:text-sm font-semibold text-gray-700 cursor-pointer"
                >
                  New
                </label>
              </div>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full sm:w-auto sm:ml-auto border-2 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
              >
                <X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs sm:text-sm font-semibold text-gray-600">
                  Active Filters:
                </span>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {selectedCategory && (
                  <Badge
                    variant="secondary"
                    className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 border border-purple-200 text-xs sm:text-sm"
                  >
                    Category:{' '}
                    {categories.find((c) => c.slug === selectedCategory)
                      ?.name || selectedCategory}
                    <X
                      className="h-3 w-3 ml-1 sm:ml-2 cursor-pointer hover:text-purple-900"
                      onClick={() => handleCategorySelect(null)}
                    />
                  </Badge>
                )}
                {filters.orientation && (
                  <Badge
                    variant="secondary"
                    className="px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 border border-blue-200 text-xs sm:text-sm"
                  >
                    {filters.orientation}
                    <X
                      className="h-3 w-3 ml-1 sm:ml-2 cursor-pointer hover:text-blue-900"
                      onClick={() => handleOrientationChange('all')}
                    />
                  </Badge>
                )}
                {filters.premium && (
                  <Badge
                    variant="secondary"
                    className="px-2 sm:px-3 py-1 bg-green-100 text-green-700 border border-green-200 text-xs sm:text-sm"
                  >
                    {filters.premium}
                    <X
                      className="h-3 w-3 ml-1 sm:ml-2 cursor-pointer hover:text-green-900"
                      onClick={() => handlePremiumChange('all')}
                    />
                  </Badge>
                )}
                {filters.trending && (
                  <Badge
                    variant="secondary"
                    className="px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 border border-orange-200 text-xs sm:text-sm"
                  >
                    Trending
                    <X
                      className="h-3 w-3 ml-1 sm:ml-2 cursor-pointer hover:text-orange-900"
                      onClick={() => handleBadgeToggle('trending')}
                    />
                  </Badge>
                )}
                {filters.featured && (
                  <Badge
                    variant="secondary"
                    className="px-2 sm:px-3 py-1 bg-yellow-100 text-yellow-700 border border-yellow-200 text-xs sm:text-sm"
                  >
                    Featured
                    <X
                      className="h-3 w-3 ml-1 sm:ml-2 cursor-pointer hover:text-yellow-900"
                      onClick={() => handleBadgeToggle('featured')}
                    />
                  </Badge>
                )}
                {filters.new && (
                  <Badge
                    variant="secondary"
                    className="px-2 sm:px-3 py-1 bg-pink-100 text-pink-700 border border-pink-200 text-xs sm:text-sm"
                  >
                    New
                    <X
                      className="h-3 w-3 ml-1 sm:ml-2 cursor-pointer hover:text-pink-900"
                      onClick={() => handleBadgeToggle('new')}
                    />
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Templates Grid */}
      <EnhancedTemplates
        searchQuery={searchQuery}
        selectedCategory={selectedCategory}
        filters={filters}
      />
    </div>
  );
}
