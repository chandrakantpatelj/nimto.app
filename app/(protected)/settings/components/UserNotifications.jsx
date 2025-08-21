'use client';

import React, { useState } from 'react';
import { Bell, MessageSquare } from 'lucide-react';
import {
  InfoAlert,
  SaveButton,
  SelectField,
  SettingsCard,
  TabHeader,
  ToggleField,
} from './common';

export function UserNotifications() {
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

  const notificationOptions = [
    { value: 'email', label: 'Email Only' },
    { value: 'inapp', label: 'In-App Only' },
    { value: 'email-inapp', label: 'Email & In-App' },
    { value: 'none', label: 'No Notifications' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <TabHeader
        title="Default User Notification Preferences"
        description="Configure default notification settings for all users"
      />

      {/* Notification Channels (Specific Event Types) */}
      <SettingsCard
        title="Notification Channels (Specific Event Types)"
        description="Configure how users are notified about different types of events"
        icon={Bell}
        iconColor="primary"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Event Invitations
              </label>
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Default way users are notified about new event invitations.
              </p>
            </div>
            <div className="ml-4">
              <SelectField
                value={eventInvitations}
                onValueChange={setEventInvitations}
                options={notificationOptions}
                placeholder="Select notification type"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Event Updates
              </label>
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Default for notifications about changes to events they are part
                of.
              </p>
            </div>
            <div className="ml-4">
              <SelectField
                value={eventUpdates}
                onValueChange={setEventUpdates}
                options={notificationOptions}
                placeholder="Select notification type"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                New Messages
              </label>
              <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                Default for direct messages and important announcements.
              </p>
            </div>
            <div className="ml-4">
              <SelectField
                value={newMessages}
                onValueChange={setNewMessages}
                options={notificationOptions}
                placeholder="Select notification type"
              />
            </div>
          </div>
        </div>
      </SettingsCard>

      {/* Notification Channels (Master Switches) */}
      <SettingsCard
        title="Notification Channels (Master Switches)"
        description="Master controls for enabling/disabling notification types"
        icon={MessageSquare}
        iconColor="green"
      >
        <div className="space-y-4">
          <ToggleField
            checked={enableEmailNotifications}
            onCheckedChange={setEnableEmailNotifications}
            label="Enable All Email Notifications"
            description="Master switch for all outgoing email notifications from the system."
          />

          <ToggleField
            checked={enableInAppNotifications}
            onCheckedChange={setEnableInAppNotifications}
            label="Enable All In-App Notifications"
            description="Master switch for all in-app (on-site) notifications."
          />
        </div>
      </SettingsCard>

      {/* Save Button */}
      <SaveButton onClick={handleSave} children="Save Notification Settings" />

      {/* Note */}
      <InfoAlert description="Note: Individual users may be able to override some of these defaults in their personal profile settings." />
    </div>
  );
}
