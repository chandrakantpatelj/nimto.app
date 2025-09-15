import {
  AlertCircle,
  Award,
  Badge,
  Bell,
  Bitcoin,
  Book,
  Briefcase,
  Building,
  CalendarCheck,
  Captions,
  CheckCircle,
  Code,
  Coffee,
  File as DocumentIcon,
  Euro,
  Eye,
  File,
  FileQuestion,
  FileText,
  Flag,
  Ghost,
  Gift,
  Grid,
  Heart,
  HelpCircle,
  Image,
  Kanban,
  Key,
  Layout,
  LayoutDashboard,
  LayoutGrid,
  LifeBuoy,
  Mail,
  MessageSquare,
  Monitor,
  Network,
  Users as PeopleIcon,
  Plug,
  Settings,
  Share2,
  Shield,
  ShieldUser,
  ShoppingCart,
  SquareMousePointer,
  Star,
  TrendingUp,
  UserCheck,
  UserCircle,
  UserCog,
  Users,
  Briefcase as WorkIcon,
  Zap,
  Home
} from 'lucide-react';

// Base menu items that are common to all roles
const BASE_MENU_ITEMS = [
  {
    title: 'Home',
    icon: Home,
    path: '/',
  },
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/',
  },
  {
    title: 'My Profile',
    icon: UserCircle,
    path: '/my-profile',
  },
];

// Menu items for Super Admin and Application Admin
const ADMIN_MENU_ITEMS = [
  {
    title: 'Home',
    icon: Home,
    path: '/',
  },
  {
    title: 'Users',
    icon: UserCog,
    path: '/user-management/users',
  },
  {
    title: 'Roles',
    icon: Settings,
    path: '/user-management/roles',
  },
  {
    title: 'Events',
    icon: CalendarCheck,
    path: '/events',
  },
  {
    title: 'Templates',
    icon: FileText,
    path: '/templates',
  },
  {
    title: 'App Settings',
    icon: Settings,
    path: '/settings',
  },
  {
    title: 'Reporting',
    icon: FileText,
    path: '/reportings',
  },
  {
    title: 'Messaging',
    icon: MessageSquare,
    path: '/messaging',
  },
];

// Menu items for Host users
const HOST_MENU_ITEMS = [
  {
    title: 'Home',
    icon: Home,
    path: '/',
  },
  {
    title: 'Events',
    icon: CalendarCheck,
    path: '/events',
  },
  {
    title: 'Templates',
    icon: FileText,
    path: '/templates',
  },
  {
    title: 'Messaging',
    icon: MessageSquare,
    path: '/messaging',
  },
];

// Menu items for Attendee users
const ATTENDEE_MENU_ITEMS = [
  {
    title: 'Invited Events',
    icon: Mail,
    path: '/invited-events',
  },
];

/**
 * Get menu items based on user role
 * @param {string} userRole - The user's role (super-admin, application-admin, host, attendee)
 * @returns {Array} Array of menu items
 */
export function getRoleBasedMenuItems(userRole) {
  const role = userRole?.toLowerCase();

  switch (role) {
    case 'super-admin':
    case 'application-admin':
      return [...BASE_MENU_ITEMS, ...ADMIN_MENU_ITEMS];

    case 'host':
      return [...BASE_MENU_ITEMS, ...HOST_MENU_ITEMS];

    case 'attendee':
      return [...BASE_MENU_ITEMS, ...ATTENDEE_MENU_ITEMS];

    default:
      // Default to attendee menu for unknown roles
      return [...BASE_MENU_ITEMS, ...ATTENDEE_MENU_ITEMS];
  }
}

/**
 * Get menu items for a specific role with custom configuration
 * @param {string} userRole - The user's role
 * @param {Object} options - Additional options
 * @returns {Array} Array of menu items
 */
export function getCustomRoleBasedMenuItems(userRole, options = {}) {
  const baseItems = getRoleBasedMenuItems(userRole);

  // Apply any custom modifications based on options
  if (options.hideMyProfile) {
    return baseItems.filter((item) => item.path !== '/my-profile');
  }

  if (options.additionalItems) {
    return [...baseItems, ...options.additionalItems];
  }

  return baseItems;
}

// Export the main function for use in components
export { getRoleBasedMenuItems as MENU_SIDEBAR_ROLE_BASED };

