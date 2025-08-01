'use client';

import { Fragment } from 'react';
import {
  Toolbar,
  ToolbarActions,
  ToolbarDescription,
  ToolbarHeading,
  ToolbarPageTitle,
} from '@/partials/common/toolbar';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/common/container';
import { NetworkUserCardsTeamCrewContent } from '@/app/(protected)/network/user-cards/team-crew/content';

export default function NetworkUserCardsTeamCrewPage() {
  const { settings } = useSettings();

  return (
    <Fragment>
      {settings?.layout === 'demo1' && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription>
                Central Hub for Personal Customization
              </ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              <Button variant="outline">Upload CSV</Button>
              <Button variant="primary">Add User</Button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}
      <Container>
        <NetworkUserCardsTeamCrewContent />
      </Container>
    </Fragment>
  );
}
