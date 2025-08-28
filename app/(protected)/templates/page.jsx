'use client';

import React, { Fragment, useState } from 'react';
import Link from 'next/link';
import { CirclePlus, Sparkles, Upload } from 'lucide-react';
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
import CreatewithAIpopup from './components/CreatewithAIpopup';
import { TemplateManagement } from './content';

function TemplateManagementPage() {
  const [showAIDialog, setShowAIDialog] = useState(false);

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
            <Button variant="secondary" onClick={() => setShowAIDialog(true)}>
              <Sparkles /> Create With AI
            </Button>
            {/* <Button variant="outline" asChild>
              <Link href="/templates/upload">
                <Upload /> Upload Template
              </Link>
            </Button> */}
            <Button variant="primary" asChild>
              <Link href="/templates/design">
                <CirclePlus /> Create New Template
              </Link>
            </Button>
          </ToolbarActions>
        </Toolbar>
      </Container>
      <Container>
        <TemplateManagement />
      </Container>
      <CreatewithAIpopup show={showAIDialog} setShow={setShowAIDialog} />
    </Fragment>
  );
}

export default TemplateManagementPage;
