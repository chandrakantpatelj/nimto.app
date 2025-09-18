// Category-based theme configurations for dynamic invitation styling

export const categoryThemes = {
  'baby-kids': {
    name: 'Baby & Kids',
    icon: '👶',
    headerGradient: 'from-pink-400 via-rose-400 to-pink-500',
    heroGradient: 'from-pink-300 via-rose-400 to-pink-500',
    fallbackGradient: 'from-pink-400 via-rose-500 to-pink-600',
    darkHeaderGradient: 'from-pink-500 via-rose-500 to-pink-600',
    darkHeroGradient: 'from-pink-400 via-rose-500 to-pink-600',
    darkFallbackGradient: 'from-pink-500 via-rose-600 to-pink-700',
    accentColor: 'pink',
  },
  'parties': {
    name: 'Parties',
    icon: '🎉',
    headerGradient: 'from-orange-400 via-red-400 to-pink-500',
    heroGradient: 'from-orange-300 via-red-400 to-pink-500',
    fallbackGradient: 'from-orange-400 via-red-500 to-pink-600',
    darkHeaderGradient: 'from-orange-500 via-red-500 to-pink-600',
    darkHeroGradient: 'from-orange-400 via-red-500 to-pink-600',
    darkFallbackGradient: 'from-orange-500 via-red-600 to-pink-700',
    accentColor: 'orange',
  },
  'birthday': {
    name: 'Birthday',
    icon: '🎂',
    headerGradient: 'from-purple-400 via-pink-400 to-red-500',
    heroGradient: 'from-purple-300 via-pink-400 to-red-500',
    fallbackGradient: 'from-purple-400 via-pink-500 to-red-600',
    darkHeaderGradient: 'from-purple-500 via-pink-500 to-red-600',
    darkHeroGradient: 'from-purple-400 via-pink-500 to-red-600',
    darkFallbackGradient: 'from-purple-500 via-pink-600 to-red-700',
    accentColor: 'purple',
  },
  'wedding': {
    name: 'Wedding',
    icon: '💒',
    headerGradient: 'from-rose-400 via-pink-400 to-purple-500',
    heroGradient: 'from-rose-300 via-pink-400 to-purple-500',
    fallbackGradient: 'from-rose-400 via-pink-500 to-purple-600',
    darkHeaderGradient: 'from-rose-500 via-pink-500 to-purple-600',
    darkHeroGradient: 'from-rose-400 via-pink-500 to-purple-600',
    darkFallbackGradient: 'from-rose-500 via-pink-600 to-purple-700',
    accentColor: 'rose',
  },
  'business': {
    name: 'Business',
    icon: '💼',
    headerGradient: 'from-blue-500 via-indigo-500 to-purple-600',
    heroGradient: 'from-blue-400 via-indigo-500 to-purple-600',
    fallbackGradient: 'from-blue-500 via-indigo-600 to-purple-700',
    darkHeaderGradient: 'from-blue-600 via-indigo-600 to-purple-700',
    darkHeroGradient: 'from-blue-500 via-indigo-600 to-purple-700',
    darkFallbackGradient: 'from-blue-600 via-indigo-700 to-purple-800',
    accentColor: 'blue',
  },
  'holidays': {
    name: 'Holidays',
    icon: '🎄',
    headerGradient: 'from-green-400 via-emerald-400 to-teal-500',
    heroGradient: 'from-green-300 via-emerald-400 to-teal-500',
    fallbackGradient: 'from-green-400 via-emerald-500 to-teal-600',
    darkHeaderGradient: 'from-green-500 via-emerald-500 to-teal-600',
    darkHeroGradient: 'from-green-400 via-emerald-500 to-teal-600',
    darkFallbackGradient: 'from-green-500 via-emerald-600 to-teal-700',
    accentColor: 'green',
  },
  'sports': {
    name: 'Sports',
    icon: '⚽',
    headerGradient: 'from-lime-400 via-green-400 to-emerald-500',
    heroGradient: 'from-lime-300 via-green-400 to-emerald-500',
    fallbackGradient: 'from-lime-400 via-green-500 to-emerald-600',
    darkHeaderGradient: 'from-lime-500 via-green-500 to-emerald-600',
    darkHeroGradient: 'from-lime-400 via-green-500 to-emerald-600',
    darkFallbackGradient: 'from-lime-500 via-green-600 to-emerald-700',
    accentColor: 'lime',
  },
  'graduation': {
    name: 'Graduation',
    icon: '🎓',
    headerGradient: 'from-violet-400 via-purple-400 to-indigo-500',
    heroGradient: 'from-violet-300 via-purple-400 to-indigo-500',
    fallbackGradient: 'from-violet-400 via-purple-500 to-indigo-600',
    darkHeaderGradient: 'from-violet-500 via-purple-500 to-indigo-600',
    darkHeroGradient: 'from-violet-400 via-purple-500 to-indigo-600',
    darkFallbackGradient: 'from-violet-500 via-purple-600 to-indigo-700',
    accentColor: 'violet',
  },
  // Default theme for unknown categories
  'default': {
    name: 'General',
    icon: '✨',
    headerGradient: 'from-indigo-600 via-purple-600 to-pink-600',
    heroGradient: 'from-indigo-500 via-purple-600 to-pink-600',
    fallbackGradient: 'from-blue-500 via-purple-600 to-pink-500',
    darkHeaderGradient: 'from-indigo-700 via-purple-700 to-pink-700',
    darkHeroGradient: 'from-indigo-600 via-purple-700 to-pink-700',
    darkFallbackGradient: 'from-blue-600 via-purple-700 to-pink-600',
    accentColor: 'indigo',
  },
};

/**
 * Get theme configuration for a category
 * @param {string} category - The category slug
 * @returns {object} Theme configuration object
 */
export function getCategoryTheme(category) {
  if (!category) return categoryThemes.default;
  
  const normalizedCategory = category.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return categoryThemes[normalizedCategory] || categoryThemes.default;
}

/**
 * Get CSS classes for header gradient based on category
 * @param {string} category - The category slug
 * @param {boolean} isDark - Whether to use dark theme
 * @returns {string} Tailwind gradient classes
 */
export function getHeaderGradientClasses(category, isDark = false) {
  const theme = getCategoryTheme(category);
  const gradientKey = isDark ? 'darkHeaderGradient' : 'headerGradient';
  return `bg-gradient-to-r ${theme[gradientKey]}`;
}

/**
 * Get CSS classes for hero/main section gradient based on category
 * @param {string} category - The category slug  
 * @param {boolean} isDark - Whether to use dark theme
 * @returns {string} Tailwind gradient classes
 */
export function getHeroGradientClasses(category, isDark = false) {
  const theme = getCategoryTheme(category);
  const gradientKey = isDark ? 'darkHeroGradient' : 'heroGradient';
  return `bg-gradient-to-br ${theme[gradientKey]}`;
}

/**
 * Get CSS classes for fallback gradient based on category
 * @param {string} category - The category slug
 * @param {boolean} isDark - Whether to use dark theme  
 * @returns {string} Tailwind gradient classes
 */
export function getFallbackGradientClasses(category, isDark = false) {
  const theme = getCategoryTheme(category);
  const gradientKey = isDark ? 'darkFallbackGradient' : 'fallbackGradient';
  return `bg-gradient-to-br ${theme[gradientKey]}`;
}
