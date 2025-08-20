'use client';

import React, { useState } from 'react';
import { AlertTriangle, Eye, EyeOff, WalletCards } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function PaymentGateway() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // State for form values
  const [stripePublicKey, setStripePublicKey] = useState('');
  const [stripeSecretKey, setStripeSecretKey] = useState('');
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState('USD');

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving payment settings:', {
      stripePublicKey,
      stripeSecretKey: stripeSecretKey ? '[HIDDEN]' : '[UNCHANGED]',
      defaultCurrency,
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
            onClick={() => setShowSecretKey(!showSecretKey)}
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
          <SelectValue placeholder="Select currency" />
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

  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'INR', label: 'INR' },
    { value: 'NPR', label: 'NPR' },
    { value: 'AUD', label: 'AUD' },
    { value: 'CAD', label: 'CAD' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          Payment Gateway Configuration (Stripe)
        </h2>
      </div>

      {/* Warning Alert */}
      <Alert
        className={`border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800`}
      >
        <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertDescription className={`text-yellow-800 dark:text-yellow-200`}>
          Warning: Stripe Secret Keys are sensitive. Handle with extreme care.
          Do not commit them directly to your codebase in a real application.
          These should be managed via environment variables or a secure secret
          management system on your server.
        </AlertDescription>
      </Alert>

      {/* Stripe API Keys */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${isDark ? 'bg-primary/20' : 'bg-primary/10'}`}
            >
              <WalletCards
                className={`w-5 h-5 ${isDark ? 'text-primary' : 'text-primary'}`}
              />
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Stripe API Keys
              </h3>
            </div>
          </div>

          <div className="ml-11 space-y-4">
            <InputSetting
              label="Stripe Public Key"
              value={stripePublicKey}
              onChange={(e) => setStripePublicKey(e.target.value)}
              placeholder="pk_live_yourpublickey or pk_test_yourpublickey"
              description="Your Stripe public key for client-side operations"
            />

            <InputSetting
              label="Stripe Secret Key"
              value={stripeSecretKey}
              onChange={(e) => setStripeSecretKey(e.target.value)}
              placeholder="sk_live_yoursecretkey or sk_test_yoursecretkey"
              type={showSecretKey ? 'text' : 'password'}
              description="Leave the secret key field blank to keep the existing value."
              icon={
                showSecretKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Currency Settings */}
      <Card
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <CardContent className="space-y-6 pt-6">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-lg ${isDark ? 'bg-green-500/20' : 'bg-green-100'}`}
            >
              <WalletCards
                className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`}
              />
            </div>
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                Currency Settings
              </h3>
            </div>
          </div>

          <div className="ml-11">
            <SelectSetting
              label="Default Currency"
              value={defaultCurrency}
              onValueChange={setDefaultCurrency}
              description="Default currency for transactions and pricing displays."
              options={currencyOptions}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleSave}>
          Save Payment Settings
        </Button>
      </div>

      {/* Footer Note */}
      <p
        className={`text-xs text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
      >
        These settings are for connecting to the Stripe payment gateway. Ensure
        you use test keys for development and live keys for production.
      </p>
    </div>
  );
}
