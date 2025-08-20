'use client';

import { useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function Notification() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // State for notification settings
  const [eventInvitationsEmail, setEventInvitationsEmail] = useState(true);
  const [inAppMessageAlerts, setInAppMessageAlerts] = useState(true);
  const [productUpdatesNewsletter, setProductUpdatesNewsletter] =
    useState(false);

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving notification settings:', {
      eventInvitationsEmail,
      inAppMessageAlerts,
      productUpdatesNewsletter,
    });
  };

  const NotificationCheckbox = ({
    checked,
    onCheckedChange,
    label,
    description,
  }) => (
    <div className="flex items-start space-x-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-1"
      />
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
  );

  const SystemDefaultItem = ({ label, value, isEnabled = false }) => (
    <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
      <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {label}
      </span>
      <span
        className={`text-sm font-medium ${isEnabled ? 'text-primary' : isDark ? 'text-gray-400' : 'text-gray-600'}`}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Your Notification Preferences */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardHeader>
          <CardTitle
            className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            Your Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <NotificationCheckbox
            checked={eventInvitationsEmail}
            onCheckedChange={setEventInvitationsEmail}
            label="Event Invitations via Email"
            description="Get notified by email about new event invitations."
          />

          <NotificationCheckbox
            checked={inAppMessageAlerts}
            onCheckedChange={setInAppMessageAlerts}
            label="In-App Message Alerts"
            description="Receive in-app alerts for new direct messages and event announcements."
          />

          <NotificationCheckbox
            checked={productUpdatesNewsletter}
            onCheckedChange={setProductUpdatesNewsletter}
            label="Product Updates & Newsletter"
            description="Subscribe to our monthly newsletter for product updates and tips."
          />

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <Button variant="primary" onClick={handleSave}>
              Save Your Preferences
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* System Default Preferences */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardHeader>
          <CardTitle
            className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            System Default Preferences
          </CardTitle>
          <p
            className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
          >
            These are the system-wide default settings managed by
            administrators. Your personal preferences above can override these
            for your account where applicable.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            <SystemDefaultItem
              label="Default for Event Invitations"
              value="Email Only"
            />
            <SystemDefaultItem
              label="Default for Event Updates"
              value="Email & In-App"
            />
            <SystemDefaultItem
              label="Default for New Messages"
              value="In-App Only"
            />
            <SystemDefaultItem
              label="Global Email Notifications"
              value="Enabled"
              isEnabled={true}
            />
            <SystemDefaultItem
              label="Global In-App Notifications"
              value="Enabled"
              isEnabled={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
