'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTheme } from 'next-themes';
import { useState, useEffect } from 'react';
import {
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
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/use-role-based-access';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { UserDropdownMenu } from '@/app/components/partials/topbar/user-dropdown-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const { roles } = useRoleBasedAccess();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isAuthenticated = status === 'authenticated' && session;

  const handleThemeToggle = (checked) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Handle scroll behavior and mobile menu
  useEffect(() => {
    const handleScroll = () => {
      // Close mobile menu when scrolling on mobile devices
      if (isMobileMenuOpen && window.innerWidth < 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    // Handle window resize
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    // Add event listeners
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);


  // Get main navigation items (always visible)
  const getMainNavItems = () => {
    const baseItems = [
      { title: 'Home', path: '/', icon: Home, key: 'home' },
      { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, key: 'dashboard' },
    ];

    if (roles.isSuperAdmin || roles.isApplicationAdmin || roles.isHost) {
      return [
        ...baseItems,
        { title: 'Events', path: '/events', icon: CalendarCheck, key: 'events' },
        { title: 'Templates', path: '/templates', icon: FileText, key: 'templates' },
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

  // Get dropdown menu items (admin/settings items)
  const getDropdownItems = () => {
    if (roles.isSuperAdmin || roles.isApplicationAdmin) {
      return [
        { title: 'My Profile', path: '/my-profile', icon: UserCircle, key: 'my-profile' },
        { title: 'Users', path: '/user-management/users', icon: UserCog, key: 'users' },
        { title: 'Roles', path: '/user-management/roles', icon: Shield, key: 'roles' },
        { title: 'App Settings', path: '/settings', icon: Settings, key: 'app-settings' },
        { title: 'Reporting', path: '/reportings', icon: BarChart3, key: 'reporting' },
        { title: 'Messaging', path: '/messaging', icon: MessageSquare, key: 'messaging' },
      ];
    }

    if (roles.isHost) {
      return [
        { title: 'My Profile', path: '/my-profile', icon: UserCircle, key: 'my-profile' },
        { title: 'Messaging', path: '/messaging', icon: MessageSquare, key: 'messaging' },
      ];
    }

    if (roles.isAttendee) {
      return [
        { title: 'My Profile', path: '/my-profile', icon: UserCircle, key: 'my-profile' },
      ];
    }

    return [];
  };

  // Get all menu items for mobile (combines main nav and dropdown items)
  const getAllMenuItems = () => {
    return [...getMainNavItems(), ...getDropdownItems()];
  };

  return (
    <>
      {/* Sticky Header */}
      <header className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm fixed top-0 z-50 supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-gray-900/80">
      <div className="mx-auto sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group" onClick={closeMobileMenu}>
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg sm:text-xl">N</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Nimto
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Main Navigation Items */}
            {getMainNavItems().map((item) => {
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

            {/* More Menu Dropdown */}
            {getDropdownItems().length > 0 && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 whitespace-nowrap group ${
                      getDropdownItems().some(item => 
                        pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))
                      )
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <Settings className={`h-4 w-4 transition-colors ${
                      getDropdownItems().some(item => 
                        pathname === item.path || (item.path !== '/' && pathname.startsWith(item.path))
                      )
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                    }`} />
                    <span className="text-sm font-medium">More</span>
                    <ChevronDown className="h-3 w-3 transition-colors text-gray-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  {getDropdownItems().map((item) => {
                    const IconComponent = item.icon;
                    const isActive = pathname === item.path || 
                      (item.path !== '/' && pathname.startsWith(item.path));
                    
                    return (
                      <DropdownMenuItem key={item.key} asChild>
                        <Link
                          href={item.path}
                          className={`flex items-center gap-2 w-full ${
                            isActive
                              ? 'text-blue-600 dark:text-blue-400 font-semibold'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          <IconComponent className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Theme Toggle - Hidden on very small screens */}
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
              <UserDropdownMenu
                trigger={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex w-9 h-9 items-center gap-2  p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <img
                      className="w-full h-full rounded-full border border-gray-200 dark:border-gray-700"
                      src={session?.user?.avatar || '/media/avatars/300-2.png'}
                      alt="User avatar"
                    />
                  </Button>
                }
              />
            ) : (
              <div className="hidden sm:flex items-center space-x-3">
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

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={toggleMobileMenu}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md supports-[backdrop-filter]:bg-white/80 supports-[backdrop-filter]:dark:bg-gray-900/80">
            <div className="px-2 pt-2 pb-3 space-y-1">
             

              {/* Mobile Menu Items */}
              {getAllMenuItems().map((item) => {
                const IconComponent = item.icon;
                const isActive = pathname === item.path || 
                  (item.path !== '/' && pathname.startsWith(item.path));
                
                return (
                  <Link
                    key={item.key}
                    href={item.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-100'
                    }`}
                  >
                    <IconComponent className={`h-5 w-5 transition-colors ${
                      isActive 
                        ? 'text-blue-600 dark:text-blue-400' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                    }`} />
                    <span className="text-sm font-medium">{item.title}</span>
                  </Link>
                );
              })}

              {/* Mobile Auth Buttons for non-authenticated users */}
              {!isAuthenticated && (
                <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50 space-y-2">
                  <Button 
                    variant="ghost" 
                    asChild
                    className="w-full justify-start text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    onClick={closeMobileMenu}
                  >
                    <Link href="/signin">Log In</Link>
                  </Button>
                  <Button 
                    variant="default" 
                    asChild
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    onClick={closeMobileMenu}
                  >
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </header>
    </>
  );
}
