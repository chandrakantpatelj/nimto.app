'use client';

import React, { useState } from 'react';
import { Mail, Server } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function EmailServer() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

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

  const InputSetting = ({
    label,
    value,
    onChange,
    placeholder,
    description,
    type = 'text',
    note,
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
      {note && (
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {note}
        </p>
      )}
    </div>
  );

  const SelectSetting = ({
    label,
    value,
    onValueChange,
    description,
    options,
  }) => (
    <div className="space-y-2">
      <Label
        className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
        >
          <SelectValue placeholder="Select email provider" />
        </SelectTrigger>
        <SelectContent
          className={isDark ? 'bg-gray-800 border-gray-700' : 'bg-white'}
        >
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && (
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      )}
    </div>
  );

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
      <div>
        <h2
          className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          Email Server Configuration
        </h2>
      </div>

      {/* General Email Settings */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}
            >
              <Mail
                className={`w-5 h-5 ${isDark ? 'text-primary' : 'text-primary'}`}
              />
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                General Email Settings
              </h3>
            </div>
          </div>

          <div className="ml-11 space-y-4">
            <SelectSetting
              label="Email Provider"
              value={emailProvider}
              onValueChange={setEmailProvider}
              description="Choose your email service provider"
              options={emailProviderOptions}
            />

            <InputSetting
              label="Default 'From' Email Address"
              value={fromEmail}
              onChange={(e) => setFromEmail(e.target.value)}
              placeholder="noreply@yourdomain.com"
              description="Default sender email address for outgoing emails"
            />

            <InputSetting
              label="Default 'From' Name"
              value={fromName}
              onChange={(e) => setFromName(e.target.value)}
              placeholder="Your Company Name"
              description="Default sender name for outgoing emails"
            />
          </div>
        </CardContent>
      </Card>

      {/* SMTP Server Details */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}
            >
              <Server
                className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`}
              />
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                SMTP Server Details
              </h3>
            </div>
          </div>

          <div className="ml-11 space-y-4">
            <InputSetting
              label="SMTP Host"
              value={smtpHost}
              onChange={(e) => setSmtpHost(e.target.value)}
              placeholder="smtp.yourdomain.com"
              description="SMTP server hostname or IP address"
            />

            <InputSetting
              label="SMTP Port"
              value={smtpPort}
              onChange={(e) => setSmtpPort(e.target.value)}
              placeholder="587"
              type="number"
              description="SMTP server port number"
            />

            <InputSetting
              label="SMTP Username"
              value={smtpUsername}
              onChange={(e) => setSmtpUsername(e.target.value)}
              placeholder="your-username"
              description="SMTP authentication username"
            />

            <InputSetting
              label="SMTP Password"
              value={smtpPassword}
              onChange={(e) => setSmtpPassword(e.target.value)}
              placeholder="your-password"
              type="password"
              description="SMTP authentication password"
              note="(already set)"
            />

            <CheckboxSetting
              checked={useSSL}
              onCheckedChange={setUseSSL}
              label="Use SSL/TLS (Secure Connection)"
              description="Common ports: 587 (TLS/STARTTLS), 465 (SSL). Check smtpSecure accordingly."
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave}>
          Save Email Settings
        </Button>
      </div>

      {/* Footer Note */}
      <p
        className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
      >
        Ensure your DNS records (like SPF, DKIM) are correctly configured for
        your chosen email provider and 'From' address domain to improve email
        deliverability.
      </p>
    </div>
  );
}
