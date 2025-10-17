'use client';

import React from 'react';
import { CheckCircle, FileText, Save, Send, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

function PublishOptionsPopup({
  isOpen,
  onClose,
  onSaveAsDraft,
  onPublish,
  hasGuests,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-background/20 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-xl max-w-md w-full mx-4 border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Ready to Save Your Event?
              </h3>
              <p className="text-sm text-muted-foreground">
                Choose how you'd like to proceed
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
        <div className="p-6 space-y-4">
          {/* Save as Draft Option */}
          <div
            className="border border-border rounded-lg p-4 hover:border-gray-400 dark:hover:border-gray-500 transition-colors cursor-pointer group"
            onClick={onSaveAsDraft}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-gray-200 dark:group-hover:bg-gray-700 transition-colors">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  Save as Draft
                </h4>
                <p className="text-xs text-muted-foreground">
                  Save your event without publishing. You can edit and publish
                  it later. No invitations will be sent.
                </p>
              </div>
            </div>
          </div>

          {/* Publish Event Option */}
          <div
            className="border border-border rounded-lg p-4 hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer group"
            onClick={onPublish}
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 dark:group-hover:bg-purple-800 transition-colors">
                <Send className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-foreground mb-1">
                  Publish Event
                </h4>
                <p className="text-xs text-muted-foreground">
                  {hasGuests
                    ? 'Make your event live and optionally send invitations to your guests.'
                    : 'Make your event live. You can add guests later.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublishOptionsPopup;
