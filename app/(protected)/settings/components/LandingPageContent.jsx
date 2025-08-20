'use client';

import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import {
  InputField,
  SaveButton,
  SettingsCard,
  TabHeader,
  TextareaField,
} from './common';

export function LandingPageContent() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <TabHeader
        title="Landing Page Content"
        description="Customize the content displayed on your landing page"
      />

      {/* Hero Section */}
      <SettingsCard
        title="Hero Section"
        subtitle="Main Landing Page Content"
        description="Configure the main headline and description that visitors see first"
        icon={FileText}
        iconColor="primary"
      >
        <div className="space-y-4">
          <InputField
            label="Hero Title"
            value={heroTitle}
            onChange={(e) => setHeroTitle(e.target.value)}
            placeholder="Enter your main headline"
            description="The primary title displayed prominently on your landing page"
          />
          <TextareaField
            label="Hero Subtitle"
            value={heroSubtitle}
            onChange={(e) => setHeroSubtitle(e.target.value)}
            placeholder="Enter your subtitle or description"
            description="A compelling description that explains your value proposition"
            rows={3}
          />
        </div>
      </SettingsCard>

      {/* Features Section */}
      <SettingsCard
        title="Features Section"
        subtitle="Why Choose Us Content"
        description="Configure the content for your features or benefits section"
        icon={FileText}
        iconColor="green"
      >
        <div className="space-y-4">
          <InputField
            label="Features Title"
            value={featuresTitle}
            onChange={(e) => setFeaturesTitle(e.target.value)}
            placeholder="Enter features section title"
            description="Title for the section highlighting your key features"
          />
          <TextareaField
            label="Features Subtitle"
            value={featuresSubtitle}
            onChange={(e) => setFeaturesSubtitle(e.target.value)}
            placeholder="Enter features section description"
            description="Description explaining what makes your platform special"
            rows={3}
          />
        </div>
      </SettingsCard>

      {/* Save Button */}
      <SaveButton onClick={handleSave} children="Save Landing Page Content" />
    </div>
  );
}
