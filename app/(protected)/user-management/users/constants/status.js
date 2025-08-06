import { UserStatus } from '@/app/models/user';

// Default status mapping
export const UserStatusProps = {
  [UserStatus.ACTIVE]: {
    label: 'Active',
    variant: 'success', // Green for active
  },
  [UserStatus.INACTIVE]: {
    label: 'Inactive',
    variant: 'warning', // Yellow for Inactive
  },
  [UserStatus.BLOCKED]: {
    label: 'Blocked',
    variant: 'destructive', // Red for Blocked
  },
};

// Function to get status properties
export const getUserStatusProps = (status) => {
  return UserStatusProps[status] || { label: 'Unknown', variant: 'success' };
};
