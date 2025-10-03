'use client';

import { Card } from '@/components/ui/card';
import ProfileTabs from './components/ProfileTabs';

export function MyProfile({ user }) {
    return (
        <Card className="p-4">
            <ProfileTabs user={user} />
        </Card>
    );
}