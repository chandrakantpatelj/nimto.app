'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { FileText, ArrowRight, Moon, Sun, LayoutDashboard } from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/use-role-based-access';
import { HomeTemplatesPreview } from '@/app/components/home-templates-preview';

export default function ComingSoonPage() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const { roles } = useRoleBasedAccess();
  const isAuthenticated = status === 'authenticated' && session;
  const isLoading = status === 'loading';

  const handleThemeToggle = (checked) => {
    setTheme(checked ? 'dark' : 'light');
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 w-full flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">N</span>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Nimto</span>
          </div>

          {/* Theme Switch and Auth Buttons */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={handleThemeToggle}
                size="sm"
              />
              <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>

            {/* Auth Buttons or Role-based Navigation */}
            {isAuthenticated ? (
              <Button variant="primary" asChild className="flex items-center gap-2">
                <Link href={roles.isSuperAdmin ? "/dashboard" : "/templates"}>
                  {roles.isSuperAdmin ? (
                    <>
                      <LayoutDashboard className="h-4 w-4" />
                      Go to Dashboard
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4" />
                      Go to Templates
                    </>
                  )}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button variant="primary" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="space-y-8">
            <div className="space-y-4">
              {isAuthenticated ? (
                <>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white">
                    Welcome{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Back!
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Ready to create stunning templates and manage your events? 
                    Let's get started!
                  </p>
                </>
              ) : (
                <>
                  <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white">
                    Create{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Amazing Events
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    Design stunning invitations, manage RSVPs, and host unforgettable events with our all-in-one platform.
                  </p>
                </>
              )}
            </div>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Event Management
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Create, organize, and manage events with ease
                </p>
              </div>

              <div className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  RSVP
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Easy event registration and attendance management
                </p>
              </div>

              <div className="p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Seamless Experience
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Intuitive interface designed for the best user experience
                </p>
              </div>
            </div>

            {/* Templates Preview Section */}
            <div className="mt-16">
              <HomeTemplatesPreview />
            </div>
            {/* CTA Section */}
            <div className="mt-16 space-y-6">
              {isAuthenticated ? (
                <>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Welcome back! Ready to create amazing templates?
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button size="lg" variant="primary" asChild className="flex items-center gap-2">
                      <Link href={roles.isSuperAdmin ? "/dashboard" : "/templates"}>
                        {roles.isSuperAdmin ? (
                          <>
                            <LayoutDashboard className="h-5 w-5" />
                            Go to Dashboard
                          </>
                        ) : (
                          <>
                            <FileText className="h-5 w-5" />
                            Go to Templates
                          </>
                        )}
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href={roles.isSuperAdmin ? "/templates" : "/events"}>
                        {roles.isSuperAdmin ? "View Templates" : "View Events"}
                      </Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Join thousands of event organizers creating memorable experiences!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button size="lg" variant="primary" asChild>
                      <Link href="/signup">Start Creating Events</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/signin">Sign In to Continue</Link>
                    </Button>
                  </div>
                </>
              )}

             
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full px-6 py-8 border-t border-gray-200/50 dark:border-gray-700/50 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 dark:text-gray-400">
              © 2025 Nimto. All rights reserved.
            </p>
            
          
          </div>
        </div>
      </footer>
    </div>
  );
}