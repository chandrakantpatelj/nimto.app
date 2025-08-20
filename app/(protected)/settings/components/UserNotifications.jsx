'use client';

import React, { useState } from 'react';
import { Bell, Info, Mail, MessageSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export function UserNotifications() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // State for notification settings
  const [eventInvitations, setEventInvitations] = useState('email');
  const [eventUpdates, setEventUpdates] = useState('email-inapp');
  const [newMessages, setNewMessages] = useState('inapp');
  const [enableEmailNotifications, setEnableEmailNotifications] =
    useState(true);
  const [enableInAppNotifications, setEnableInAppNotifications] =
    useState(true);

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving notification settings:', {
      eventInvitations,
      eventUpdates,
      newMessages,
      enableEmailNotifications,
      enableInAppNotifications,
    });
  };

  const NotificationChannelItem = ({
    title,
    value,
    onValueChange,
    description,
    options,
  }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="flex-1">
        <Label
          className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
        >
          {title}
        </Label>
        <p
          className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {description}
        </p>
      </div>
      <div className="ml-4">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger
            className={`w-40 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent
            className={
              isDark
                ? 'bg-gray-800 border-gray-700'
                : 'bg-white border-gray-300'
            }
          >
            {options.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className={
                  isDark
                    ? 'text-white hover:bg-gray-700'
                    : 'text-gray-900 hover:bg-gray-50'
                }
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );

  const ToggleSetting = ({ title, description, checked, onCheckedChange }) => (
    <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <div className="flex-1">
        <Label
          className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
        >
          {title}
        </Label>
        <p
          className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {description}
        </p>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="ml-4"
      />
    </div>
  );

  const notificationOptions = [
    { value: 'email', label: 'Email Only' },
    { value: 'inapp', label: 'In-App Only' },
    { value: 'email-inapp', label: 'Email & In-App' },
    { value: 'none', label: 'No Notifications' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          Default User Notification Preferences
        </h2>
        <p
          className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Configure default notification settings for all users
        </p>
      </div>

      {/* Notification Channels (Specific Event Types) */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            <Bell className="w-5 h-5" />
            <span>Notification Channels (Specific Event Types)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationChannelItem
            title="Event Invitations"
            value={eventInvitations}
            onValueChange={setEventInvitations}
            description="Default way users are notified about new event invitations."
            options={notificationOptions}
          />

          <NotificationChannelItem
            title="Event Updates"
            value={eventUpdates}
            onValueChange={setEventUpdates}
            description="Default for notifications about changes to events they are part of."
            options={notificationOptions}
          />

          <NotificationChannelItem
            title="New Messages"
            value={newMessages}
            onValueChange={setNewMessages}
            description="Default for direct messages and important announcements."
            options={notificationOptions}
          />
        </CardContent>
      </Card>

      {/* Notification Channels (Master Switches) */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardHeader>
          <CardTitle
            className={`flex items-center space-x-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>Notification Channels (Master Switches)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleSetting
            title="Enable All Email Notifications"
            description="Master switch for all outgoing email notifications from the system."
            checked={enableEmailNotifications}
            onCheckedChange={setEnableEmailNotifications}
          />

          <ToggleSetting
            title="Enable All In-App Notifications"
            description="Master switch for all in-app (on-site) notifications."
            checked={enableInAppNotifications}
            onCheckedChange={setEnableInAppNotifications}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button varinat="primary" onClick={handleSave}>
          Save Notification Settings
        </Button>
      </div>

      {/* Note */}
      <div
        className={`flex items-start space-x-2 p-3 rounded-lg ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}
      >
        <Info
          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        />
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Note: Individual users may be able to override some of these defaults
          in their personal profile settings.
        </p>
      </div>
    </div>
  );
}
