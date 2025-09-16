import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/providers/toast-provider';

// Custom hook to use roles for selection
export const usePermissionSelectQuery = () => {
  const { toastError } = useToast();
  
  // Fetch roles for selection
  const fetchPermissionList = async () => {
    const response = await apiFetch('/api/user-management/permissions/select');

    if (!response.ok) {
      toastError(
        'Something went wrong while loading the records. Please try again.',
        {
          position: 'top-center',
        },
      );
    }

    return response.json();
  };

  return useQuery({
    queryKey: ['user-permission-select'],
    queryFn: fetchPermissionList,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  });
};
