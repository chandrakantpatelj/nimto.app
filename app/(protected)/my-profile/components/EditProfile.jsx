'use client';

import React, { useEffect, useState } from 'react';
import { getTimeZones } from '@/i18n/timezones';
import { Upload, User } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TimezoneSelect from '@/app/(protected)/user-management/settings/components/timezone-select';

export function EditProfile({ user }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const { data: session, update: updateSession } = useSession();

  // Initialize state from user prop
  const [fullName, setFullName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(user?.avatar || '');
  const [timezone, setTimezone] = useState(
    user?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Update state if user prop changes
  useEffect(() => {
    setFullName(user?.name || '');
    setEmail(user?.email || '');
    setPreviewUrl(user?.avatar || '');
    setTimezone(
      user?.timezone ||
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        'UTC',
    );
  }, [user]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Save Profile Handler
  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage('');
    try {
      let imageData = null;
      let imageFormat = 'png';

      if (selectedFile) {
        imageFormat = selectedFile.type.split('/')[1] || 'png';
        imageData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(selectedFile);
        });
      }

      const res = await fetch(
        '/api/user-management/users/[id]/update-userprofile',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: fullName,
            timezone,
            imageData,
            imageFormat,
          }),
        },
      );

      const result = await res.json();
      if (result.success) {
        setMessage(result.data?.message || 'Profile updated successfully.');
        if (result.data?.imageUrl) setPreviewUrl(result.data.imageUrl);

        // Update session with new user data
        if (updateSession && session?.user) {
          await updateSession({
            ...session,
            user: {
              ...session.user,
              name: fullName,
              avatar: result.data?.avatar || session.user.avatar,
              timezone: timezone,
            },
          });
        }
      } else {
        setMessage(result.error || 'Failed to update profile.');
      }
    } catch (err) {
      setMessage('An error occurred. Please try again.');
    } finally {
      setSaving(false);
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
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
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
          </div>

          {/* Right Column */}
          <div className="space-y-6">
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

            {/* Timezone Selector */}
            <div>
              <Label className="text-sm font-medium">Timezone</Label>
              <TimezoneSelect
                defaultValue={timezone}
                onChange={(value) => setTimezone(value)}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Select your local timezone.
              </p>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-6">
          <Button
            variant="primary"
            onClick={handleSaveProfile}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile Changes'}
          </Button>
        </div>
        {message && (
          <div className="pt-2 text-sm text-center text-green-600 dark:text-green-400">
            {message}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
