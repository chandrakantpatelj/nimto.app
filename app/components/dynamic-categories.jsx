'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';


export function DynamicCategories({ onCategorySelect, selectedCategory }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await apiFetch('/api/template-categories');
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setCategories(result.data || []);
          } else {
            throw new Error(result.error || 'Failed to fetch categories');
          }
        } else {
          throw new Error(`HTTP ${response.status}: Failed to fetch categories`);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 dark:text-red-400 mb-4">Error loading categories: {error}</p>
        <Button 
          onClick={() => window.location.reload()}           
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 dark:text-gray-400">No categories available.</p>
      </div>
    );
  }

  const colors = [
    'from-pink-200 to-pink-300',      // Baby Girl - light pink
    'from-blue-200 to-blue-300',      // Baby Boy - light blue
    'from-green-200 to-green-300',    // Gender Neutral - mint green
    'from-orange-200 to-orange-300',  // Twins - light peach/orange
    'from-pink-100 to-pink-200',      // Floral - very light pink
    'from-green-300 to-green-400',    // Woodland - olive green
    'from-purple-200 to-purple-300',  // Additional colors
    'from-amber-200 to-amber-300',
    'from-red-200 to-red-300',
    'from-indigo-200 to-indigo-300',
  ];

  return (
    <div className="flex flex-wrap justify-center gap-6 sm:gap-8 md:gap-10 px-4 sm:px-6 md:px-8">
      {/* All Templates */}
      <button
        className="flex flex-col items-center cursor-pointer group bg-transparent border-none p-0"
        onClick={() => onCategorySelect(null)}
        type="button"
      >
        <div
          className={`relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl flex items-center justify-center overflow-hidden ${
            selectedCategory === null
              ? 'bg-gradient-to-br from-purple-200 to-pink-200'
              : 'bg-gradient-to-br from-gray-100 to-gray-200'
          }`}
        >
          {/* Rectangular card inside circular background */}
          <div className="absolute top-10 w-20 h-28 sm:w-24 sm:h-32 md:w-28 md:h-36 bg-white rounded-lg shadow-md border border-gray-100 flex flex-col items-center justify-center pt-4 pb-2 px-2">
            <div className="text-center">
              <span
                className={`font-bold text-sm sm:text-base md:text-lg ${
                  selectedCategory === null ? 'text-purple-600' : 'text-gray-600'
                }`}
              >
                ALL
              </span>
              <div className="text-xs text-gray-500 mt-1">Templates</div>
            </div>
          </div>
        </div>
        <span
          className={`mt-4 text-sm sm:text-base font-semibold uppercase tracking-wide transition-colors duration-300 ${
            selectedCategory === null
              ? 'text-purple-600 dark:text-purple-400'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          All Templates
        </span>
      </button>

      {/* Category Items */}
      {categories.map((category, index) => {
        const bgColor = colors[index % colors.length];

        return (
          <button
            key={category.id}
            className="flex flex-col items-center cursor-pointer group bg-transparent border-none p-0"
            onClick={() => onCategorySelect(category.slug)}
            type="button"
          >
            <div
              className={`relative w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl flex items-center justify-center overflow-hidden ${
                selectedCategory === category.slug
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
                      className={`font-bold text-sm sm:text-base md:text-lg ${
                        selectedCategory === category.slug ? 'text-purple-600' : 'text-gray-600'
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
              className={`mt-4 text-sm sm:text-base font-semibold uppercase tracking-wide transition-colors duration-300 ${
                selectedCategory === category.slug
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
  );
}
