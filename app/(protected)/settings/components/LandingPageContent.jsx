'use client';

import React, { useState } from 'react';
import { FileText, Info, Star } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export function LandingPageContent() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // State for form values
  const [heroTitle, setHeroTitle] = useState(
    'Nimto: Your Vision, Perfectly Orchestrated.',
  );
  const [heroSubtitle, setHeroSubtitle] = useState(
    'From intimate gatherings to large-scale conferences, Nimto provides the tools you need to create, manage, and experience unforgettable events. For every role, a seamless experience.',
  );
  const [featuresTitle, setFeaturesTitle] = useState('Why Choose Nimto?');
  const [featuresSubtitle, setFeaturesSubtitle] = useState(
    'Discover the powerful features that make managing events easier than ever.',
  );

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving landing page content:', {
      heroTitle,
      heroSubtitle,
      featuresTitle,
      featuresSubtitle,
    });
  };

  const InputField = ({
    label,
    value,
    onChange,
    placeholder,
    description,
    multiline = false,
  }) => (
    <div className="space-y-2">
      <Label
        className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
      </Label>
      {multiline ? (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
          className={`w-full px-3 py-2 rounded-md border resize-none ${
            isDark
              ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
          }`}
        />
      ) : (
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
        />
      )}
      {description && (
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          Manage Landing Page Content
        </h2>
        <p
          className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Customize the content displayed on your landing page
        </p>
      </div>

      {/* Hero Section */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            <Star className="w-5 h-5" />
            <span>Hero Section</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <InputField
            label="Hero Title"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            placeholder="Enter your main hero title"
          />

          <InputField
            label="Hero Subtitle"
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            placeholder="Enter your hero subtitle"
            multiline={true}
          />
        </CardContent>
      </Card>

      {/* Features Section */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            <FileText className="w-5 h-5" />
            <span>Features Section</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <InputField
            label="Features Section Title (e.g., Why Choose Us?)"
            value={featuresTitle}
            onChange={(e) => setFeaturesTitle(e.target.value)}
            placeholder="Why Choose Us?"
          />

          <InputField
            label="Features Section Subtitle"
            value={featuresSubtitle}
            onChange={(e) => setFeaturesSubtitle(e.target.value)}
            placeholder="Enter features section subtitle"
            description="            Managing individual feature items (icon, title, description) will
              be available in a future update."
            multiline={true}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button varinat="primary" onClick={handleSave}>
          Save Landing Page Content
        </Button>
      </div>
    </div>
  );
}
