'use client';

import React, { useState } from 'react';
import { Database, Globe } from 'lucide-react';
import {
  InputField,
  SaveButton,
  SettingsCard,
  TabHeader,
  ToggleField,
} from './common';

export function AppSettings() {
  // State for form values
  const [useRealApi, setUseRealApi] = useState(true);
  const [frontendUrl, setFrontendUrl] = useState(
    'https://nimto-yr8r.onrender.com/',
  );
  const [apiBaseUrl, setApiBaseUrl] = useState('https://api.nimto.app');
  const [environment, setEnvironment] = useState('production');

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving app settings:', {
      useRealApi,
      frontendUrl,
      apiBaseUrl,
      environment,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <TabHeader
        title="App Settings"
        description="Configure your application's core settings and behavior"
      />

      {/* API Configuration */}
      <SettingsCard
        title="API Usage Mode"
        subtitle="Use Real API Endpoints"
        description="Enable this to connect to live backend services. Disable to use mock data for development."
        icon={Database}
        iconColor="primary"
      >
        <ToggleField
          checked={useRealApi}
          onCheckedChange={setUseRealApi}
          label="Use Real API Endpoints"
          description="Connect to live backend services instead of using mock data"
        />
      </SettingsCard>

      {/* Frontend Configuration */}
      <SettingsCard
        title="Frontend URL"
        subtitle="Client Base URL"
        description="This is the public URL of your frontend application. It is used to generate correct links in emails and SMS messages (e.g., for RSVPs)."
        icon={Globe}
        iconColor="green"
      >
        <InputField
          label="Frontend URL"
          value={frontendUrl}
          onChange={(e) => setFrontendUrl(e.target.value)}
          placeholder="https://yourdomain.com"
          description="Public URL of your frontend application"
        />
      </SettingsCard>

      {/* Save Button */}
      <SaveButton onClick={handleSave} children="Save Configuration" />
    </div>
  );
}
