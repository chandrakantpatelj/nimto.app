'use client';

import React, { Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CirclePlus, Settings } from 'lucide-react';
import { useSession } from 'next-auth/react';
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
import { EnhancedTemplateManagement } from './content';

function TemplateManagementPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { roles } = useRoleBasedAccess();
  const isSuperAdmin = roles.isSuperAdmin;
  const isAdmin = roles.isAdmin;
  const isAuthenticated = !!session;

  const handleCategoryManagement = () => {
    router.push('/templates/categories');
  };

  return (
    <Fragment>
      {isAuthenticated && <PageNavbar />}

      {/* Hero Section */}
      {isAuthenticated && (isSuperAdmin || isAdmin) && (
        <Container>
          <Toolbar>
            <ToolbarActions>
              <Button variant="outline" onClick={handleCategoryManagement}>
                <Settings /> Manage Categories
              </Button>
              <Button variant="primary" asChild>
                <Link href="/templates/design">
                  <CirclePlus /> Create New Template
                </Link>
              </Button>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}
      {/* Browse Categories Section - Moved to Top */}
      <Container className={'w-full mx-auto p-4 lg:p-6'}>
        <EnhancedTemplateManagement />
      </Container>
    </Fragment>
  );
}

export default TemplateManagementPage;
