'use client';

import React from 'react';
import { Mail, Save, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
      <div className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-3"></div>
          <p className="text-sm text-gray-600">Processing...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/20 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Send Invitations
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
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
