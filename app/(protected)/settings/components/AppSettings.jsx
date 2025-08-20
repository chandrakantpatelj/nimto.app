'use client';

import React, { useState } from 'react';
import { Database, Globe, Settings } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';

export function AppSettings() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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

  const SettingSection = ({
    title,
    subtitle,
    description,
    children,
    icon: Icon,
  }) => (
    <div className="space-y-4">
      <div className="flex items-start space-x-3">
        <div
          className={`p-2 rounded-lg ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}
        >
          <Icon
            className={`w-5 h-5 ${isDark ? 'text-primary' : 'text-primary'}`}
          />
        </div>
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {title}
          </h3>
          {subtitle && (
            <p
              className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              {subtitle}
            </p>
          )}
          {description && (
            <p
              className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            >
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="ml-11">{children}</div>
    </div>
  );

  const ToggleSetting = ({ checked, onCheckedChange, label, description }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="flex-1">
        <Label
          className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
        >
          {label}
        </Label>
        {description && (
          <p
            className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {description}
          </p>
        )}
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="ml-4"
      />
    </div>
  );

  const InputSetting = ({
    label,
    value,
    onChange,
    placeholder,
    description,
    type = 'text',
  }) => (
    <div className="space-y-2">
      <Label
        className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
      />
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
          App Settings
        </h2>
        <p
          className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Configure your application's core settings and behavior
        </p>
      </div>

      {/* API Configuration */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardContent className="space-y-6">
          <SettingSection
            title="API Usage Mode"
            subtitle="Use Real API Endpoints"
            description="Enable this to connect to live backend services. Disable to use mock data for development."
            icon={Database}
          >
            <ToggleSetting
              checked={useRealApi}
              onCheckedChange={setUseRealApi}
              label="Use Real API Endpoints"
              description="Connect to live backend services instead of using mock data"
            />
          </SettingSection>
        </CardContent>
      </Card>

      {/* Frontend Configuration */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardContent className="space-y-6">
          <SettingSection
            title="Frontend URL"
            subtitle="Client Base URL"
            description="This is the public URL of your frontend application. It is used to generate correct links in emails and SMS messages (e.g., for RSVPs)."
            icon={Globe}
          >
            <InputSetting
              label="Frontend URL"
              value={frontendUrl}
              onChange={(e) => setFrontendUrl(e.target.value)}
              placeholder="https://yourdomain.com"
              description="Public URL of your frontend application"
            />
          </SettingSection>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button varinat="primary" onClick={handleSave}>
          Save Configuration
        </Button>
      </div>
    </div>
  );
}
