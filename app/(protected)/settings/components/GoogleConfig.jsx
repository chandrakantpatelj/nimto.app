'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Key, MapPin, Shield } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function GoogleConfig() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // State for form values
  const [googleClientId, setGoogleClientId] = useState('');
  const [googleClientSecret, setGoogleClientSecret] = useState('');
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [recaptchaSiteKey, setRecaptchaSiteKey] = useState('');
  const [recaptchaSecretKey, setRecaptchaSecretKey] = useState('');
  const [showRecaptchaSecret, setShowRecaptchaSecret] = useState(false);
  const [googleMapsApiKey, setGoogleMapsApiKey] = useState('');
  const [showMapsApiKey, setShowMapsApiKey] = useState(false);

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving Google settings:', {
      googleClientId,
      googleClientSecret: googleClientSecret ? '[HIDDEN]' : '[UNCHANGED]',
      recaptchaSiteKey,
      recaptchaSecretKey: recaptchaSecretKey ? '[HIDDEN]' : '[UNCHANGED]',
      googleMapsApiKey: googleMapsApiKey ? '[HIDDEN]' : '[UNCHANGED]',
    });
  };

  const InputSetting = ({
    label,
    value,
    onChange,
    placeholder,
    description,
    type = 'text',
    icon,
  }) => (
    <div className="space-y-2">
      <Label
        className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
      </Label>
      <div className="relative">
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`pr-10 ${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
        />
        {icon && (
          <button
            type="button"
            onClick={() => {
              if (label.includes('Client Secret')) {
                setShowClientSecret(!showClientSecret);
              } else if (label.includes('Secret Key')) {
                setShowRecaptchaSecret(!showRecaptchaSecret);
              } else if (label.includes('Maps API Key')) {
                setShowMapsApiKey(!showMapsApiKey);
              }
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            {icon}
          </button>
        )}
      </div>
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
          Google API Configuration
        </h2>
      </div>

      {/* Google Login (OAuth 2.0) */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}
            >
              <Key
                className={`w-5 h-5 ${isDark ? 'text-primary' : 'text-primary'}`}
              />
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Google Login (OAuth 2.0)
              </h3>
            </div>
          </div>

          <div className="ml-11 space-y-4">
            <InputSetting
              label="Google Client ID"
              value={googleClientId}
              onChange={(e) => setGoogleClientId(e.target.value)}
              placeholder="e.g., 1234567890-abc.apps.googleusercontent.com"
              description="Your Google OAuth 2.0 Client ID from Google Cloud Console"
            />

            <InputSetting
              label="Google Client Secret"
              value={googleClientSecret}
              onChange={(e) => setGoogleClientSecret(e.target.value)}
              placeholder="e.g., GOCSPX-..."
              type={showClientSecret ? 'text' : 'password'}
              description="Leave the secret field blank to keep the existing value."
              icon={
                showClientSecret ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Google reCAPTCHA v2 */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}
            >
              <Shield
                className={`w-5 h-5 ${isDark ? 'text-primary' : 'text-primary'}`}
              />
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Google reCAPTCHA v2
              </h3>
            </div>
          </div>

          <div className="ml-11 space-y-4">
            <InputSetting
              label="reCAPTCHA Site Key (Client-side)"
              value={recaptchaSiteKey}
              onChange={(e) => setRecaptchaSiteKey(e.target.value)}
              placeholder="6Lc..."
              description="Your reCAPTCHA site key for client-side integration"
            />

            <InputSetting
              label="reCAPTCHA Secret Key (Server-side)"
              value={recaptchaSecretKey}
              onChange={(e) => setRecaptchaSecretKey(e.target.value)}
              placeholder="6Lc..."
              type={showRecaptchaSecret ? 'text' : 'password'}
              description="Leave the secret field blank to keep the existing value."
              icon={
                showRecaptchaSecret ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Google Maps Platform */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}
            >
              <MapPin
                className={`w-5 h-5 ${isDark ? 'text-primary' : 'text-primary'}`}
              />
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Google Maps Platform
              </h3>
            </div>
          </div>

          <div className="ml-11 space-y-4">
            <InputSetting
              label="Google Maps API Key"
              value={googleMapsApiKey}
              onChange={(e) => setGoogleMapsApiKey(e.target.value)}
              placeholder="(already set)"
              type={showMapsApiKey ? 'text' : 'password'}
              description="Leave this field blank to keep the existing value."
              icon={
                showMapsApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          variant="default"
          onClick={handleSave}
          className="bg-primary hover:bg-primary/90 text-white"
        >
          Save Google Settings
        </Button>
      </div>
    </div>
  );
}
