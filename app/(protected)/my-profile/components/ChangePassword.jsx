'use client';

import { useState } from 'react';
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
          Change Your Password
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
          <Input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Enter your current password"
            className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* New Password */}
        <div className="space-y-2">
          <Label
            className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
          >
            New Password
          </Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter your new password"
            className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
          />
          <p
            className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
          >
            Must be at least 8 characters long.
          </p>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-2">
          <Label
            className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}
          >
            Confirm New Password
          </Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your new password"
            className={`${isDark ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300'}`}
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <Button varinat="primary" onClick={handleSave}>
            Update Password
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
