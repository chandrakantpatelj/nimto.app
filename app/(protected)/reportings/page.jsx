import { Fragment } from 'react';
import { Container } from '@/components/common/container';
import { Toolbar, ToolbarHeading } from '@/components/common/toolbar';
import {
  ToolbarDescription,
  ToolbarPageTitle,
} from '@/app/components/partials/common/toolbar';
import { PageNavbar } from '../account/page-navbar';
import { Reporting } from './content';

function ReportingsPage() {
  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle text="Reporting & Analytics" />
            <ToolbarDescription>Super Admin (Super Admin)</ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </Container>
      <Container>
        <Reporting />
      </Container>
    </Fragment>
  );
}

export default ReportingsPage;
