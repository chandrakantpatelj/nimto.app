import React, {ComponentType} from 'react';
import type {NotificationListItemProps} from '@common/notifications/notification-list';
import {User} from '@ui/types/user';
import {SvgIconProps} from '@ui/icons/svg-icon';
import {MessageDescriptor} from '@ui/i18n/message-descriptor';

export interface AdConfig {
  slot: string;
  description: MessageDescriptor;
  image: string;
}

export interface TagType {
  name: string;
  system?: boolean;
}

export interface CustomPageType {
  type: string;
  label: MessageDescriptor;
}

export interface HomepageOption {
  label: MessageDescriptor;
  value: string;
}

export interface SiteConfigContextValue {
  auth: {
    redirectUri: string;
    // redirect uri to use when homepage is set to login page, to avoid infinite loop
    secondaryRedirectUri?: string;
    adminRedirectUri: string;
    getUserProfileLink?: (user: User) => string;
    registerFields?: ComponentType;
    accountSettingsPanels?: {
      icon: ComponentType<SvgIconProps>;
      label: MessageDescriptor;
      id: string;
      component: ComponentType<{user: User}>;
    }[];
  };
  notifications: {
    renderMap?: Record<string, ComponentType<NotificationListItemProps>>;
  };
  tags: {
    types: TagType[];
  };
  customPages: {
    types: CustomPageType[];
  };
  settings?: {
    showIncomingMailMethod?: boolean;
    showRecaptchaLinkSwitch?: boolean;
  };
  admin: {
    ads: AdConfig[];
    channelsDocsLink?: string;
  };
  demo: {
    loginPageDefaults: 'singleAccount' | 'randomAccount';
    email?: string;
    password?: string;
  };
  homepage: {
    options: HomepageOption[];
  };
}

export const SiteConfigContext = React.createContext<SiteConfigContextValue>(
  null!,
);
