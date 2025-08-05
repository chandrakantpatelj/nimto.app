import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
  ToolbarTitle,
} from '@/components/common/toolbar';
import UserList from './components/user-list';

export const metadata = {
  title: 'Users',
  description: 'Manage users.',
};

export default async function Page() {
  return (
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
  );
}
