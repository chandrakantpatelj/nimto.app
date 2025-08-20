'use client';

import React, { useState } from 'react';
import { Upload, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function EditProfile() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // State for form values
  const [fullName, setFullName] = useState('Super Admin');
  const [email, setEmail] = useState('superadmin@example.com');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSave = () => {
    // Handle save logic here
    console.log('Saving profile changes:', {
      fullName,
      email,
      selectedFile,
      previewUrl,
    });
  };

  return (
    <Card
      className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <CardHeader>
        <CardTitle
          className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          Profile Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Change Avatar Section */}
        <div className="space-y-4">
          <Label
            className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
          >
            Change Avatar
          </Label>
          <div className="flex items-center space-x-4">
            {/* Avatar Preview */}
            <div className="w-20 h-20 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700 flex items-center justify-center">
                  <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
                </div>
              )}
            </div>

            {/* File Upload */}
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() =>
                    document.getElementById('avatar-upload').click()
                  }
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <span
                  className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
                >
                  {selectedFile ? selectedFile.name : 'No File Chosen'}
                </span>
              </div>
              <input
                id="avatar-upload"
                type="file"
                accept="image/png,image/jpg,image/jpeg,image/gif"
                onChange={handleFileChange}
                className="hidden"
              />
              <p
                className={`text-xs mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                PNG, JPG, GIF up to 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Full Name Field */}
        <div className="space-y-2">
          <Label
            className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
          >
            Full Name
          </Label>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Email Address Field */}
        <div className="space-y-2">
          <Label
            className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
          >
            Email Address
          </Label>
          <div className="relative">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              disabled
              className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} pr-32`}
            />
            <span
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            >
              (Email cannot be changed)
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            Save Profile Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
