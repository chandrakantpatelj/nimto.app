'use client';

import { useState } from 'react';
import { ProfileDialog } from '@/app/(protected)/public-profile/profiles/default/components/profile-dialog';

export function ProfileModalContent() {
  const [profileModalOpen, setProfileModalOpen] = useState(true);
  const handleClose = () => {
    setProfileModalOpen(false);
  };

  return <ProfileDialog open={profileModalOpen} onOpenChange={handleClose} />;
}
