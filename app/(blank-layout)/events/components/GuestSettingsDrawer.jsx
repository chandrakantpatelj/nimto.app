'use client';

import React, { useState } from 'react';
import { Baby, Calendar, Lock, Shield, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

function GuestSettingsDrawer({ isOpen, onClose }) {
  const [settings, setSettings] = useState({
    privateGuestList: false,
    allowPlusOnes: false,
    allowMaybeRSVP: true,
    familyHeadcount: false,
    limitEventCapacity: false,
  });

  const handleToggle = (setting) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: !prev[setting],
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[500px] bg-card shadow-lg z-50 transform transition-all duration-300 ease-out border-l border-border">
        {/* Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h2 className="text-lg font-bold text-foreground dark:text-white">
                  Guest Settings
                </h2>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 overflow-y-auto h-[calc(100vh-140px)]">
          {/* Private Guest List */}
          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 rounded-lg mt-0.5">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">
                    Private Guest List
                  </Label>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Only you can see the full guest list.
                  </p>
                </div>
                <Switch
                  checked={settings.privateGuestList}
                  onCheckedChange={() => handleToggle('privateGuestList')}
                />
              </div>
            </div>
          </div>

          {/* Allow Plus Ones */}
          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="p-2 bg-green-50 dark:bg-green-950/50 rounded-lg mt-0.5">
              <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">
                    Allow 'Plus Ones'
                  </Label>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Let guests specify how many people they're bringing.
                  </p>
                </div>
                <Switch
                  checked={settings.allowPlusOnes}
                  onCheckedChange={() => handleToggle('allowPlusOnes')}
                />
              </div>
            </div>
          </div>

          {/* Allow Maybe RSVP */}
          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg mt-0.5">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">
                    Allow 'Maybe' RSVP
                  </Label>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Let guests RSVP 'Maybe' if they aren't ready to commit.
                  </p>
                </div>
                <Switch
                  checked={settings.allowMaybeRSVP}
                  onCheckedChange={() => handleToggle('allowMaybeRSVP')}
                />
              </div>
            </div>
          </div>

          {/* Family Headcount */}
          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg mt-0.5">
              <Baby className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">
                    Family Headcount
                  </Label>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Prompt for adults and kids attending.
                  </p>
                </div>
                <Switch
                  checked={settings.familyHeadcount}
                  onCheckedChange={() => handleToggle('familyHeadcount')}
                />
              </div>
            </div>
          </div>

          {/* Limit Event Capacity */}
          <div className="flex items-start space-x-3 p-4 bg-muted/50 rounded-lg border border-border">
            <div className="p-2 bg-orange-50 dark:bg-orange-950/50 rounded-lg mt-0.5">
              <Shield className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <Label className="text-sm font-medium text-foreground">
                    Limit Event Capacity
                  </Label>
                  <p className="text-xs mt-1 text-muted-foreground">
                    Set a max number of guests who can RSVP 'Yes'.
                  </p>
                </div>
                <Switch
                  checked={settings.limitEventCapacity}
                  onCheckedChange={() => handleToggle('limitEventCapacity')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 bg-card border-t border-border">
          <Button
            onClick={onClose}
            className="w-full bg-primary text-white hover:bg-primary-700 transition-colors py-2.5"
          >
            Done
          </Button>
        </div>
      </div>
    </>
  );
}

export default GuestSettingsDrawer;
