import { Fragment } from 'react';
import { Container } from '@/components/common/container';
import { Toolbar, ToolbarHeading } from '@/components/common/toolbar';
import {
  ToolbarDescription,
  ToolbarPageTitle,
} from '@/app/components/partials/common/toolbar';
import { PageNavbar } from '../account/page-navbar';
import { Settings } from './content';

function SettingsPage() {
  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>Super Admin (Super Admin)</ToolbarDescription>
          </ToolbarHeading>
        </Toolbar>
      </Container>
      <Container>
        <Settings />
      </Container>
    </Fragment>
  );
}

export default SettingsPage;
