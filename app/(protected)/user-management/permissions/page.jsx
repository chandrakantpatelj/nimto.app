import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarTitle,
} from '@/components/common/toolbar';
import PermissionList from './components/permission-list';

export const metadata = {
  title: 'Permissions',
  description: 'Manage user permissions.',
};

export default async function Page() {
  return (
    <>
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarTitle>User Management</ToolbarTitle>
          </ToolbarHeading>
          <ToolbarActions></ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <PermissionList />
      </Container>
    </>
  );
}
