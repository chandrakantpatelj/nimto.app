'use client';

import { Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { Container } from '@/components/common/container';
import { Toolbar, ToolbarHeading } from '@/components/common/toolbar';
import {
  ToolbarDescription,
  ToolbarPageTitle,
} from '@/app/components/partials/common/toolbar';
import { PageNavbar } from '../account/page-navbar';
import { Messaging } from './content';

function MessagingsPage() {
  const { data: session, status } = useSession();

  // Get user name and role from session
  const userName = session?.user?.name || 'User';
  const userRole = session?.user?.roleName || 'User';

  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>
              {userName} ({userRole})
            </ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </Container>
      <Container>
        <Messaging />
      </Container>
    </Fragment>
  );
}

export default MessagingsPage;
