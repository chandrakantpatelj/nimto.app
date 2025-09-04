'use client';

import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarTitle,
} from '@/components/common/toolbar';
import { RouteGuard } from '@/components/common/route-guard';
import UserList from './components/user-list';

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
              <ToolbarTitle>User Management</ToolbarTitle>
            </ToolbarHeading>
          </Toolbar>
        </Container>
        <Container>
          <UserList />
        </Container>
      </>
    </RouteGuard>
  );
}
