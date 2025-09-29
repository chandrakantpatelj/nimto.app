'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SimpleAutocomplete } from './simple-autocomplete';

export default function GooglePlacesAutocomplete({
  value = '',
  onChange,
  placeholder = 'Enter a location',
  className = '',
  disabled = false,
  ...props
}) {
  return (
    <div className={cn('relative', className)} {...props}>
      <SimpleAutocomplete
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full"
      />
    </div>
  );
}
