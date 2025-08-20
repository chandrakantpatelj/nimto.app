'use client';

import React, { useState } from 'react';
import { Key, MapPin, Shield } from 'lucide-react';
import { InputField, SaveButton, SettingsCard, TabHeader } from './common';

export function GoogleConfig() {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <TabHeader
        title="Google API Configuration"
        description="Configure your Google API settings for authentication, security, and maps"
      />

      {/* Google Login (OAuth 2.0) */}
      <SettingsCard
        title="Google Login (OAuth 2.0)"
        description="Configure Google OAuth for user authentication"
        icon={Key}
        iconColor="blue"
      >
        <div className="space-y-4">
          <InputField
            label="Google Client ID"
            value={googleClientId}
            onChange={(e) => setGoogleClientId(e.target.value)}
            placeholder="e.g., 1234567890-abc.apps.googleusercontent.com"
            description="Your Google OAuth 2.0 Client ID from Google Cloud Console"
          />

          <InputField
            label="Google Client Secret"
            value={googleClientSecret}
            onChange={(e) => setGoogleClientSecret(e.target.value)}
            placeholder="e.g., GOCSPX-..."
            type={showClientSecret ? 'text' : 'password'}
            showToggle={true}
            description="Leave the secret field blank to keep the existing value."
          />
        </div>
      </SettingsCard>

      {/* Google reCAPTCHA v2 */}
      <SettingsCard
        title="Google reCAPTCHA v2"
        description="Configure reCAPTCHA for form protection"
        icon={Shield}
        iconColor="green"
      >
        <div className="space-y-4">
          <InputField
            label="reCAPTCHA Site Key (Client-side)"
            value={recaptchaSiteKey}
            onChange={(e) => setRecaptchaSiteKey(e.target.value)}
            placeholder="6Lc..."
            description="Your reCAPTCHA site key for client-side integration"
          />

          <InputField
            label="reCAPTCHA Secret Key (Server-side)"
            value={recaptchaSecretKey}
            onChange={(e) => setRecaptchaSecretKey(e.target.value)}
            placeholder="6Lc..."
            type={showRecaptchaSecret ? 'text' : 'password'}
            showToggle={true}
            description="Leave the secret field blank to keep the existing value."
          />
        </div>
      </SettingsCard>

      {/* Google Maps Platform */}
      <SettingsCard
        title="Google Maps Platform"
        description="Configure Google Maps API for location services"
        icon={MapPin}
        iconColor="purple"
      >
        <div className="space-y-4">
          <InputField
            label="Google Maps API Key"
            value={googleMapsApiKey}
            onChange={(e) => setGoogleMapsApiKey(e.target.value)}
            placeholder="(already set)"
            type={showMapsApiKey ? 'text' : 'password'}
            showToggle={true}
            description="Leave this field blank to keep the existing value."
          />
        </div>
      </SettingsCard>

      {/* Save Button */}
      <SaveButton onClick={handleSave} children="Save Google Settings" />
    </div>
  );
}
