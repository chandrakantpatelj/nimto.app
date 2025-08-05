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

export const metadata = {
  title: 'Role Management',
  description: 'Manage user roles and permissions.',
};

export default async function Page() {
  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarTitle>User Management</ToolbarTitle>
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
  );
}
