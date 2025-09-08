'use client';

import { Fragment } from 'react';
import Link from 'next/link';
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
            {(roles.isHost ||
              roles.isApplicationAdmin ||
              roles.isSuperAdmin) && (
              <Button variant="primary" asChild>
                <Link href="/events/select-template">
                  <CirclePlus /> Create New Event
                </Link>
              </Button>
            )}
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
