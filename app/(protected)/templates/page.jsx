'use client';

import React, { Fragment, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    CirclePlus,
    Sparkles,
    Upload,
    Settings,
    Gift,
    Users
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
import CreatewithAIpopup from './components/CreatewithAIpopup';
import { EnhancedTemplateManagement } from './content';

function TemplateManagementPage() {
    const router = useRouter();
    const [showAIDialog, setShowAIDialog] = useState(false);
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
            <Container className={ "w-full mx-auto p-4 lg:p-6" }>
                <EnhancedTemplateManagement />
            </Container>

            {/* Action Cards Section */}
            {/*<Container>*/}
            {/*  <div className="py-8 sm:py-12 md:py-16">*/}
            {/*    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 sm:mb-10 md:mb-12 text-center px-4 sm:px-0">*/}
            {/*      What do you want to do today?*/}
            {/*    </h2>*/}
            {/*    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8 px-4 sm:px-0">*/}
            {/*      <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 border border-blue-200 dark:border-blue-800">*/}
            {/*        <div className="bg-blue-500 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">*/}
            {/*          <CirclePlus className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />*/}
            {/*        </div>*/}
            {/*        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">Make an Invitation</h3>*/}
            {/*        <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">Let's get the party started.</p>*/}
            {/*        <Button asChild className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base">*/}
            {/*          <Link href="/templates/design">Get Started</Link>*/}
            {/*        </Button>*/}
            {/*      </div>*/}

            {/*      <div className="group bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 border border-green-200 dark:border-green-800">*/}
            {/*        <div className="bg-green-500 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">*/}
            {/*          <Upload className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />*/}
            {/*        </div>*/}
            {/*        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">Upload your own</h3>*/}
            {/*        <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">Add your own design, photo, or logo.</p>*/}
            {/*        <Button className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base">*/}
            {/*          Upload Design*/}
            {/*        </Button>*/}
            {/*      </div>*/}

            {/*      <div className="group bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 border border-purple-200 dark:border-purple-800">*/}
            {/*        <div className="bg-purple-500 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">*/}
            {/*          <Gift className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />*/}
            {/*        </div>*/}
            {/*        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">Send a gift instantly</h3>*/}
            {/*        <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">Shop eGift Cards from top retailers.</p>*/}
            {/*        <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-semibold py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base">*/}
            {/*          Send Gift*/}
            {/*        </Button>*/}
            {/*      </div>*/}

            {/*      <div className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 border border-orange-200 dark:border-orange-800">*/}
            {/*        <div className="bg-orange-500 p-3 sm:p-4 rounded-full w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">*/}
            {/*          <Users className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-white" />*/}
            {/*        </div>*/}
            {/*        <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 sm:mb-3">Create a SignUp Sheet</h3>*/}
            {/*        <p className="text-gray-600 dark:text-gray-400 mb-4 sm:mb-6 text-xs sm:text-sm leading-relaxed">Organize volunteers and tell them what to bring.</p>*/}
            {/*        <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 sm:py-3 rounded-lg transition-all duration-300 text-sm sm:text-base">*/}
            {/*          Create Sheet*/}
            {/*        </Button>*/}
            {/*      </div>*/}
            {/*    </div>*/}
            {/*  </div>*/}
            {/*</Container>*/}
            {/*{isAuthenticated && <CreatewithAIpopup show={showAIDialog} setShow={setShowAIDialog} />}*/}
        </Fragment>
    );
}

export default TemplateManagementPage;
