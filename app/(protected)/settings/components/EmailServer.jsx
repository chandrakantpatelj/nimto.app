'use client';

import React, { useState } from 'react';
import { Mail, Server } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  InfoAlert,
  InputField,
  SaveButton,
  SelectField,
  SettingsCard,
  TabHeader,
} from './common';

export function EmailServer() {
  // State for form values
  const [emailProvider, setEmailProvider] = useState('smtp');
  const [fromEmail, setFromEmail] = useState('noreply@nimto.com');
  const [fromName, setFromName] = useState('Nimto');
  const [smtpHost, setSmtpHost] = useState('Riz_Dev');
  const [smtpPort, setSmtpPort] = useState('25');
  const [smtpUsername, setSmtpUsername] = useState('local');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [useSSL, setUseSSL] = useState(false);

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving email settings:', {
      emailProvider,
      fromEmail,
      fromName,
      smtpHost,
      smtpPort,
      smtpUsername,
      smtpPassword: smtpPassword ? '[HIDDEN]' : '[UNCHANGED]',
      useSSL,
    });
  };

  const CheckboxSetting = ({
    checked,
    onCheckedChange,
    label,
    description,
  }) => (
    <div className="flex items-start space-x-3">
      <Checkbox
        checked={checked}
        onCheckedChange={onCheckedChange}
        className="mt-1"
      />
      <div className="flex-1">
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {label}
        </Label>
        {description && (
          <p className="text-xs mt-1 text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );

  const emailProviderOptions = [
    { value: 'none', label: 'None (Email Disabled)' },
    { value: 'smtp', label: 'SMTP Server' },
    { value: 'sendgrid', label: 'SendGrid API' },
    { value: 'mailgun', label: 'Mailgun API' },
    { value: 'brevo', label: 'Brevo API' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <TabHeader
        title="Email Server Configuration"
        description="Configure your email service provider settings"
      />

      {/* General Email Settings */}
      <SettingsCard
        title="General Email Settings"
        description="Configure basic email settings and provider"
        icon={Mail}
        iconColor="blue"
      >
        <div className="space-y-4">
          <SelectField
            label="Email Provider"
            value={emailProvider}
            onValueChange={setEmailProvider}
            options={emailProviderOptions}
            placeholder="Select email provider"
            description="Choose your email service provider"
          />

          <InputField
            label="Default 'From' Email Address"
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="noreply@yourdomain.com"
            description="Default sender email address for outgoing emails"
          />

          <InputField
            label="Default 'From' Name"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="Your Company Name"
            description="Default sender name for outgoing emails"
          />
        </div>
      </SettingsCard>

      {/* SMTP Server Details */}
      <SettingsCard
        title="SMTP Server Details"
        description="Configure SMTP server connection settings"
        icon={Server}
        iconColor="green"
      >
        <div className="space-y-4">
          <InputField
            label="SMTP Host"
            value={smtpHost}
            onChange={(e) => setSmtpHost(e.target.value)}
            placeholder="smtp.yourdomain.com"
            description="SMTP server hostname or IP address"
          />

          <InputField
            label="SMTP Port"
            value={smtpPort}
            onChange={(e) => setSmtpPort(e.target.value)}
            placeholder="587"
            type="number"
            description="SMTP server port number"
          />

          <InputField
            label="SMTP Username"
            value={smtpUsername}
            onChange={(e) => setSmtpUsername(e.target.value)}
            placeholder="your-username"
            description="SMTP authentication username"
          />

          <InputField
            label="SMTP Password"
            value={smtpPassword}
            onChange={(e) => setSmtpPassword(e.target.value)}
            placeholder="your-password"
            type="password"
            description="SMTP authentication password"
          />

          <CheckboxSetting
            checked={useSSL}
            onCheckedChange={setUseSSL}
            label="Use SSL/TLS (Secure Connection)"
            description="Common ports: 587 (TLS/STARTTLS), 465 (SSL). Check smtpSecure accordingly."
          />
        </div>
      </SettingsCard>

      {/* Save Button */}
      <SaveButton onClick={handleSave} children="Save Email Settings" />

      {/* Note */}
      <InfoAlert description="Ensure your DNS records (like SPF, DKIM) are correctly configured for your chosen email provider and 'From' address domain to improve email deliverability." />
    </div>
  );
}
