'use client';

import React, { useState } from 'react';
import { Bell, Lock, User } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChangePassword } from './ChangePassword';
import { EditProfile } from './EditProfile';
import { Notification } from './Notification';

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState('edit-profile');

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
          <TabsTrigger
            value="edit-profile"
            className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary dark:data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-gray-200"
          >
            <User className="w-4 h-4" />
            <span>Edit Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="change-password"
            className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary dark:data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-gray-200"
          >
            <Lock className="w-4 h-4" />
            <span>Change Password</span>
          </TabsTrigger>
          <TabsTrigger
            value="notification"
            className="flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary dark:data-[state=active]:text-primary data-[state=active]:shadow-sm data-[state=inactive]:text-gray-600 dark:data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-gray-900 dark:data-[state=inactive]:hover:text-gray-200"
          >
            <Bell className="w-4 h-4" />
            <span>Notification</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="edit-profile" className="mt-6">
          <EditProfile />
        </TabsContent>

        <TabsContent value="change-password" className="mt-6">
          <ChangePassword />
        </TabsContent>

        <TabsContent value="notification" className="mt-6">
          <Notification />
        </TabsContent>
      </Tabs>
    </div>
  );
}
