'use client';

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
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AppSettings,
  EmailServer,
  GoogleConfig,
  LandingPageContent,
  LogoBranding,
  PaymentGateway,
  SMSMessaging,
  UserNotifications,
} from './components';

export function Settings() {
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
              <TabsTrigger
                className="justify-start px-3 py-2 transition-colors
    data-[state=active]:bg-gray-50
    data-[state=active]:border-r-4 data-[state=active]:border-primary 
    data-[state=active]:text-primary
    data-[state=inactive]:text-gray-700
    data-[state=inactive]:hover:bg-gray-50
    rounded-r-none"
                value="app-config"
              >
                <UserRound /> App Settings
              </TabsTrigger>

              <TabsTrigger
                className="justify-start px-3 py-2 transition-colors
  data-[state=active]:bg-gray-50
  data-[state=active]:border-r-4 data-[state=active]:border-primary 
  data-[state=active]:text-primary
  data-[state=inactive]:text-gray-700
  data-[state=inactive]:hover:bg-gray-50
  rounded-r-none"
                value="landing-page"
              >
                <BookText /> Landing Page Content
              </TabsTrigger>
              <TabsTrigger
                className="justify-start px-3 py-2 transition-colors
  data-[state=active]:bg-gray-50
  data-[state=active]:border-r-4 data-[state=active]:border-primary 
  data-[state=active]:text-primary
  data-[state=inactive]:text-gray-700
  data-[state=inactive]:hover:bg-gray-50
  rounded-r-none"
                value="logo-branding"
              >
                <BookImage /> Logo & Branding
              </TabsTrigger>
              <TabsTrigger
                className="justify-start px-3 py-2 transition-colors
  data-[state=active]:bg-gray-50
  data-[state=active]:border-r-4 data-[state=active]:border-primary 
  data-[state=active]:text-primary
  data-[state=inactive]:text-gray-700
  data-[state=inactive]:hover:bg-gray-50
  rounded-r-none"
                value="notifications"
              >
                <Bell /> User Notifications
              </TabsTrigger>
              <TabsTrigger
                className="justify-start px-3 py-2 transition-colors
  data-[state=active]:bg-gray-50
  data-[state=active]:border-r-4 data-[state=active]:border-primary 
  data-[state=active]:text-primary
  data-[state=inactive]:text-gray-700
  data-[state=inactive]:hover:bg-gray-50
  rounded-r-none"
                value="payment-gateway"
              >
                <WalletCards /> Payment Gateway
              </TabsTrigger>
              <TabsTrigger
                className="justify-start px-3 py-2 transition-colors
  data-[state=active]:bg-gray-50
  data-[state=active]:border-r-4 data-[state=active]:border-primary 
  data-[state=active]:text-primary
  data-[state=inactive]:text-gray-700
  data-[state=inactive]:hover:bg-gray-50
  rounded-r-none"
                value="email-server"
              >
                <Mail /> Email Server
              </TabsTrigger>
              <TabsTrigger
                className="justify-start px-3 py-2 transition-colors
  data-[state=active]:bg-gray-50
  data-[state=active]:border-r-4 data-[state=active]:border-primary 
  data-[state=active]:text-primary
  data-[state=inactive]:text-gray-700
  data-[state=inactive]:hover:bg-gray-50
  rounded-r-none"
                value="sms-messaging"
              >
                <MessageCircleMore /> SMS/Messaging
              </TabsTrigger>
              <TabsTrigger
                className="justify-start px-3 py-2 transition-colors
  data-[state=active]:bg-gray-50
  data-[state=active]:border-r-4 data-[state=active]:border-primary 
  data-[state=active]:text-primary
  data-[state=inactive]:text-gray-700
  data-[state=inactive]:hover:bg-gray-50
  rounded-r-none"
                value="google-config"
              >
                <KeyRound /> Google Config
              </TabsTrigger>
            </TabsList>
          </Card>
        </div>
        <div className="py-2 col-span-12 md:col-span-9">
          <Card className="p-4">
            <TabsContent value="app-config">
              <AppSettings />
            </TabsContent>
            <TabsContent value="landing-page">
              <LandingPageContent />
            </TabsContent>
            <TabsContent value="logo-branding">
              <LogoBranding />
            </TabsContent>
            <TabsContent value="notifications">
              <UserNotifications />
            </TabsContent>
            <TabsContent value="payment-gateway">
              <PaymentGateway />
            </TabsContent>
            <TabsContent value="email-server">
              <EmailServer />
            </TabsContent>
            <TabsContent value="sms-messaging">
              <SMSMessaging />
            </TabsContent>
            <TabsContent value="google-config">
              <GoogleConfig />
            </TabsContent>
          </Card>
        </div>
      </Tabs>
    </>
  );
}
