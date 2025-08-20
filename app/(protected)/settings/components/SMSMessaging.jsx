'use client';

import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function SMSMessaging() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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
            onClick={() => setShowAuthToken(!showAuthToken)}
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
          Twilio Messaging Configuration
        </h2>
      </div>

      {/* Security Warning */}
      <Alert
        className={`border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800`}
      >
        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className={`text-yellow-800 dark:text-yellow-200`}>
          Security Warning: Twilio Auth Tokens are highly sensitive. Treat them
          like passwords. In a real application, ensure these are stored
          securely, ideally encrypted at rest and managed via environment
          variables or a secrets manager on your server.
        </AlertDescription>
      </Alert>

      {/* Twilio API Credentials */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}
            >
              <MessageCircle
                className={`w-5 h-5 ${isDark ? 'text-primary' : 'text-primary'}`}
              />
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Twilio API Credentials
              </h3>
            </div>
          </div>

          <div className="ml-11 space-y-4">
            <InputSetting
              label="Twilio Account SID"
              value={accountSid}
              onChange={(e) => setAccountSid(e.target.value)}
              placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              description="Your Twilio Account SID from the Twilio Console"
            />

            <InputSetting
              label="Twilio Auth Token"
              value={authToken}
              onChange={(e) => setAuthToken(e.target.value)}
              placeholder="Your Twilio Auth Token"
              type={showAuthToken ? 'text' : 'password'}
              description="Leave the auth token field blank to keep the existing value."
              icon={
                showAuthToken ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )
              }
            />

            <InputSetting
              label="Twilio Phone Number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+1234567890 (E.164 format)"
              description="Your Twilio phone number in E.164 format"
            />

            <InputSetting
              label="Twilio Messaging Service SID (Optional)"
              value={messagingServiceSid}
              onChange={(e) => setMessagingServiceSid(e.target.value)}
              placeholder="MGXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
              description="Using a Messaging Service SID is recommended for features like Alpha Sender ID, Scaler, Geomatch, etc."
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave}>
          Save Twilio Settings
        </Button>
      </div>

      {/* Footer Note */}
      <p
        className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
      >
        These settings connect your application to Twilio for SMS and other
        messaging capabilities.
      </p>
    </div>
  );
}
