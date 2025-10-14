'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
    useActiveFilters,
    useTemplateActions,
    useTemplateCategories,
    useTemplateCategoriesLoading,
    useTemplateCategoriesError,
} from '@/store/hooks';
import { Filter, Search, X } from 'lucide-react';
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
    const categoriesLoading = useTemplateCategoriesLoading();
    const categoriesError = useTemplateCategoriesError();
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

    // Carousel scroll state
    const carouselRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);
    const [isOverflowing, setIsOverflowing] = useState(false);

    // Check scroll position and overflow
    const checkScroll = () => {
        const el = carouselRef.current;
        if (!el) return;
        setIsOverflowing(el.scrollWidth > el.clientWidth + 1);
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };

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

    useEffect(() => {
        checkScroll();
        const el = carouselRef.current;
        if (el) {
            el.addEventListener('scroll', checkScroll);
            window.addEventListener('resize', checkScroll);
        }
        return () => {
            if (el) el.removeEventListener('scroll', checkScroll);
            window.removeEventListener('resize', checkScroll);
        };
    }, [categories.length]);

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
        <div className="space-y-8">
            {/* Category Browse Section */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-slate-700 mx-4 sm:mx-0">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 sm:mb-12 text-center font-serif">
                    Browse Invitation Categories
                </h2>
                {categoriesLoading ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
                            <p className="text-gray-600 dark:text-gray-400">Loading categories...</p>
                        </div>
                    </div>
                ) : categoriesError ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-center">
                            <div className="text-red-500 mb-4">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">Failed to load categories</p>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{categoriesError}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => fetchTemplateCategories()}
                                className="text-purple-600 border-purple-600 hover:bg-purple-50"
                            >
                                Try Again
                            </Button>
                        </div>
                    </div>
                ) : categories.length === 0 ? (
                    <div className="flex justify-center items-center py-8">
                        <div className="text-center">
                            <div className="text-gray-400 mb-4">
                                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400 font-semibold mb-2">No categories found</p>
                            <p className="text-gray-500 dark:text-gray-500 text-sm">Categories are not available at the moment.</p>
                        </div>
                    </div>
                ) : (
                    <div className="relative">
                        {/* Left Arrow */}
                        {isOverflowing && (
                            <button
                                type="button"
                                aria-label="Scroll left"
                                className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 rounded-full shadow p-2 border border-gray-200 dark:border-slate-700 transition-opacity ${canScrollLeft ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}`}
                                onClick={() => {
                                    if (canScrollLeft) {
                                        carouselRef.current.scrollBy({ left: -300, behavior: 'smooth' });
                                        setTimeout(checkScroll, 300);
                                    }
                                }}
                                disabled={!canScrollLeft}
                            >
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                        )}

                        {/* Carousel Container */}
                        <div
                            id="category-carousel"
                            ref={carouselRef}
                            className={`flex overflow-x-auto gap-6 sm:gap-8 md:gap-10 px-4 sm:px-6 md:px-8 scroll-smooth hide-scrollbar ${isOverflowing ? 'justify-start' : 'justify-center'}`}
                            style={{ scrollSnapType: 'x mandatory' }}
                        >
                            {/* All Templates */}
                            <button
                                className="flex flex-col items-center cursor-pointer group bg-transparent border-none p-0"
                                onClick={() => handleCategorySelect(null)}
                                type="button"
                                style={{ scrollSnapAlign: 'center' }}
                            >
                                <div
                                    className={`relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl flex items-center justify-center overflow-hidden ${selectedCategory === null
                                        ? 'bg-gradient-to-br from-purple-200 to-pink-200'
                                        : 'bg-gradient-to-br from-gray-100 to-gray-200'
                                        }`}
                                >
                                    {/* Rectangular card inside circular background */}
                                    <div className="absolute top-10 w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 bg-white rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center pt-4 pb-2 px-2">
                                        <div className="text-center">
                                            <span
                                                className={`font-bold text-sm sm:text-base md:text-lg ${selectedCategory === null ? 'text-purple-600' : 'text-gray-600'
                                                    }`}
                                            >
                                                ALL
                                            </span>
                                            <div className="text-xs text-gray-500 mt-1">Templates</div>
                                        </div>
                                    </div>
                                </div>
                                <span
                                    className={`mt-4 text-sm sm:text-base font-semibold uppercase tracking-wide transition-colors duration-300 ${selectedCategory === null
                                        ? 'text-purple-600 dark:text-purple-400'
                                        : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                >
                                    All Templates
                                </span>
                            </button>

                            {/* Category Items */}
                            {categories.map((category, index) => {
                                const colors = [
                                    'from-pink-200 to-pink-300',      // Baby Girl - light pink
                                    'from-blue-200 to-blue-300',      // Baby Boy - light blue
                                    'from-green-200 to-green-300',    // Gender Neutral - mint green
                                    'from-orange-200 to-orange-300',  // Twins - light peach/orange
                                    'from-pink-100 to-pink-200',      // Floral - very light pink
                                    'from-green-300 to-green-400',    // Woodland - olive green
                                    'from-purple-200 to-purple-300',  // Additional colors
                                    'from-amber-200 to-amber-300',
                                ];
                                const bgColor = colors[index % colors.length];

                                return (
                                    <button
                                        key={category.id}
                                        className="flex flex-col items-center cursor-pointer group bg-transparent border-none p-0"
                                        onClick={() => handleCategorySelect(category.slug)}
                                        type="button"
                                        style={{ scrollSnapAlign: 'center' }}
                                    >
                                        <div
                                            className={`relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl flex items-center justify-center overflow-hidden ${selectedCategory === category.slug
                                                ? 'bg-gradient-to-br from-purple-200 to-pink-200'
                                                : `bg-gradient-to-br ${bgColor}`
                                                }`}
                                        >
                                            {/* Rectangular card inside circular background */}
                                            <div className="absolute top-10 w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 bg-white rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center">
                                                {category.thumbnailUrl ? (
                                                    <div className="w-full h-full flex items-center justify-center pt-0">
                                                        <img
                                                            src={category.thumbnailUrl}
                                                            alt={category.name}
                                                            className="w-full h-full object-cover rounded-md"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="text-center">
                                                        <span
                                                            className={`font-bold text-sm sm:text-base md:text-lg ${selectedCategory === category.slug ? 'text-purple-600' : 'text-gray-600'
                                                                }`}
                                                        >
                                                            {category.name.charAt(0).toUpperCase()}
                                                        </span>
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            {category.name.split(' ')[0]}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span
                                            className={`mt-4 text-sm sm:text-base font-semibold uppercase tracking-wide transition-colors duration-300 ${selectedCategory === category.slug
                                                ? 'text-purple-600 dark:text-purple-400'
                                                : 'text-gray-700 dark:text-gray-300'
                                                }`}
                                        >
                                            {category.name}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Right Arrow */}
                        {isOverflowing && (
                            <button
                                type="button"
                                aria-label="Scroll right"
                                className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-slate-800 rounded-full shadow p-2 border border-gray-200 dark:border-slate-700 transition-opacity ${canScrollRight ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}`}
                                onClick={() => {
                                    if (canScrollRight) {
                                        carouselRef.current.scrollBy({ left: 300, behavior: 'smooth' });
                                        setTimeout(checkScroll, 300);
                                    }
                                }}
                                disabled={!canScrollRight}
                            >
                                <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Search and Filter Section */}
            {/* ...rest of your code unchanged... */}
            {/* Templates Grid */}
            <EnhancedTemplates
                searchQuery={searchQuery}
                selectedCategory={selectedCategory}
                filters={filters}
            />
        </div>
    );
}