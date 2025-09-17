'use client';

import React from 'react';
import { Mail, Users, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

function InvitationConfirmationPopup({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  guests = [],
  loading = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-background/20 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Send Invitations?
              </h3>
              <p className="text-sm text-muted-foreground">
                Would you like to send email invitations to your guests?
              </p>
            </div>
          </div>
            <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">
                Guests to invite ({guests.length})
              </span>
            </div>

            {guests.length > 0 && (
              <div className="max-h-32 overflow-y-auto space-y-2">
                {guests.map((guest, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-muted rounded-md"
                  >
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {guest.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {guest.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {guest.contact}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-border">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            No, Create Event Only
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Yes, Send Invitations
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default InvitationConfirmationPopup;
