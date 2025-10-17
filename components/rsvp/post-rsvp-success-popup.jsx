'use client';

import { CheckCircle, Clock, LogIn, Mail, Phone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PostRSVPSuccessPopup({
  isOpen,
  onClose,
  onLogin,
  email,
  phone,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-200 dark:border-gray-700">
        {/* Header with gradient background */}
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-500 px-6 py-8 text-center">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">
            RSVP Submitted Successfully!
          </h3>
          <p className="text-green-100 text-sm">Thank you for your response</p>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* User Details */}
          {(email || phone) && (
            <div className="mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                We have your details:
              </p>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                {email && (
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                      <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {email}
                    </span>
                  </div>
                )}
                {phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center">
                      <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {phone}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Call to Action */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 text-center leading-relaxed">
            Create an account to manage your RSVPs and get updates about this
            event.
          </p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={onLogin}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Log In
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full h-12 border-2 border-gray-200 hover:border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800/50 font-medium transition-all duration-200"
            >
              <Clock className="h-4 w-4 mr-2" />
              Maybe later
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
