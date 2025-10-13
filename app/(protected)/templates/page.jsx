'use client';

import React, { Fragment } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    CirclePlus,
    Settings,
} from 'lucide-react';
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
import { useRoleBasedAccess } from '@/hooks/use-role-based-access';
import { useSession } from 'next-auth/react';
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
            <Container>
                <Toolbar>
                    <ToolbarHeading>
                        <ToolbarPageTitle />
                        <ToolbarDescription>Browse and manage templates</ToolbarDescription>
                    </ToolbarHeading>
                    <ToolbarActions>
                        {isAuthenticated && isSuperAdmin && (
                            <Button variant="outline" onClick={handleCategoryManagement} className="hidden sm:flex">
                                <Settings /> Manage Categories
                            </Button>
                        )}
                        {isAuthenticated && isSuperAdmin && (
                            <Button variant="outline" onClick={handleCategoryManagement} className="flex sm:hidden h-9 w-9 p-0">
                                <Settings className="h-4 w-4" />
                            </Button>
                        )}
                        {isAuthenticated && isAdmin && (
                            <Button variant="primary" asChild className="hidden sm:flex">
                                <Link href="/templates/design">
                                    <CirclePlus /> Create New Template
                                </Link>
                            </Button>
                        )}
                        {isAuthenticated && isAdmin && (
                            <Button variant="primary" asChild className="flex sm:hidden h-9 w-9 p-0">
                                <Link href="/templates/design">
                                    <CirclePlus className="h-4 w-4" />
                                </Link>
                            </Button>
                        )}
                    </ToolbarActions>
                </Toolbar>
            </Container>
            <div className="relative bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 text-white overflow-hidden">
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-500/20"></div>
                {/* <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
                Your Template Gallery
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-8 md:mb-10 text-white/95 max-w-xs sm:max-w-2xl md:max-w-3xl mx-auto font-light px-4 sm:px-0">
                Create stunning invitations that make every celebration unforgettable
              </p>
              <div className="flex justify-center px-4 sm:px-0">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 w-full sm:w-auto">
                  <CirclePlus className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
                  Browse Templates
                </Button>
              </div>
            </div>
          </div> */}
            </div>



            {/* Browse Categories Section - Moved to Top */}
            <Container>
                <EnhancedTemplateManagement />
            </Container>
        </Fragment>
    );
}

export default TemplateManagementPage;
