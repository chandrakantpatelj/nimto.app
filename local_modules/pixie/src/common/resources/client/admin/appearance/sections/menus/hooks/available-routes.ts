import {MenuSectionConfig} from '../../../types/appearance-editor-config';
import mergedAppearanceConfig from '../../../config/merged-appearance-config';
import {MenuItemConfig} from '@common/menus/menu-config';

export function useAvailableRoutes(): Partial<MenuItemConfig>[] {
  const menuConfig = mergedAppearanceConfig.sections.menus.config;

  if (!menuConfig) return [];

  return (menuConfig as MenuSectionConfig).availableRoutes.map(route => {
    return {
      id: route,
      label: route,
      action: route,
      type: 'route',
      target: '_self',
    };
  });
}
