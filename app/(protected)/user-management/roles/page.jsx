'use client';

import { Container } from '@/components/common/container';
import { RouteGuard } from '@/components/common/route-guard';
import {
  Toolbar,
  ToolbarHeading,
  ToolbarTitle,
} from '@/components/common/toolbar';
import RoleList from './components/role-list';

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
              <ToolbarTitle>Role Management</ToolbarTitle>
            </ToolbarHeading>
          </Toolbar>
        </Container>
        <Container>
          <RoleList />
        </Container>
      </>
    </RouteGuard>
  );
}
