'use client';

import { Fragment } from 'react';
import { CirclePlus } from 'lucide-react';
import { useRoleBasedAccess } from '@/hooks/use-role-based-access';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/common/toolbar';
import {
  ToolbarDescription,
  ToolbarPageTitle,
} from '@/app/components/partials/common/toolbar';
import { PageNavbar } from '../account/page-navbar';
import { RoleBasedEventContent } from './components/role-based-content';

function EventManagementPage() {
  const { user, roles, designVariants } = useRoleBasedAccess();

  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Events" />
            <ToolbarDescription>
              {user?.name} ({user?.roleName})
            </ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            {/* {(roles.isHost || roles.isApplicationAdmin) && ( */}
            <Button variant="primary" asChild>
              <a href="/events/select-template">
                <CirclePlus /> Create New Event
              </a>
            </Button>
            {/* )} */}
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <RoleBasedEventContent />
      </Container>
    </Fragment>
  );
}

export default EventManagementPage;
