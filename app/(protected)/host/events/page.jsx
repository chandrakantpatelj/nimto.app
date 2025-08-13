import { Fragment } from 'react';
import Link from 'next/link';
import { CirclePlus } from 'lucide-react';
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
import { PageNavbar } from '../../account/page-navbar';
import { EventManagement } from './content';

function EventManagementPage() {
  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Events" />
            <ToolbarDescription>Super Admin (Super Admin)</ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="primary" asChild>
              <Link href="/host/events/select-template">
                <CirclePlus /> Create New Event
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <EventManagement />
      </Container>
    </Fragment>
  );
}

export default EventManagementPage;
