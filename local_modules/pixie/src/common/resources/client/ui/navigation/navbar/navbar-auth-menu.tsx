import {ReactElement, useContext} from 'react';
import {ListboxItemProps} from '@ui/forms/listbox/item';
import {SiteConfigContext} from '@common/core/settings/site-config-context';
import {useLogout} from '@common/auth/requests/logout';
import {useCustomMenu} from '@common/menus/use-custom-menu';
import {useSettings} from '@ui/settings/use-settings';
import {useAuth} from '@common/auth/use-auth';
import {useNavigate} from '@common/ui/navigation/use-navigate';
import {useThemeSelector} from '@ui/themes/theme-selector-context';
import {Menu, MenuItem, MenuTrigger} from '@ui/menu/menu-trigger';
import {NotificationsIcon} from '@ui/icons/material/Notifications';
import {Trans} from '@ui/i18n/trans';
import {PaymentsIcon} from '@ui/icons/material/Payments';
import {createSvgIconFromTree} from '@ui/icons/create-svg-icon';
import {AccountCircleIcon} from '@ui/icons/material/AccountCircle';
import {DarkModeIcon} from '@ui/icons/material/DarkMode';
import {LightModeIcon} from '@ui/icons/material/LightMode';
import {ExitToAppIcon} from '@ui/icons/material/ExitToApp';

interface Props {
  children: ReactElement;
  items?: ReactElement<ListboxItemProps>[];
}
export function NavbarAuthMenu({children, items}: Props) {
  const {auth} = useContext(SiteConfigContext);
  const logout = useLogout();
  const menu = useCustomMenu('auth-dropdown');
  const {notifications, themes} = useSettings();
  const {user, isSubscribed} = useAuth();
  const navigate = useNavigate();
  const {selectedTheme, selectTheme} = useThemeSelector();
  if (!selectedTheme || !user) return null;
  const hasUnreadNotif = !!user.unread_notifications_count;

  const notifMenuItem = (
    <MenuItem
      className="md:hidden"
      value="notifications"
      startIcon={<NotificationsIcon />}
      onSelected={() => {
        navigate('/notifications');
      }}
    >
      <Trans message="Notifications" />
      {hasUnreadNotif ? ` (${user.unread_notifications_count})` : undefined}
    </MenuItem>
  );

  const billingMenuItem = (
    <MenuItem
      value="billing"
      startIcon={<PaymentsIcon />}
      onSelected={() => {
        navigate('/billing');
      }}
    >
      <Trans message="Billing" />
    </MenuItem>
  );

  return (
    <MenuTrigger>
      {children}
      <Menu>
        {menu &&
          menu.items.map(item => {
            const Icon = item.icon && createSvgIconFromTree(item.icon);
            return (
              <MenuItem
                value={item.id}
                key={item.id}
                startIcon={Icon && <Icon />}
                onSelected={() => {
                  if (item.type === 'link') {
                    window.open(item.action, '_blank');
                  } else {
                    navigate(item.action);
                  }
                }}
              >
                <Trans message={item.label} />
              </MenuItem>
            );
          })}
        {auth.getUserProfileLink && (
          <MenuItem
            value="profile"
            startIcon={<AccountCircleIcon />}
            onSelected={() => {
              navigate(auth.getUserProfileLink!(user));
            }}
          >
            <Trans message="Profile page" />
          </MenuItem>
        )}
        {items?.map(item => item)}
        {notifications?.integrated ? notifMenuItem : undefined}
        {isSubscribed && billingMenuItem}
        {themes?.user_change && !selectedTheme.is_dark && (
          <MenuItem
            value="light"
            startIcon={<DarkModeIcon />}
            onSelected={() => {
              selectTheme('dark');
            }}
          >
            <Trans message="Dark mode" />
          </MenuItem>
        )}
        {themes?.user_change && selectedTheme.is_dark && (
          <MenuItem
            value="dark"
            startIcon={<LightModeIcon />}
            onSelected={() => {
              selectTheme('light');
            }}
          >
            <Trans message="Light mode" />
          </MenuItem>
        )}
        <MenuItem
          value="logout"
          startIcon={<ExitToAppIcon />}
          onSelected={() => {
            logout.mutate();
          }}
        >
          <Trans message="Log out" />
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}
