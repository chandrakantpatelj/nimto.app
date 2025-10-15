'use client';

import { useEffect, useRef, useState } from 'react';
import { Plus, Tag, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MultiSelectTags = ({
  label = 'Tags',
  placeholder = 'Add tags...',
  value = [],
  onChange,
  suggestions = [],
  maxTags = 10,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Filter suggestions based on input and existing tags
  useEffect(() => {
    if (inputValue.trim()) {
      const filtered = suggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(suggestion),
      );
      setFilteredSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
    } else {
      // Show all available suggestions when input is empty
      const availableSuggestions = suggestions.filter(
        (suggestion) => !value.includes(suggestion),
      );
      setFilteredSuggestions(availableSuggestions.slice(0, 8));
    }
  }, [inputValue, suggestions, value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target) &&
        !inputRef.current?.parentElement?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addTag = (tag) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag) && value.length < maxTags) {
      onChange([...value, trimmedTag]);
    }
    setInputValue('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter((tag) => tag !== tagToRemove));
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setSelectedIndex(-1); // Reset selection when typing
  };

  const handleKeyDown = (e) => {
    const hasCustomTagOption =
      inputValue.trim() && !filteredSuggestions.includes(inputValue.trim());
    const totalOptions =
      filteredSuggestions.length + (hasCustomTagOption ? 1 : 0);

    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < filteredSuggestions.length) {
        // Select highlighted suggestion
        addTag(filteredSuggestions[selectedIndex]);
        setSelectedIndex(-1);
      } else if (
        selectedIndex === filteredSuggestions.length &&
        hasCustomTagOption
      ) {
        // Add custom tag from dropdown
        addTag(inputValue);
      } else {
        // Add custom tag directly
        addTag(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalOptions - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalOptions - 1));
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    addTag(suggestion);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </Label>

      <div className="relative">
        {/* Input Field with Tags Inside */}
        <div className="relative">
          <div className="flex flex-wrap items-center gap-1 p-2 min-h-[44px] sm:min-h-[40px] rounded-lg border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 bg-white dark:bg-slate-800">
            {/* Selected Tags */}
            {value.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800"
              >
                <Tag className="w-3 h-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}

            {/* Input Field */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={
                value.length >= maxTags
                  ? `Maximum ${maxTags} tags reached`
                  : value.length === 0
                    ? placeholder
                    : inputValue.trim() &&
                        !filteredSuggestions.includes(inputValue.trim())
                      ? 'Press Enter to add custom tag'
                      : 'Add more tags...'
              }
              disabled={value.length >= maxTags}
              className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />

            {/* Plus Icon */}
            <div className="flex items-center">
              <Plus className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {isOpen && (filteredSuggestions.length > 0 || inputValue.trim()) && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            {/* Show suggestions */}
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  selectedIndex === index
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Tag className="w-3 h-3 text-slate-400" />
                  {suggestion}
                </div>
              </button>
            ))}

            {/* Show "Add custom tag" option when typing something not in suggestions */}
            {inputValue.trim() &&
              !filteredSuggestions.includes(inputValue.trim()) && (
                <button
                  type="button"
                  onClick={() => addTag(inputValue)}
                  className={`w-full px-3 py-2 text-left text-sm transition-colors border-t border-slate-200 dark:border-slate-700 ${
                    selectedIndex === filteredSuggestions.length
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                      : 'text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-3 h-3" />
                    Add "{inputValue.trim()}" as custom tag
                  </div>
                </button>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MultiSelectTags;
