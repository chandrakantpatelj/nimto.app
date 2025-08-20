'use client';

import React, { useState } from 'react';
import { Bell, Mail, MessageSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function Notification() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // State for notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [eventUpdates, setEventUpdates] = useState(true);
  const [newMessages, setNewMessages] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving notification settings:', {
      emailNotifications,
      pushNotifications,
      smsNotifications,
      eventUpdates,
      newMessages,
      marketingEmails,
    });
  };

  const NotificationToggle = ({
    checked,
    onCheckedChange,
    label,
    description,
    icon: Icon,
  }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center space-x-3">
        <div
          className={`p-2 rounded-lg ${isDark ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}
        >
          <Icon className="w-4 h-4" />
        </div>
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
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="ml-4"
      />
    </div>
  );

  return (
    <Card
      className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <CardHeader>
        <CardTitle
          className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Notification Channels */}
        <div className="space-y-4">
          <h3
            className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Notification Channels
          </h3>

          <NotificationToggle
            checked={emailNotifications}
            onCheckedChange={setEmailNotifications}
            label="Email Notifications"
            description="Receive notifications via email"
            icon={Mail}
          />

          <NotificationToggle
            checked={pushNotifications}
            onCheckedChange={setPushNotifications}
            label="Push Notifications"
            description="Receive notifications in your browser"
            icon={Bell}
          />

          <NotificationToggle
            checked={smsNotifications}
            onCheckedChange={setSmsNotifications}
            label="SMS Notifications"
            description="Receive notifications via text message"
            icon={MessageSquare}
          />
        </div>

        {/* Notification Types */}
        <div className="space-y-4">
          <h3
            className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Notification Types
          </h3>

          <NotificationToggle
            checked={eventUpdates}
            onCheckedChange={setEventUpdates}
            label="Event Updates"
            description="Get notified about changes to events you're part of"
            icon={Bell}
          />

          <NotificationToggle
            checked={newMessages}
            onCheckedChange={setNewMessages}
            label="New Messages"
            description="Get notified when you receive new messages"
            icon={MessageSquare}
          />

          <NotificationToggle
            checked={marketingEmails}
            onCheckedChange={setMarketingEmails}
            label="Marketing Emails"
            description="Receive promotional and marketing emails"
            icon={Mail}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            Save Notification Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
