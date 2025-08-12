import {ReactElement} from 'react';
import {Navigate, Outlet} from 'react-router-dom';
import {useAuth} from '../use-auth';
import {NotFoundPage} from '@common/ui/not-found-page/not-found-page';
import {useSettings} from '@ui/settings/use-settings';

interface Props {
  children?: ReactElement;
  permission?: string;
  requireLogin?: boolean;
}
export function AuthRoute({children, permission, requireLogin = true}: Props) {
  const {isLoggedIn, hasPermission, isSubscribed} = useAuth();
  const {billing} = useSettings();
  if (
    (requireLogin && !isLoggedIn) ||
    (permission && !hasPermission(permission))
  ) {
    if (isLoggedIn) {
      return billing.enable && !isSubscribed ? (
        <Navigate to="/pricing" replace />
      ) : (
        <NotFoundPage />
      );
    }
    return <Navigate to="/login" replace />;
  }
  return children || <Outlet />;
}
