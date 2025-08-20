'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ChangePassword() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // State for form values
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSave = () => {
    // Handle save logic here
    console.log('Changing password:', {
      currentPassword,
      newPassword,
      confirmPassword,
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
          Change Password
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Password */}
        <div className="space-y-2">
          <Label
            className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
          >
            Current Password
          </Label>
          <div className="relative">
            <Input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                isDark
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {showCurrentPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label
            className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
          >
            New Password
          </Label>
          <div className="relative">
            <Input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter your new password"
              className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                isDark
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {showNewPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          <p
            className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Password must be at least 8 characters long and contain uppercase,
            lowercase, number, and special character.
          </p>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-2">
          <Label
            className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
          >
            Confirm New Password
          </Label>
          <div className="relative">
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your new password"
              className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded ${
                isDark
                  ? 'text-gray-400 hover:text-gray-200'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            Change Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
