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

  const [fullName, setFullName] = useState('Super Admin');
  const [email] = useState('superadmin@example.com');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <Card
      className={`${isDark ? 'bg-gray-900/50 border-gray-700' : 'bg-white border-gray-200'}`}
    >
      <CardHeader>
        <CardTitle
          className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
        >
          Profile Information
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Avatar Upload */}
        <div>
          <div className="flex items-center gap-6">
            {/* Avatar Preview */}
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-8 h-8 text-gray-500 dark:text-gray-400" />
              )}
            </div>

            {/* File Upload */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    document.getElementById('avatar-upload')?.click()
                  }
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
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
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                PNG, JPG, GIF up to 2MB.
              </p>
            </div>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <Label className="text-sm font-medium">Full Name</Label>
          <Input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Email (Disabled) */}
        <div>
          <Label className="text-sm font-medium">Email Address</Label>
          <div className="relative">
            <Input
              type="email"
              value={email}
              disabled
              className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} pr-36`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
              (Email cannot be changed)
            </span>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <Button variant="primary">Save Profile Changes</Button>
        </div>
      </CardContent>
    </Card>
  );
}
