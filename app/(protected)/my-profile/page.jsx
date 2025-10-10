'use client';

import { Fragment, useEffect, useState } from 'react';
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
    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id) {
            // Fetch user profile from API
            fetch(`/api/user-management/users/${session.user.id}`)
                .then(res => res.ok ? res.json() : Promise.reject(res))
                .then(data => {
                    setUserProfile(data);
                    setLoadingProfile(false);
                })
                .catch(() => setLoadingProfile(false));
        }
    }, [status, session]);

    if (status === 'loading' || loadingProfile) {
        return <div>Loading...</div>;
    }

    if (!session) {
        return <div>Unauthorized</div>;
    }

    if (!userProfile) {
        return <div>User not found</div>;
    }

    return (
        <Fragment>
            <PageNavbar />
            <Container>
                <Toolbar>
                    <ToolbarHeading>
                        <ToolbarPageTitle />
                        <ToolbarDescription>
                            {userProfile ? `${userProfile.name} (${userProfile.role?.name || userProfile.role?.slug || ''})` : 'Loading...'}
                        </ToolbarDescription>
                    </ToolbarHeading>
                </Toolbar>
            </Container>
            <Container>
                <MyProfile user={userProfile} />
            </Container>
        </Fragment>
    );
}

export default MyProfilePage;