'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import {
  ArrowRight,
  Calendar,
  FileText,
  LayoutDashboard,
  Moon,
  Sun,
  Home,
  UserCircle,
  UserCog,
  Shield,
  CalendarCheck,
  Settings,
  BarChart3,
  MessageSquare,
  Mail,
} from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/use-role-based-access';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const { roles } = useRoleBasedAccess();
  
  const isAuthenticated = status === 'authenticated' && session;

  const handleThemeToggle = (checked) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const getAuthButtonContent = () => {
    // if (roles.isSuperAdmin) {
    //   return (
    //     <>
    //       <LayoutDashboard className="h-4 w-4" />
    //       Go to Dashboard
    //     </>
    //   );
    // }
    if (roles.isAttendee) {
      return (
        <>
          <Calendar className="h-4 w-4" />
          Go to Events
        </>
      );
    }
    return (
      <>
        <FileText className="h-4 w-4" />
        Go to Templates
      </>
    );
  };

  const getAuthButtonHref = () => {
    if (roles.isSuperAdmin) return '/dashboard';
    if (roles.isAttendee) return '/invited-events';
    return '/templates';
  };

  // Get role-based menu items
  const getRoleBasedMenuItems = () => {
    const baseItems = [
      { title: 'Home', path: '/', icon: Home, key: 'home' },
      { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
      { title: 'My Profile', path: '/my-profile', icon: UserCircle, key: 'my-profile' },
    ];

    if (roles.isSuperAdmin || roles.isApplicationAdmin) {
      return [
        ...baseItems,
        { title: 'Users', path: '/user-management/users', icon: UserCog, key: 'users' },
        { title: 'Roles', path: '/user-management/roles', icon: Shield, key: 'roles' },
        { title: 'Events', path: '/events', icon: CalendarCheck, key: 'events' },
        { title: 'Templates', path: '/templates', icon: FileText, key: 'templates' },
        { title: 'App Settings', path: '/settings', icon: Settings, key: 'app-settings' },
        { title: 'Reporting', path: '/reportings', icon: BarChart3, key: 'reporting' },
        { title: 'Messaging', path: '/messaging', icon: MessageSquare, key: 'messaging' },
      ];
    }

    if (roles.isHost) {
      return [
        ...baseItems,
        { title: 'Events', path: '/events', icon: CalendarCheck, key: 'events' },
        { title: 'Templates', path: '/templates', icon: FileText, key: 'templates' },
        { title: 'Messaging', path: '/messaging', icon: MessageSquare, key: 'messaging' },
      ];
    }

    if (roles.isAttendee) {
      return [
        ...baseItems,
        { title: 'Invited Events', path: '/invited-events', icon: Mail, key: 'invited-events' },
      ];
    }

    // Default for non-authenticated users
    return [
      { title: 'Create Invitation', path: '/events', icon: FileText, key: 'create-invitation' },
      { title: 'Templates', path: '/templates', icon: FileText, key: 'templates' },
      { title: 'Gift Cards', path: '/store-client', icon: FileText, key: 'gift-cards' },
      { title: 'SignUp Sheets', path: '/events', icon: FileText, key: 'signup-sheets' },
      { title: 'Ideas', path: '/templates', icon: FileText, key: 'ideas' },
    ];
  };

  return (
    <header className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nimto
              </span>
            </Link>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-1">
            {getRoleBasedMenuItems().map((item) => {
              const IconComponent = item.icon;
              const isActive = pathname === item.path || 
                (item.path !== '/' && pathname.startsWith(item.path));
              
              return (
                <Link
                  key={item.key}
                  href={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  <IconComponent className={`h-4 w-4 transition-colors ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                  }`} />
                  <span className="text-sm font-medium">{item.title}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
              <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={handleThemeToggle}
                size="sm"
                className="data-[state=checked]:bg-gray-800"
              />
              <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            </div>

            {/* Auth Buttons or Role-based Navigation */}
            {isAuthenticated ? (
              <Button
                variant="default"
                asChild
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Link href={getAuthButtonHref()} className="flex items-center gap-2">
                  {getAuthButtonContent()}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  asChild
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                >
                  <Link href="/signin">Log In</Link>
                </Button>
                <Button 
                  variant="default" 
                  asChild
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
