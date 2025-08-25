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
import { PageNavbar } from '@/app/(protected)/account/page-navbar';
import {
  ToolbarDescription,
  ToolbarPageTitle,
} from '@/app/components/partials/common/toolbar';
import { SelectEventContent } from './content';

// import { EventManagement } from './content';

function EventManagementPage() {
  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Create Event: Select a Template" />
            <ToolbarDescription>Super Admin (Super Admin)</ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="outline" asChild>
              <Link href="/events">Cancel</Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <SelectEventContent />
        {/* <EventManagement /> */}
      </Container>
    </Fragment>
  );
}

export default EventManagementPage;
