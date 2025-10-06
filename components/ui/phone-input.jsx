'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Check, Search } from 'lucide-react';
import {
  formatAsYouType,
  POPULAR_COUNTRIES,
  validatePhoneNumber,
} from '@/lib/phone-utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function PhoneInput({
  value = '',
  onChange,
  placeholder = 'Enter phone number',
  defaultCountry = 'IN',
  showLabel = false,
  showValidation = false,
  label = 'Phone Number',
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [countryCode, setCountryCode] = useState(defaultCountry);
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize component
  useEffect(() => {
    if (value && !isInitialized) {
      // Parse existing value to extract country code and phone number
      const phoneValue = value.replace(/^\+\d+\s*/, ''); // Remove country code prefix
      setPhoneNumber(phoneValue);
      setIsInitialized(true);
    } else if (!value) {
      setIsInitialized(true);
    }
  }, [value, isInitialized]);

  // Handle external value changes (like form reset)
  useEffect(() => {
    if (isInitialized) {
      if (!value) {
        // Clear the phone number when value becomes empty
        setPhoneNumber('');
        setIsValid(false);
        setValidationMessage('');
      }
    }
  }, [value, isInitialized]);

  // Validate phone number
  const validateAndUpdate = useCallback(
    (phone, country) => {
      if (phone.trim()) {
        const validation = validatePhoneNumber(phone, country);
        setIsValid(validation.isValid);
        setValidationMessage(validation.error || '');
      } else {
        // Don't show validation for empty fields
        setIsValid(false);
        setValidationMessage('');
      }
    },
    [showValidation],
  );

  useEffect(() => {
    validateAndUpdate(phoneNumber, countryCode);
  }, [phoneNumber, countryCode, validateAndUpdate]);

  // Notify parent of changes
  useEffect(() => {
    if (isInitialized) {
      if (phoneNumber.trim()) {
        const fullNumber = `+${POPULAR_COUNTRIES.find((c) => c.code === countryCode)?.dialCode.replace('+', '')}${phoneNumber}`;
        if (onChange && fullNumber !== value) {
          onChange(fullNumber);
        }
      } else if (onChange && value !== '') {
        onChange('');
      }
    }
  }, [phoneNumber, countryCode, isInitialized, onChange, value]);

  // Handle phone number input changes
  const handlePhoneChange = useCallback(
    (e) => {
      const inputValue = e.target.value;
      const formattedValue = formatAsYouType(inputValue, countryCode);
      setPhoneNumber(formattedValue);
    },
    [countryCode],
  );

  // Handle country code changes
  const handleCountryChange = useCallback((newCountryCode) => {
    setCountryCode(newCountryCode);
    // Clear search when country changes
    setSearchQuery('');
  }, []);

  // Filter countries based on search query
  const filteredCountries = useMemo(() => {
    if (!searchQuery.trim()) return POPULAR_COUNTRIES;

    return POPULAR_COUNTRIES.filter(
      (country) =>
        country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        country.code.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const selectedCountry = POPULAR_COUNTRIES.find((c) => c.code === countryCode);

  return (
    <div className={`flex flex-col ${className}`}>
      {/* Label */}

      <label className="block text-sm font-medium text-foreground mb-2">
        {label}
      </label>

      <div className="flex-1 flex flex-col justify-between">
        {/* Unified Phone Input Field */}
        <div className="relative">
          <Input
            type="tel"
            placeholder={placeholder}
            value={phoneNumber}
            onChange={handlePhoneChange}
            disabled={disabled}
            required={required}
            className="h-10 w-full pl-20"
            {...props}
          />

          {/* Country Code Selector - Overlay on the left */}
          <div className="absolute left-0 top-0 h-10 flex items-center border-r border-gray-300 dark:border-gray-600">
            <Select
              value={countryCode}
              onValueChange={handleCountryChange}
              disabled={disabled}
            >
              <SelectTrigger className="w-20 h-10 border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0">
                <SelectValue>
                  {selectedCountry && (
                    <span className="flex items-center justify-center gap-1 w-full">
                      <span className="text-sm">{selectedCountry.flag}</span>
                      <span className="font-medium text-xs">
                        {selectedCountry.dialCode}
                      </span>
                    </span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[400px]">
                {/* Search Input */}
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      placeholder="Search countries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-8 text-sm"
                    />
                  </div>
                </div>

                {/* Popular Countries */}
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-500 mb-2">
                    Popular Countries
                  </div>
                  {filteredCountries.slice(0, 10).map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      <span className="flex items-center gap-3 w-full">
                        <span className="text-lg">{country.flag}</span>
                        <span className="font-medium">{country.dialCode}</span>
                        <span className="text-sm text-gray-600 flex-1">
                          {country.name}
                        </span>
                        {country.code === countryCode && (
                          <Check className="w-4 h-4 text-green-600" />
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </div>

                {/* All Countries */}
                {filteredCountries.length > 10 && (
                  <>
                    <div className="border-t my-2" />
                    <div className="p-2">
                      <div className="text-xs font-medium text-gray-500 mb-2">
                        All Countries
                      </div>
                      {filteredCountries.slice(10).map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="flex items-center gap-3 w-full">
                            <span className="text-lg">{country.flag}</span>
                            <span className="font-medium">
                              {country.dialCode}
                            </span>
                            <span className="text-sm text-gray-600 flex-1">
                              {country.name}
                            </span>
                            {country.code === countryCode && (
                              <Check className="w-4 h-4 text-green-600" />
                            )}
                          </span>
                        </SelectItem>
                      ))}
                    </div>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Validation Messages Container - Always reserves space */}
        <div className="mt-1 h-5">
          {showValidation && phoneNumber.trim() && (
            <>
              {/* Error Message */}
              {!isValid && validationMessage && (
                <div className="flex items-center gap-2 text-xs text-red-600">
                  <div className="w-3 h-3 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-2 h-2 text-red-600"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span>{validationMessage}</span>
                </div>
              )}

              {/* Success Message */}
              {isValid && validationMessage === '' && (
                <div className="flex items-center gap-2 text-xs text-green-600">
                  <div className="w-3 h-3 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-2 h-2 text-green-600" />
                  </div>
                  <span>Valid phone number</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
