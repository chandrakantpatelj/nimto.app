import React, { Fragment } from 'react';
import Link from 'next/link';
import { CirclePlus, Sparkles } from 'lucide-react';
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
import { TemplateManagement } from './content';

function TemplateManagementPage() {
  return (
    <Fragment>
      <PageNavbar />
      <Container>
        <Toolbar>
          <ToolbarHeading>
            <ToolbarPageTitle />
            <ToolbarDescription>Super Admin (Super Admin)</ToolbarDescription>
          </ToolbarHeading>
          <ToolbarActions>
            <Button variant="secondary">
              <Sparkles /> Create With AI
            </Button>
            <Button variant="primary">
              <CirclePlus /> Create New Manually
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <TemplateManagement />
      </Container>
    </Fragment>
  );
}

export default TemplateManagementPage;
