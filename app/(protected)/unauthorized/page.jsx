'use client';

import { useRouter } from 'next/navigation';
import { Shield, ArrowLeft, Home, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function UnauthorizedPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 overflow-hidden">
      <div className="w-full max-w-lg text-center">
        {/* Main Icon */}
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100 mb-6">
          <Shield className="h-12 w-12 text-red-600" />
        </div>

        {/* Main Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Access Restricted
        </h1>
        
        <p className="text-gray-600 text-lg mb-8 leading-relaxed">
          Sorry, you don't have permission to view this page. 
          Please contact your administrator if you need access.
        </p>

        {/* Action Buttons */}
        {/* <div className="space-y-3">
          <Button
            onClick={handleGoHome}
            className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            <Home className="mr-2 h-5 w-5" />
            Go to Dashboard
          </Button>
          
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="w-full h-12 border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Go Back
          </Button>
        </div> */}

        {/* Help Text */}
        {/* <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Lock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Need Help?</span>
          </div>
          <p className="text-sm text-blue-700">
            Contact your system administrator to request the necessary permissions.
          </p>
        </div> */}
      </div>
    </div>
  );
}
