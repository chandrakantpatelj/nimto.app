'use client';

import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarTitle,
} from '@/components/common/toolbar';
import PermissionList from './components/permission-list';
import { RouteGuard } from '@/components/common/route-guard';

export default function Page() {
  return (
    <RouteGuard 
      requiredRoles={['super-admin', 'application-admin']}
      redirectTo="/unauthorized"
    >
      <>
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarTitle>Permission Management</ToolbarTitle>
            </ToolbarHeading>
            <ToolbarActions></ToolbarActions>
          </Toolbar>
        </Container>
        <Container>
          <PermissionList />
        </Container>
      </>
    </RouteGuard>
  );
}
