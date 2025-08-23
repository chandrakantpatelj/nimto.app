'use client';

import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import {
  InfoAlert,
  InputField,
  SaveButton,
  SettingsCard,
  TabHeader,
  WarningAlert,
} from './common';

export function SMSMessaging() {
  // State for form values
  const [accountSid, setAccountSid] = useState('');
  const [authToken, setAuthToken] = useState('');
  const [showAuthToken, setShowAuthToken] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [messagingServiceSid, setMessagingServiceSid] = useState('');

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving SMS settings:', {
      accountSid,
      authToken: authToken ? '[HIDDEN]' : '[UNCHANGED]',
      phoneNumber,
      messagingServiceSid,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <TabHeader
        title="Twilio Messaging Configuration"
        description="Configure your Twilio SMS and messaging settings"
      />

      {/* Security Warning */}
      <WarningAlert
        title="Security Warning: Twilio Auth Tokens are highly sensitive."
        description="Treat them like passwords. In a real application, ensure these are stored securely, ideally encrypted at rest and managed via environment variables or a secrets manager on your server."
      />

      {/* Twilio API Credentials */}
      <SettingsCard
        title="Twilio API Credentials"
        description="Configure your Twilio account credentials"
        icon={MessageCircle}
        iconColor="primary"
      >
        <div className="space-y-4">
          <InputField
            label="Twilio Account SID"
            value={accountSid}
            onChange={(e) => setAccountSid(e.target.value)}
            placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            description="Your Twilio Account SID from the Twilio Console"
          />

          <InputField
            label="Twilio Auth Token"
            value={authToken}
            onChange={(e) => setAuthToken(e.target.value)}
            placeholder="Your Twilio Auth Token"
            type={showAuthToken ? 'text' : 'password'}
            showToggle={true}
            description="Leave the auth token field blank to keep the existing value."
          />

          <InputField
            label="Twilio Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890 (E.164 format)"
            description="Your Twilio phone number in E.164 format"
          />

          <InputField
            label="Twilio Messaging Service SID (Optional)"
            value={messagingServiceSid}
            onChange={(e) => setMessagingServiceSid(e.target.value)}
            placeholder="MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
            description="Using a Messaging Service SID is recommended for features like Alpha Sender ID, Scaler, Geomatch, etc."
          />
        </div>
      </SettingsCard>

      {/* Save Button */}
      <SaveButton onClick={handleSave} children="Save Twilio Settings" />

      {/* Note */}
      <InfoAlert description="These settings connect your application to Twilio for SMS and other messaging capabilities." />
    </div>
  );
}
