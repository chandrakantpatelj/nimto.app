import { Fragment } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import {
  Toolbar,
  ToolbarActions,
  ToolbarHeading,
} from '@/components/common/toolbar';
import { PageNavbar } from '@/app/(protected)/account/page-navbar';
import { ToolbarPageTitle } from '@/app/components/partials/common/toolbar';
import { ManageGuestContent } from './content';

function EventManagementPage() {
  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Manage Invitations: Birthday Party" />
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="secondary" appearance="ghost" asChild>
              <Link href="/events">
                <ArrowLeft /> Back
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <ManageGuestContent />
      </Container>
    </Fragment>
  );
}

export default EventManagementPage;
