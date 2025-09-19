'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';

// DateInput component for date selection
export const DateInput = forwardRef(
  (
    { className, value, onChange, placeholder = 'Select date', ...props },
    ref,
  ) => {
    const [inputValue, setInputValue] = useState(value || '');

    const handleChange = (e) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      if (onChange) {
        onChange(newValue);
      }
    };

    return (
      <Input
        ref={ref}
        type="date"
        value={inputValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={cn('w-full', className)}
        {...props}
      />
    );
  },
);

DateInput.displayName = 'DateInput';

// TimeField component for time selection
export const TimeField = forwardRef(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {children}
      </div>
    );
  },
);

TimeField.displayName = 'TimeField';
