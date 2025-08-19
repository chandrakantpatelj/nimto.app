'use client';

import { cva } from 'class-variance-authority';
import {
  Bell,
  BookImage,
  BookText,
  KeyRound,
  Mail,
  MessageCircleMore,
  UserRound,
  WalletCards,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function Settings() {
  const tabTrigger = cva('justify-start px-3 py-2 transition-colors', {
    variants: {
      state: {
        active: 'bg-blue-50 border-l-4 border-blue-500 text-blue-600',
        inactive: 'text-gray-700 hover:bg-gray-50',
      },
    },
    defaultVariants: {
      state: 'inactive',
    },
  });
  return (
    <>
      <Tabs
        defaultValue="app-config"
        orientation="vertical"
        className="grid grid-cols-12 gap-4 items-stretch"
      >
        <div className="py-2 col-span-12 md:col-span-3">
          <Card className="p-4">
            <TabsList
              variant="button"
              className="flex flex-col items-stretch *:justify-start"
            >
              <TabsTrigger className={cn(tabTrigger())} value="app-config">
                <UserRound /> App Settings
              </TabsTrigger>
              <TabsTrigger className={cn(tabTrigger())} value="landing-page">
                <BookText /> Landing Page Content
              </TabsTrigger>
              <TabsTrigger className={cn(tabTrigger())} value="logo-branding">
                <BookImage /> Logo & Branding
              </TabsTrigger>
              <TabsTrigger className={cn(tabTrigger())} value="notifications">
                <Bell /> User Notifications
              </TabsTrigger>
              <TabsTrigger className={cn(tabTrigger())} value="payment-gateway">
                <WalletCards /> Payment Gateway
              </TabsTrigger>
              <TabsTrigger className={cn(tabTrigger())} value="email-server">
                <Mail /> Email Server
              </TabsTrigger>
              <TabsTrigger className={cn(tabTrigger())} value="sms-messaging">
                <MessageCircleMore /> SMS/Messaging
              </TabsTrigger>
              <TabsTrigger className={cn(tabTrigger())} value="google-config">
                <KeyRound /> Google Config
              </TabsTrigger>
            </TabsList>
          </Card>
        </div>
        <div className="py-2 col-span-12 md:col-span-9">
          <Card className="p-4">
            <TabsContent value="app-config">
              Content for App Settings
            </TabsContent>
            <TabsContent value="landing-page">
              Content for Landing Page Content
            </TabsContent>
            <TabsContent value="logo-branding">
              Content for Logo & Branding
            </TabsContent>
            <TabsContent value="notifications">
              Content for Notifications
            </TabsContent>
            <TabsContent value="payment-gateway">
              Content for Payment Gateway
            </TabsContent>
            <TabsContent value="email-server">
              Content for Email Server
            </TabsContent>
            <TabsContent value="sms-messaging">
              Content for SMS/Messaging
            </TabsContent>
            <TabsContent value="google-config">
              Content for Google Config
            </TabsContent>
          </Card>
        </div>
      </Tabs>
    </>
  );
}
