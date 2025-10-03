'use client';

import { Fragment } from 'react';
import { useSession } from 'next-auth/react';
import { Container } from '@/components/common/container';
import { Toolbar, ToolbarHeading } from '@/components/common/toolbar';
import {
    ToolbarDescription,
    ToolbarPageTitle,
} from '@/app/components/partials/common/toolbar';
import { PageNavbar } from '../account/page-navbar';
import { MyProfile } from './content';

function MyProfilePage() {
    const { data: session, status } = useSession();

    // Optionally handle loading state
    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    // Optionally handle unauthenticated state
    if (!session) {
        return <div>Unauthorized</div>;
    }

    const user = session.user;
    console.log('user profile page', session);

    return (
        <Fragment>
            <PageNavbar />
            <Container>
                <Toolbar>
                    <ToolbarHeading>
                        <ToolbarPageTitle />
                        <ToolbarDescription>
                            {user ? `${user.name} (${user.roleName || user.role || ''})` : 'Loading...'}
                        </ToolbarDescription>
                    </ToolbarHeading>
                </Toolbar>
            </Container>
            <Container>
                <MyProfile user={user} />
            </Container>
        </Fragment>
    );
}

export default MyProfilePage;