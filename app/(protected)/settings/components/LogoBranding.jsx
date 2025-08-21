'use client';

import { useState } from 'react';
import { BookImage, Image as ImageIcon, Type, Upload } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { TabHeader } from './common';

export function LogoBranding() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // State for form values
  const [logoType, setLogoType] = useState('text');
  const [textLogoContent, setTextLogoContent] = useState('Nimto');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving logo settings:', {
      logoType,
      textLogoContent,
      selectedFile,
      previewUrl,
    });
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const RadioOption = ({ value, label, description, icon: Icon }) => {
    return (
      <div className="relative">
        <RadioGroupItem value={value} id={value} className="sr-only" />
        <Label
          htmlFor={value}
          className={`flex flex-row gap-4 items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
            logoType === value
              ? 'border-primary bg-gray-50'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
              logoType === value
                ? 'bg-primary/20 text-primary'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <span
              className={`text-sm font-medium text-center ${
                logoType === value
                  ? 'text-primary'
                  : isDark
                    ? 'text-gray-200'
                    : 'text-gray-700'
              }`}
            >
              {label}
            </span>
            {description && (
              <p
                className={`text-xs text-center ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                {description}
              </p>
            )}
          </div>
        </Label>
      </div>
    );
  };

  const FileUploadField = ({ label, onChange, accept, description }) => (
    <div className="space-y-2">
      <Label
        className={`text-sm font-medium ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        {label}
      </Label>
      <div className="flex items-center space-x-3">
        <Button
          type="button"
          variant="outline"
          className={`flex items-center space-x-2 ${
            isDark
              ? 'border-gray-600 bg-gray-800 text-gray-200 hover:bg-gray-700'
              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
          }`}
          onClick={() => document.getElementById('logo-upload').click()}
        >
          <Upload className="w-4 h-4" />
          <span>Choose File</span>
        </Button>
        <span
          className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
        >
          {selectedFile ? selectedFile.name : 'No file chosen'}
        </span>
      </div>
      <input
        id="logo-upload"
        type="file"
        accept={accept}
        onChange={onChange}
        className="hidden"
      />
      {description && (
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      )}
    </div>
  );

  const LogoPreview = () => (
    <div className="space-y-2">
      <Label
        className={`text-sm font-medium ${
          isDark ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        Logo Preview:
      </Label>
      <div
        className={`w-full h-32 border-2 border-dashed rounded-lg flex items-center justify-center ${
          isDark
            ? 'border-gray-600 bg-gray-800/50'
            : 'border-gray-300 bg-gray-50'
        }`}
      >
        {previewUrl ? (
          <div className="flex items-center space-x-3">
            <img
              src={previewUrl}
              alt="Logo Preview"
              className="max-h-20 max-w-32 object-contain"
            />
            <span
              className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Logo Preview
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <ImageIcon
              className={`w-8 h-8 ${
                isDark ? 'text-gray-500' : 'text-gray-400'
              }`}
            />
            <span
              className={`text-sm ${
                isDark ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              Logo Preview
            </span>
          </div>
        )}
      </div>
    </div>
  );

  const SettingsCard = ({
    title,
    subtitle,
    description,
    icon: Icon,
    iconColor = 'primary',
    children,
    className = '',
  }) => {
    const iconColors = {
      primary: isDark
        ? 'bg-primary-500/20 text-primary-400'
        : 'bg-primary-100 text-primary-600',
      green: isDark
        ? 'bg-green-500/20 text-green-400'
        : 'bg-green-100 text-green-600',
      purple: isDark
        ? 'bg-purple-500/20 text-purple-400'
        : 'bg-purple-100 text-purple-600',
      orange: isDark
        ? 'bg-orange-500/20 text-orange-400'
        : 'bg-orange-100 text-orange-600',
      red: isDark ? 'bg-red-500/20 text-red-400' : 'bg-red-100 text-red-600',
    };

    return (
      <div
        className={`p-6 rounded-lg border ${
          isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'
        } ${className}`}
      >
        <div className="space-y-6">
          <div className="flex items-start space-x-3">
            {Icon && (
              <div className={`p-2 rounded-lg ${iconColors[iconColor]}`}>
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                {title}
              </h3>
              {subtitle && (
                <p
                  className={`text-sm font-medium ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {subtitle}
                </p>
              )}
              {description && (
                <p
                  className={`text-sm mt-1 ${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}
                >
                  {description}
                </p>
              )}
            </div>
          </div>
          <div className="ml-11">{children}</div>
        </div>
      </div>
    );
  };

  const InputField = ({
    label,
    value,
    onChange,
    placeholder,
    description,
    type = 'text',
    required = false,
    disabled = false,
  }) => {
    return (
      <div className="space-y-2">
        <Label
          className={`text-sm font-medium ${
            isDark ? 'text-gray-200' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${
            isDark
              ? 'bg-gray-800 border-gray-700 text-white'
              : 'bg-white border-gray-300'
          }`}
        />
        {description && (
          <p
            className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            {description}
          </p>
        )}
      </div>
    );
  };

  const SaveButton = ({
    onClick,
    children = 'Save Settings',
    loading = false,
    className = '',
  }) => {
    return (
      <div className="flex justify-end">
        <Button
          onClick={onClick}
          disabled={loading}
          className={`px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white ${className}`}
        >
          {loading ? 'Saving...' : children}
        </Button>
      </div>
    );
  };

  const InfoAlert = ({ description, icon: Icon = InfoIcon }) => {
    return (
      <div
        className={`flex items-start space-x-2 p-3 rounded-lg ${
          isDark
            ? 'bg-gray-800/50 border border-gray-700'
            : 'bg-gray-50 border border-gray-200'
        }`}
      >
        <Icon
          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
            isDark ? 'text-gray-400' : 'text-gray-500'
          }`}
        />
        <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
    );
  };

  const InfoIcon = ({ className }) => (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <TabHeader
        title="Logo & Branding"
        description="Configure your application's logo and branding settings"
      />

      {/* Logo Type Selection */}
      <SettingsCard
        title="Logo Type"
        description="Choose how you want to display your logo"
        icon={BookImage}
        iconColor="primary"
      >
        <RadioGroup
          value={logoType}
          onValueChange={setLogoType}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <RadioOption
            value="text"
            label="Use Text Logo"
            description="Display your brand name as text in the header"
            icon={Type}
          />
          <RadioOption
            value="image"
            label="Use Image Logo"
            description="Upload and display a custom logo image"
            icon={ImageIcon}
          />
        </RadioGroup>

        {logoType === 'text' && (
          <div className="mt-6">
            <SettingsCard
              title="Text Logo Configuration"
              description="Configure your text-based logo"
              icon={Type}
              iconColor="green"
            >
              <InputField
                label="Text Logo Content"
                value={textLogoContent}
                onChange={(e) => setTextLogoContent(e.target.value)}
                placeholder="Enter your brand name"
                description="The text that will be displayed as your logo"
              />
            </SettingsCard>
          </div>
        )}

        {logoType === 'image' && (
          <div className="mt-6">
            <SettingsCard
              title="Image Logo Configuration"
              description="Upload and configure your image logo"
              icon={ImageIcon}
              iconColor="purple"
            >
              <div className="space-y-6">
                <FileUploadField
                  label="Upload Logo Image"
                  onChange={handleFileChange}
                  accept="image/*"
                  description="Recommended: SVG or PNG. Max size: 2MB."
                />
                <LogoPreview />
              </div>
            </SettingsCard>
          </div>
        )}
      </SettingsCard>

      {/* Save Button */}
      <SaveButton onClick={handleSave} children="Save Logo Settings" />

      {/* Note */}
      <InfoAlert description="Note: The application header will dynamically update based on these settings after saving. This might require integration in Navbar components." />
    </div>
  );
}
