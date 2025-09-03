'use client';

import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarTitle,
} from '@/components/common/toolbar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import RoleList from './components/role-list';
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
              <ToolbarTitle>Role Management</ToolbarTitle>
            </ToolbarHeading>
            <ToolbarActions>
              <Button variant="destructive">
                <Plus className="mr-2 h-4 w-4" />
                Create New Role
              </Button>
            </ToolbarActions>
          </Toolbar>
        </Container>
        <Container>
          <RoleList />
        </Container>
      </>
    </RouteGuard>
  );
}
