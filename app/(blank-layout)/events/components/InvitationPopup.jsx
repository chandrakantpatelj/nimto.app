'use client';

import React from 'react';
import { Mail, Save, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AdvancedProcessingLoader from '@/components/common/advanced-processing-loader';

function InvitationPopup({
  isOpen,
  onClose,
  onSendToAll,
  onSendToNew,
  onUpdateOnly,
  newGuestsCount,
  totalGuestsCount,
  isLoading,
}) {
  if (!isOpen) return null;

  // Show only loader when loading
  if (isLoading) {
    return (
      <AdvancedProcessingLoader
        isVisible={true}
        title="Processing Invitations"
        description="Please wait while we process your invitations..."
        tasks={[
          { icon: '📧', text: 'Sending invitations...' },
          { icon: '📊', text: 'Updating guest list...' },
          { icon: '💾', text: 'Saving changes...' },
        ]}
      />
    );
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-background/20 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">
            Send Invitations
          </h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-muted-foreground mb-4">
              {newGuestsCount > 0
                ? `You have ${totalGuestsCount} guest${totalGuestsCount > 1 ? 's' : ''} in your list (${newGuestsCount} newly added). Choose how you'd like to handle invitations:`
                : `You have ${totalGuestsCount} guest${totalGuestsCount > 1 ? 's' : ''} in your list. Choose how you'd like to handle invitations:`}
            </p>

            {newGuestsCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-blue-800">
                  <Users className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {newGuestsCount} new guest{newGuestsCount > 1 ? 's' : ''}{' '}
                    added
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            <Button
              onClick={onSendToAll}
              className="w-full justify-start gap-3 h-12 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Mail className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Send to All Guests</div>
                <div className="text-xs opacity-90">
                  Send invitations to all {totalGuestsCount} guests
                </div>
              </div>
            </Button>

            {newGuestsCount > 0 && (
              <Button
                onClick={onSendToNew}
                className="w-full justify-start gap-3 h-12 bg-green-600 hover:bg-green-700 text-white"
              >
                <Mail className="w-4 h-4" />
                <div className="text-left">
                  <div className="font-medium">Send to New Guests Only</div>
                  <div className="text-xs opacity-90">
                    Send invitations only to {newGuestsCount} new guest
                    {newGuestsCount > 1 ? 's' : ''}
                  </div>
                </div>
              </Button>
            )}

            <Button
              onClick={onUpdateOnly}
              className="w-full justify-start gap-3 h-12 bg-gray-600 hover:bg-gray-700 text-white"
            >
              <Save className="w-4 h-4" />
              <div className="text-left">
                <div className="font-medium">Update Event Only</div>
                <div className="text-xs opacity-90">
                  Save changes without sending invitations
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InvitationPopup;
