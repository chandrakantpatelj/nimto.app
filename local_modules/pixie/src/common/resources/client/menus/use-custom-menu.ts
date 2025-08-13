import {useAuth} from '../auth/use-auth';
import {useSettings} from '@ui/settings/use-settings';
import dot from 'dot-object';
import {useMemo} from 'react';
import {User} from '@ui/types/user';
import {MenuConfig, MenuItemConfig} from '@common/menus/menu-config';

export function useCustomMenu(menuOrPosition?: string | MenuConfig) {
  const settings = useSettings();
  const {user, hasPermission} = useAuth();

  return useMemo(() => {
    if (!menuOrPosition) {
      return null;
    }

    const menu =
      typeof menuOrPosition === 'string'
        ? settings.menus?.find(s => s.positions?.includes(menuOrPosition))
        : menuOrPosition;

    if (menu) {
      menu.items = menu.items.filter(item => {
        const hasRoles = (item.roles || []).every(
          a => user?.roles.find(b => b.id === a),
        );
        const hasPermissions = (item.permissions || []).every(a =>
          hasPermission(a),
        );
        const hasSettings =
          !item.settings ||
          Object.entries(item.settings).every(([key, value]) => {
            return dot.pick(key, settings) == value;
          });

        // make sure item has action, otherwise router link will error out
        return (
          item.action &&
          hasRoles &&
          hasPermissions &&
          hasSettings &&
          subscriptionStatusMatches(item, user)
        );
      });
    }

    return menu;
  }, [hasPermission, settings, menuOrPosition, user]);
}

function subscriptionStatusMatches(
  item: MenuItemConfig,
  user?: User | null,
): boolean {
  if (!item.subscriptionStatus) {
    return true;
  }
  const hasActiveSubscription = !!user?.subscriptions?.find(sub => sub.active);
  if (item.subscriptionStatus === 'subscribed') {
    return hasActiveSubscription;
  }
  return !hasActiveSubscription;
}
