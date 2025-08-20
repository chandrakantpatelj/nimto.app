'use client';

import React, { useState } from 'react';
import { WalletCards } from 'lucide-react';
import {
  InfoAlert,
  InputField,
  SaveButton,
  SelectField,
  SettingsCard,
  TabHeader,
  WarningAlert,
} from './common';

export function PaymentGateway() {
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

  const currencyOptions = [
    { value: 'USD', label: 'USD - US Dollar' },
    { value: 'EUR', label: 'EUR - Euro' },
    { value: 'GBP', label: 'GBP - British Pound' },
    { value: 'CAD', label: 'CAD - Canadian Dollar' },
    { value: 'AUD', label: 'AUD - Australian Dollar' },
    { value: 'INR', label: 'INR - Indian Rupee' },
    { value: 'NPR', label: 'NPR - Nepali Rupee' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <TabHeader
        title="Payment Gateway Configuration (Stripe)"
        description="Configure your Stripe payment gateway settings"
      />

      {/* Warning Box */}
      <WarningAlert
        title="Warning: Stripe Secret Keys are sensitive."
        description="Handle with extreme care. Do not commit them directly to your codebase in a real application. These should be managed via environment variables or a secure secret management system on your server."
      />

      {/* Stripe API Keys */}
      <SettingsCard
        title="Stripe API Keys"
        description="Configure your Stripe API credentials"
        icon={WalletCards}
        iconColor="primary"
      >
        <div className="space-y-6">
          <InputField
            label="Stripe Public Key"
            value={stripePublicKey}
            onChange={(e) => setStripePublicKey(e.target.value)}
            placeholder="pk_live_yourpublickey or pk_test_yourpublickey"
            description="Your Stripe publishable key for client-side operations"
          />

          <InputField
            label="Stripe Secret Key"
            value={stripeSecretKey}
            onChange={(e) => setStripeSecretKey(e.target.value)}
            placeholder="sk_live_yoursecretkey or sk_test_yoursecretkey"
            type={showSecretKey ? 'text' : 'password'}
            showToggle={true}
            description="Leave the secret key field blank to keep the existing value."
          />
        </div>
      </SettingsCard>

      {/* Currency Settings */}
      <SettingsCard
        title="Currency Settings"
        description="Configure default currency for transactions"
        icon={WalletCards}
        iconColor="green"
      >
        <SelectField
          label="Default Currency"
          value={defaultCurrency}
          onValueChange={setDefaultCurrency}
          options={currencyOptions}
          placeholder="Select currency"
          description="Default currency for transactions and pricing displays."
        />
      </SettingsCard>

      {/* Save Button */}
      <SaveButton onClick={handleSave} children="Save Payment Settings" />

      {/* Note */}
      <InfoAlert description="These settings are for connecting to the Stripe payment gateway. Ensure you use test keys for development and live keys for production." />
    </div>
  );
}
