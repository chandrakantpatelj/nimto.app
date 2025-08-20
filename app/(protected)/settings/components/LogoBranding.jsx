'use client';

import { useState } from 'react';
import {
  BookImage,
  Image as ImageIcon,
  Info,
  Type,
  Upload,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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
    const isSelected = logoType === value;

    return (
      <div className="relative">
        <RadioGroupItem value={value} id={value} className="sr-only" />
        <Label
          htmlFor={value}
          className={`flex flex-row gap-4 items-center p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer ${
            isSelected
              ? isDark
                ? 'border-primary bg-gray-100'
                : 'border-primary bg-gray-100'
              : isDark
                ? 'border-gray-700 hover:border-gray-600'
                : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center  ${
              isSelected
                ? isDark
                  ? 'bg-primary/20'
                  : 'bg-gray-100'
                : isDark
                  ? 'bg-gray-700'
                  : 'bg-gray-100'
            }`}
          >
            <Icon
              className={`w-6 h-6 ${
                isSelected
                  ? isDark
                    ? 'text-primary'
                    : 'text-primary'
                  : isDark
                    ? 'text-gray-400'
                    : 'text-gray-500'
              }`}
            />
          </div>
          <div>
            <span
              className={`text-sm font-medium text-center ${
                isSelected
                  ? isDark
                    ? 'text-primary'
                    : 'text-primary'
                  : isDark
                    ? 'text-gray-200'
                    : 'text-gray-700'
              }`}
            >
              {label}
            </span>
            {description && (
              <p
                className={`text-xs  text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {description}
              </p>
            )}{' '}
          </div>
        </Label>
      </div>
    );
  };

  const InputField = ({ label, value, onChange, placeholder, description }) => (
    <div className="space-y-2">
      <Label
        className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
      >
        {label}
      </Label>
      <Input
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
    </div>
  );

  const FileUploadField = ({ label, onChange, accept, description }) => (
    <div className="space-y-2">
      <Label
        className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
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
        className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
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
              className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Logo Preview
            </span>
          </div>
        ) : (
          <div className="flex items-center space-x-3">
            <ImageIcon
              className={`w-8 h-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
            />
            <span
              className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              Logo Preview
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2
          className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          Logo & Branding
        </h2>
        <p
          className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
        >
          Configure your application's logo and branding settings
        </p>
      </div>

      {/* Logo Type Selection */}
      <div
        className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
      >
        <div
          className={`flex items-center space-x-2 mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          <BookImage className="w-5 h-5" />
          <span>Logo Type</span>
        </div>
        <div className="space-y-4">
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
            <div
              className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              {/* <CardHeader> */}
              <span
                className={`flex items-center space-x-2 mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                <Type className="w-5 h-5" />
                <span>Text Logo Configuration</span>
              </span>
              {/* </CardHeader> */}
              <div className="space-y-4">
                <InputField
                  label="Text Logo Content"
                  value={textLogoContent}
                  onChange={(e) => setTextLogoContent(e.target.value)}
                  placeholder="Enter your brand name"
                  description="The text that will be displayed as your logo"
                />
              </div>
            </div>
          )}
          {/* Image Logo Configuration */}
          {logoType === 'image' && (
            <div
              className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
            >
              <span
                className={`flex items-center space-x-2 mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                <ImageIcon className="w-5 h-5" />
                <span>Image Logo Configuration</span>
              </span>

              <div className="space-y-6">
                <FileUploadField
                  label="Upload Logo Image"
                  onChange={handleFileChange}
                  accept="image/*"
                  description="Recommended: SVG or PNG. Max size: 2MB."
                />

                <LogoPreview />
              </div>
            </div>
          )}{' '}
        </div>
      </div>

      {/* Text Logo Configuration */}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} variant="primary">
          Save Logo Settings
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
          Note: The application header will dynamically update based on these
          settings after saving. This might require integration in Navbar
          components.
        </p>
      </div>
    </div>
  );
}
